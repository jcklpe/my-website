<script setup lang="ts">
  // Page-wide Gray-Scott reaction-diffusion "skin" over the paper-grid ground,
  // run on the GPU (WebGL2 ping-pong float textures) so it can be high-res,
  // smooth and fast at once — the CPU version couldn't resolve smooth coral at
  // this scale.
  //
  // Passes:
  //  - seed:    u=1,v=0 everywhere except a few localized nuclei → directed bloom
  //  - sim:     one Gray-Scott step per draw into RGBA16F (u=R, v=G), iterated
  //             ITERS_PER_FRAME times per rAF. Fertility (negative space) is a
  //             DRIFTING value-noise computed in-shader; the cursor lowers the
  //             local kill so coral REACHES toward it; sparse in-shader seeding
  //             keeps growth alive as the fertile field migrates.
  //  - display: samples v with linear filtering and applies a smoothstep
  //             threshold at full canvas resolution → crisp, smooth vector edges.
  //
  // Paused when hidden / during featured-media transitions; a single fully
  // developed frame under reduced motion. Fixed, behind content,
  // pointer-events:none. See docs/active-spikes/animation.md → Thread B.

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const transitionState = useFeaturedMediaTransitionState();

  // --- Taste knobs -----------------------------------------------------------
  const SIM_SCALE = 3; // css px per sim cell (smaller = finer sim)
  const MAX_SIM_COLS = 700; // cap sim width for perf
  const ITERS_PER_FRAME = 18; // sim steps per rendered frame (speed of life)
  // Gray-Scott params. Higher diffusion widens the Turing wavelength → larger,
  // smoother, connected coral (kept inside explicit-stepping stability).
  const DU = 0.32;
  const DV = 0.16;
  const DT = 0.6;
  const FEED = 0.0545;
  const KILL = 0.062;
  // Negative space + drift (all in-shader).
  const NOISE_FREQ = 3.0; // fertile blobs across the screen (bigger = busier)
  const NOISE_PERIOD = 256; // integer tile size; keeps drift bounded & precise
  const FERTILE_THRESH = 0.46; // value-noise level above which land is fertile
  const FERTILE_EDGE = 0.14; // softness of the fertile/barren boundary
  const BARREN_DECAY = 0.03; // v decay in barren land (carves negative space)
  const GLOBAL_DECAY = 0.0006; // slow death everywhere; balanced by seeding
  // Fertility drift per frame (noise units). Kept slow: if the field sweeps
  // faster than coral re-forms, coral trails behind each moving blob and the
  // whole thing shears into diagonal "wind-blown" streaks.
  const DRIFT_X = 0.00006;
  const DRIFT_Y = 0.000034;
  const SEED_PROB = 0.0005; // per-cell sparse spontaneous nucleation (fertile)
  const SEED_NUCLEI = 14; // localized starter blobs for the load bloom
  const NUCLEUS_RADIUS = 0.02; // uv radius of a starter blob
  const WARMUP_ITERS = 60; // develop a little before first paint
  const STATIC_ITERS = 2000; // reduced-motion: develop a full still frame
  // Cursor attraction (uv space; x corrected by aspect).
  const KILL_DROP = 0.018; // how much kill is lowered under the pointer
  const KILL_MIN = 0.044; // floor on the lowered kill
  const BOOST_RADIUS = 0.14; // uv radius of the pointer's growth zone
  // Title inhibitor: a soft, measured barren zone behind the hero wordmark so
  // less coral grows there and the title stays readable (no hard cutout).
  const INHIBIT_SELECTOR = '.hero-title';
  const INHIBIT_MARGIN = 1.15; // grow the measured rect a touch past the glyphs
  const INHIBIT_STRENGTH = 0.03; // extra v decay at the core of the zone
  const INHIBIT_INNER = 0.35; // fully-inhibited fraction of the ellipse
  const INHIBIT_OUTER = 1.1; // soft falloff reaches this far past the rect
  // Colour + threshold render.
  const COLOR: readonly [number, number, number] = [205, 222, 255]; // #cddeff
  const THRESH_LO = 0.13;
  const THRESH_HI = 0.22;
  const MAX_ALPHA = 0.62;

  const QUAD_VERT = `#version 300 es
  in vec2 aPos;
  out vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`;

  const SEED_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 outColor;
  uniform vec2 uNuclei[${SEED_NUCLEI}];
  uniform float uAspect;
  uniform float uRadius;
  void main() {
    float v = 0.0;
    for (int i = 0; i < ${SEED_NUCLEI}; i++) {
      vec2 d = vUv - uNuclei[i];
      d.x *= uAspect;
      if (length(d) < uRadius) v = 0.6;
    }
    outColor = vec4(v > 0.0 ? 0.2 : 1.0, v, 0.0, 1.0);
  }`;

  const SIM_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 outColor;
  uniform sampler2D uState;
  uniform vec2 uTexel;
  uniform float uDu, uDv, uDt, uFeed, uKill;
  uniform float uNoiseFreq, uFertileThresh, uFertileEdge;
  uniform float uGlobalDecay, uBarrenDecay;
  uniform vec2 uDrift;
  uniform float uNoisePeriod;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform float uPointerActive, uKillDrop, uKillMin, uBoostRadius;
  uniform float uSeedTime, uSeedProb;
  uniform vec2 uInhibitCenter, uInhibitRadius;
  uniform float uInhibitStrength, uInhibitInner, uInhibitOuter;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  // Tileable value noise: lattice indices wrap at uPeriod, so the field repeats
  // every uPeriod units. That lets the drift wrap within one period and keeps
  // the coordinates fed to hash()/fract() small — otherwise a long-running
  // drift grows the coordinate until float precision degrades the noise into
  // diagonal banding ("wind-blown" streaks).
  float vnoise(vec2 p, float period) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 i0 = mod(i, period);
    vec2 i1 = mod(i + 1.0, period);
    float a = hash(i0);
    float b = hash(vec2(i1.x, i0.y));
    float c = hash(vec2(i0.x, i1.y));
    float d = hash(i1);
    vec2 w = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
  }

  void main() {
    vec2 s = texture(uState, vUv).xy;
    float u = s.x;
    float v = s.y;
    vec2 lap = vec2(0.0);
    lap += texture(uState, vUv + vec2(-uTexel.x, 0.0)).xy * 0.2;
    lap += texture(uState, vUv + vec2(uTexel.x, 0.0)).xy * 0.2;
    lap += texture(uState, vUv + vec2(0.0, -uTexel.y)).xy * 0.2;
    lap += texture(uState, vUv + vec2(0.0, uTexel.y)).xy * 0.2;
    lap += texture(uState, vUv + vec2(-uTexel.x, -uTexel.y)).xy * 0.05;
    lap += texture(uState, vUv + vec2(uTexel.x, -uTexel.y)).xy * 0.05;
    lap += texture(uState, vUv + vec2(-uTexel.x, uTexel.y)).xy * 0.05;
    lap += texture(uState, vUv + vec2(uTexel.x, uTexel.y)).xy * 0.05;
    lap -= s.xy;

    float fert = vnoise(
      vec2(vUv.x * uAspect, vUv.y) * uNoiseFreq + uDrift,
      uNoisePeriod
    );
    float barren = clamp((uFertileThresh - fert) / uFertileEdge, 0.0, 1.0);
    float decay = uGlobalDecay + uBarrenDecay * barren;

    // Soft elliptical inhibitor behind the title: extra decay + less seeding,
    // ramped so the edge is a gradient, never a visible cutout.
    float inhibit = 0.0;
    if (uInhibitStrength > 0.0) {
      float dd = length((vUv - uInhibitCenter) / uInhibitRadius);
      inhibit = 1.0 - smoothstep(uInhibitInner, uInhibitOuter, dd);
      decay += uInhibitStrength * inhibit;
    }

    float kill = uKill;
    if (uPointerActive > 0.5) {
      vec2 pd = vUv - uPointer;
      pd.x *= uAspect;
      float dist = length(pd) / uBoostRadius;
      if (dist < 1.0) kill = max(uKillMin, kill - uKillDrop * (1.0 - dist));
    }

    float uvv = u * v * v;
    float nu = u + (uDu * lap.x - uvv + uFeed * (1.0 - u)) * uDt;
    float nv = v + (uDv * lap.y + uvv - (uFeed + kill) * v) * uDt;
    nv -= nv * decay;

    if (barren < 0.15) {
      float h = hash(floor(vUv / uTexel) + uSeedTime);
      if (h < uSeedProb * (1.0 - inhibit)) nv = max(nv, 0.5);
    }

    outColor = vec4(clamp(nu, 0.0, 1.0), clamp(nv, 0.0, 1.0), 0.0, 1.0);
  }`;

  const DISPLAY_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 outColor;
  uniform sampler2D uState;
  uniform vec3 uColor;
  uniform float uThreshLo, uThreshHi, uMaxAlpha;
  void main() {
    float v = texture(uState, vUv).y;
    float a = smoothstep(uThreshLo, uThreshHi, v) * uMaxAlpha;
    outColor = vec4(uColor * a, a); // premultiplied
  }`;

  // Copies the raw u,v state from one texture into another (of a new size) so a
  // resize reframes the live pattern instead of reseeding from scratch.
  const COPY_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 outColor;
  uniform sampler2D uState;
  void main() {
    outColor = vec4(texture(uState, vUv).xy, 0.0, 1.0);
  }`;

  let gl: WebGL2RenderingContext | null = null;
  let simProgram: WebGLProgram | null = null;
  let seedProgram: WebGLProgram | null = null;
  let displayProgram: WebGLProgram | null = null;
  let copyProgram: WebGLProgram | null = null;
  let copyUState: WebGLUniformLocation | null = null;
  let quadVao: WebGLVertexArrayObject | null = null;
  let texA: WebGLTexture | null = null;
  let texB: WebGLTexture | null = null;
  let fboA: WebGLFramebuffer | null = null;
  let fboB: WebGLFramebuffer | null = null;
  let simCols = 0;
  let simRows = 0;
  let cssW = 0;
  let cssH = 0;
  let failed = false;

  let running = false;
  let isVisible = true;
  let isTransitioning = false;
  let motionOK = true;
  let rafId = 0;
  let frame = 0;
  let pointerActive = false;
  let pointerU = 0;
  let pointerV = 0;
  let inhibitCenterU = 0.5;
  let inhibitCenterV = -1; // off-screen until measured
  let inhibitRadiusU = 0.1;
  let inhibitRadiusV = 0.1;
  let inhibitStrength = 0;
  let resizeHandler: (() => void) | null = null;

  const simUniforms: Record<string, WebGLUniformLocation | null> = {};
  const displayUniforms: Record<string, WebGLUniformLocation | null> = {};
  const seedUniforms: Record<string, WebGLUniformLocation | null> = {};

  function compile(type: number, src: string): WebGLShader | null {
    if (!gl) return null;
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('RD shader compile failed:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function link(vertSrc: string, fragSrc: string): WebGLProgram | null {
    if (!gl) return null;
    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    if (!prog) return null;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('RD program link failed:', gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  function createStateTexture(): WebGLTexture | null {
    if (!gl) return null;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      simCols,
      simRows,
      0,
      gl.RGBA,
      gl.HALF_FLOAT,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    return tex;
  }

  function makeFbo(tex: WebGLTexture | null): WebGLFramebuffer | null {
    if (!gl) return null;
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    return fbo;
  }

  function setup(): boolean {
    const canvas = canvasEl.value;
    if (!canvas) return false;
    gl = canvas.getContext('webgl2', {
      premultipliedAlpha: true,
      alpha: true,
      antialias: false,
      depth: false,
    });
    if (!gl) return false;
    if (!gl.getExtension('EXT_color_buffer_float')) return false;

    simProgram = link(QUAD_VERT, SIM_FRAG);
    seedProgram = link(QUAD_VERT, SEED_FRAG);
    displayProgram = link(QUAD_VERT, DISPLAY_FRAG);
    copyProgram = link(QUAD_VERT, COPY_FRAG);
    if (!simProgram || !seedProgram || !displayProgram || !copyProgram) {
      return false;
    }
    copyUState = gl.getUniformLocation(copyProgram, 'uState');

    for (const name of [
      'uState',
      'uTexel',
      'uDu',
      'uDv',
      'uDt',
      'uFeed',
      'uKill',
      'uNoiseFreq',
      'uFertileThresh',
      'uFertileEdge',
      'uGlobalDecay',
      'uBarrenDecay',
      'uDrift',
      'uNoisePeriod',
      'uAspect',
      'uPointer',
      'uPointerActive',
      'uKillDrop',
      'uKillMin',
      'uBoostRadius',
      'uSeedTime',
      'uSeedProb',
      'uInhibitCenter',
      'uInhibitRadius',
      'uInhibitStrength',
      'uInhibitInner',
      'uInhibitOuter',
    ]) {
      simUniforms[name] = gl.getUniformLocation(simProgram, name);
    }
    for (const name of ['uState', 'uColor', 'uThreshLo', 'uThreshHi', 'uMaxAlpha']) {
      displayUniforms[name] = gl.getUniformLocation(displayProgram, name);
    }
    for (const name of ['uNuclei', 'uAspect', 'uRadius']) {
      seedUniforms[name] = gl.getUniformLocation(seedProgram, name);
    }

    quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return true;
  }

  function seed() {
    if (!gl || !seedProgram) return;
    const nuclei = new Float32Array(SEED_NUCLEI * 2);
    for (let i = 0; i < SEED_NUCLEI; i++) {
      nuclei[i * 2] = Math.random();
      nuclei[i * 2 + 1] = Math.random();
    }
    gl.useProgram(seedProgram);
    gl.uniform2fv(seedUniforms.uNuclei, nuclei);
    gl.uniform1f(seedUniforms.uAspect, cssW / cssH);
    gl.uniform1f(seedUniforms.uRadius, NUCLEUS_RADIUS);
    gl.bindVertexArray(quadVao);
    gl.viewport(0, 0, simCols, simRows);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboA);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Render an existing state texture into the current front texture (texA),
  // scaled to the new sim size — used to preserve the pattern across a resize.
  function copyState(src: WebGLTexture | null) {
    if (!gl || !copyProgram) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboA);
    gl.viewport(0, 0, simCols, simRows);
    gl.useProgram(copyProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.uniform1i(copyUState, 0);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Measure the hero wordmark and translate its viewport rect into the soft
  // inhibitor ellipse (uv space). Tracks the title across breakpoints and
  // scroll; deactivates once the title has left the viewport.
  function updateInhibitor() {
    const el = document.querySelector(INHIBIT_SELECTOR);
    if (!el || cssW <= 0 || cssH <= 0) {
      inhibitStrength = 0;
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.bottom <= 0 || rect.top >= cssH) {
      inhibitStrength = 0; // off-screen: nothing to protect
      return;
    }
    inhibitCenterU = (rect.left + rect.width / 2) / cssW;
    inhibitCenterV = (rect.top + rect.height / 2) / cssH;
    inhibitRadiusU = ((rect.width / 2) * INHIBIT_MARGIN) / cssW;
    inhibitRadiusV = ((rect.height / 2) * INHIBIT_MARGIN) / cssH;
    inhibitStrength = INHIBIT_STRENGTH;
  }

  // One Gray-Scott step: read the front texture, write the back, then swap.
  function simStep() {
    if (!gl || !simProgram) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboB);
    gl.viewport(0, 0, simCols, simRows);
    gl.useProgram(simProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.uniform1i(simUniforms.uState, 0);
    gl.uniform2f(simUniforms.uTexel, 1 / simCols, 1 / simRows);
    gl.uniform1f(simUniforms.uDu, DU);
    gl.uniform1f(simUniforms.uDv, DV);
    gl.uniform1f(simUniforms.uDt, DT);
    gl.uniform1f(simUniforms.uFeed, FEED);
    gl.uniform1f(simUniforms.uKill, KILL);
    gl.uniform1f(simUniforms.uNoiseFreq, NOISE_FREQ);
    gl.uniform1f(simUniforms.uFertileThresh, FERTILE_THRESH);
    gl.uniform1f(simUniforms.uFertileEdge, FERTILE_EDGE);
    gl.uniform1f(simUniforms.uGlobalDecay, GLOBAL_DECAY);
    gl.uniform1f(simUniforms.uBarrenDecay, BARREN_DECAY);
    // Wrap the drift into one noise period so the shader coordinate stays small
    // and precise no matter how long the page runs (see vnoise).
    gl.uniform2f(
      simUniforms.uDrift,
      (frame * DRIFT_X) % NOISE_PERIOD,
      (frame * DRIFT_Y) % NOISE_PERIOD,
    );
    gl.uniform1f(simUniforms.uNoisePeriod, NOISE_PERIOD);
    gl.uniform1f(simUniforms.uAspect, cssW / cssH);
    gl.uniform2f(simUniforms.uPointer, pointerU, pointerV);
    gl.uniform1f(simUniforms.uPointerActive, pointerActive ? 1 : 0);
    gl.uniform1f(simUniforms.uKillDrop, KILL_DROP);
    gl.uniform1f(simUniforms.uKillMin, KILL_MIN);
    gl.uniform1f(simUniforms.uBoostRadius, BOOST_RADIUS);
    gl.uniform1f(simUniforms.uSeedTime, frame % 1024);
    gl.uniform1f(simUniforms.uSeedProb, SEED_PROB);
    gl.uniform2f(simUniforms.uInhibitCenter, inhibitCenterU, inhibitCenterV);
    gl.uniform2f(simUniforms.uInhibitRadius, inhibitRadiusU, inhibitRadiusV);
    gl.uniform1f(simUniforms.uInhibitStrength, inhibitStrength);
    gl.uniform1f(simUniforms.uInhibitInner, INHIBIT_INNER);
    gl.uniform1f(simUniforms.uInhibitOuter, INHIBIT_OUTER);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // swap front/back
    const t = texA;
    texA = texB;
    texB = t;
    const f = fboA;
    fboA = fboB;
    fboB = f;
  }

  function display() {
    if (!gl || !displayProgram) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(displayProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.uniform1i(displayUniforms.uState, 0);
    gl.uniform3f(
      displayUniforms.uColor,
      COLOR[0] / 255,
      COLOR[1] / 255,
      COLOR[2] / 255,
    );
    gl.uniform1f(displayUniforms.uThreshLo, THRESH_LO);
    gl.uniform1f(displayUniforms.uThreshHi, THRESH_HI);
    gl.uniform1f(displayUniforms.uMaxAlpha, MAX_ALPHA);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function sizeCanvas() {
    const canvas = canvasEl.value;
    if (!canvas || !gl) return;
    const oldTexA = texA;
    const oldTexB = texB;
    const oldFboA = fboA;
    const oldFboB = fboB;
    const hadState = oldTexA !== null;

    cssW = Math.max(1, Math.floor(window.innerWidth));
    cssH = Math.max(1, Math.floor(window.innerHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    simCols = Math.min(MAX_SIM_COLS, Math.max(1, Math.floor(cssW / SIM_SCALE)));
    simRows = Math.max(1, Math.floor((simCols * cssH) / cssW));

    texA = createStateTexture();
    texB = createStateTexture();
    fboA = makeFbo(texA);
    fboB = makeFbo(texB);
    updateInhibitor();

    if (hadState) {
      // Reframe the live pattern into the new size instead of reseeding, so a
      // resize doesn't flash. Drift (frame) keeps running for continuity.
      copyState(oldTexA);
    } else {
      frame = 0;
      seed();
      for (let n = 0; n < (motionOK ? WARMUP_ITERS : STATIC_ITERS); n++) {
        simStep();
        frame++;
      }
    }

    if (oldTexA) gl.deleteTexture(oldTexA);
    if (oldTexB) gl.deleteTexture(oldTexB);
    if (oldFboA) gl.deleteFramebuffer(oldFboA);
    if (oldFboB) gl.deleteFramebuffer(oldFboB);
    display();
  }

  function loop() {
    if (!running) return;
    updateInhibitor();
    for (let n = 0; n < ITERS_PER_FRAME; n++) {
      simStep();
      frame++;
    }
    display();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || failed) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function evaluateRun() {
    if (isVisible && !isTransitioning && motionOK) start();
    else stop();
  }

  function handlePointerMove(event: MouseEvent) {
    pointerU = event.clientX / cssW;
    pointerV = event.clientY / cssH;
    pointerActive = true;
  }

  function handleDocumentLeave() {
    pointerActive = false;
  }

  function handleVisibility() {
    isVisible = document.visibilityState === 'visible';
    evaluateRun();
  }

  onMounted(() => {
    const canvas = canvasEl.value;
    if (!canvas) return;
    motionOK = window.matchMedia(
      '(prefers-reduced-motion: no-preference)',
    ).matches;

    if (!setup()) {
      failed = true; // no WebGL2/float support — leave the paper grid bare
      return;
    }
    sizeCanvas();

    resizeHandler = () => sizeCanvas();
    window.addEventListener('resize', resizeHandler, { passive: true });

    if (!motionOK) return;

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleDocumentLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    evaluateRun();
  });

  watch(
    () => transitionState.value.active,
    (active) => {
      isTransitioning = active;
      evaluateRun();
    },
  );

  onBeforeUnmount(() => {
    stop();
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('mousemove', handlePointerMove);
    document.removeEventListener('mouseleave', handleDocumentLeave);
    document.removeEventListener('visibilitychange', handleVisibility);
  });
</script>

<template>
  <canvas ref="canvasEl" class="rd-canvas" aria-hidden="true" />
</template>

<style lang="scss" scoped>
  .rd-canvas {
    position: fixed;
    inset: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }
</style>
