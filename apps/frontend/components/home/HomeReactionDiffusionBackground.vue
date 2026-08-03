<script setup lang="ts">
  // Page-wide Gray-Scott reaction-diffusion "skin" over the paper-grid ground,
  // run on the GPU (WebGL2 ping-pong float textures). Parameters were dialled in
  // on the /dev/rd harness; the hard-won constraints behind them:
  //
  //  - The sim state MUST be sampled NEAREST. LINEAR blends neighbouring texels
  //    on every read, which is a sub-texel smear applied ~1000x/sec. Display
  //    upscaling still uses LINEAR, via a separate sampler object.
  //  - Drift and decay are rates per SECOND, scaled by the wall-clock time each
  //    step represents. Applied per step they silently scale with ITERS_PER_FRAME.
  //  - Growth only spreads from existing coral, so drift faster than the growth
  //    front strands the pattern in barren land and the field collapses.
  //    Nucleation (discrete blobs planted in fertile land) is what lets growth
  //    start ahead of the front, and is why fast drift survives here.
  //  - Do NOT reintroduce per-cell hash seeding. Its firing set slides one cell
  //    per step, so every firing point drags a diagonal line — that was the
  //    long-running "wind-blown" bug.
  //
  // Paused when hidden and during featured-media transitions; a single developed
  // still frame under reduced motion. Fixed, behind content, pointer-events:none.
  // See docs/active-spikes/animation.md → Thread B.

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  // Hidden until the warm-up has grown a mature pattern.
  const ready = ref(false);
  const transitionState = useFeaturedMediaTransitionState();

  const SIM_SCALE = 3.75; // css px per sim cell
  const MAX_SIM_COLS = 640;
  const ITERS_PER_FRAME = 15;
  // Reaction. Higher diffusion than textbook widens the Turing wavelength, so
  // features span enough cells to read as smooth curves rather than blocky ones.
  const DU = 0.32;
  const DV = 0.16;
  const DT = 0.6;
  const FEED = 0.0496;
  const KILL = 0.0619;
  // Negative space.
  const NOISE_FREQ = 5.5;
  const FERTILE_THRESH = 0.34;
  const FERTILE_EDGE = 0.14;
  const MASK_DETAIL = 0;
  // Turnover, per second.
  const BARREN_DECAY_PER_SEC = 16.7;
  const GLOBAL_DECAY_PER_SEC = 0.11;
  const DRIFT_SPEED = 0.348; // noise units per second
  // The heading wanders instead of holding one direction, so the field meanders
  // along a curved path rather than reading as a conveyor belt.
  const DRIFT_TURN_A = 0.037; // rad/sec of the slow wander term
  const DRIFT_TURN_B = 0.0163;
  // Nucleation.
  const NUCLEATION_PER_SEC = 1.5;
  const NUCLEUS_RADIUS = 0.002;
  const MAX_STAMPS = 8;
  const SEED_NUCLEI = 14;
  const SEED_RADIUS = 0.02;
  // Develop a mature pattern BEFORE the first visible frame, so the page never
  // opens on a field of polka dots. Run in chunks across a few frames rather
  // than synchronously (thousands of passes at once would block the main
  // thread), with the canvas faded out until it is grown.
  const WARMUP_ITERS = 12000;
  const WARMUP_CHUNK = 300; // passes per frame while warming
  const STATIC_ITERS = 12000;
  // Cursor: lowers the local kill so coral grows toward the pointer.
  const KILL_DROP = 0.018;
  const KILL_MIN = 0.044;
  const BOOST_RADIUS = 0.14;
  // Touch devices have no cursor, so the influence point is a "ball" that the
  // finger grabs, device tilt rolls, and a slow wander keeps alive at rest.
  // iOS 13+ gates DeviceOrientation behind a permission prompt, which is far
  // too much friction for a background texture — so we never request it. iOS
  // therefore gets touch + wander, Android additionally gets tilt.
  const TILT_ACCEL = 0.55; // uv/sec^2 at full tilt
  const TILT_FULL_DEG = 40; // tilt angle treated as "full"
  const WANDER_ACCEL = 0.06; // keeps the ball drifting when flat and untouched
  const BALL_DRAG = 1.7; // per second; without it the ball never settles
  const BALL_BOUNCE = 0.45;
  // Title dead zone. Measured from the script spans, NOT .hero-title — that is
  // display:contents and so has no box of its own (its rect is all zeros).
  // Only the script words need thinning; the serif "Up Front" reads fine.
  const INHIBIT_SELECTORS = ['.title-script-1', '.title-script-2'];
  const INHIBIT_MARGIN = 1.1;
  const INHIBIT_STRENGTH = 2.5; // extra decay/sec at the core; soft, not a killzone
  const INHIBIT_INNER = 0.3;
  const INHIBIT_OUTER = 1.15;
  // Colour + threshold render.
  const COLOR: readonly [number, number, number] = [205, 222, 255]; // #cddeff
  const THRESH_LO = 0.13;
  const THRESH_HI = 0.22;
  const MAX_ALPHA = 0.62;
  // Nominal wall-clock a warm-up step stands for, so rates behave as at runtime.
  const WARM_STEP_SECONDS = 1 / 60 / ITERS_PER_FRAME;

  const NOISE_GLSL = `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 w = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
  }
  float fertAt(vec2 uv, float aspect, float freq, vec2 drift, float detail) {
    vec2 p = vec2(uv.x * aspect, uv.y) * freq + drift;
    float n = vnoise(p);
    if (detail > 0.001) {
      float n2 = vnoise(p * 2.37 + 11.3);
      float n3 = vnoise(p * 4.91 + 41.7);
      n = mix(n, n * 0.55 + n2 * 0.3 + n3 * 0.15, detail);
    }
    return n;
  }`;

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
  uniform float uAspect, uRadius;
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
  uniform float uNoiseFreq, uFertileThresh, uFertileEdge, uMaskDetail;
  uniform float uGlobalDecay, uBarrenDecay;
  uniform vec2 uDrift;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform float uPointerActive, uKillDrop, uKillMin, uBoostRadius;
  uniform float uTime;
  uniform vec2 uInhibitCenter, uInhibitRadius;
  uniform float uInhibitStrength, uInhibitInner, uInhibitOuter;
  ${NOISE_GLSL}

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

    float fert = fertAt(vUv, uAspect, uNoiseFreq, uDrift, uMaskDetail);
    float barren = clamp((uFertileThresh - fert) / uFertileEdge, 0.0, 1.0);
    float decay = uGlobalDecay + uBarrenDecay * barren;

    // Soft elliptical dead zone behind the wordmark, ramped so its edge is a
    // gradient rather than a visible cutout.
    if (uInhibitStrength > 0.0) {
      float dd = length((vUv - uInhibitCenter) / uInhibitRadius);
      decay += uInhibitStrength * (1.0 - smoothstep(uInhibitInner, uInhibitOuter, dd));
    }

    // Cursor: a patchy, drifting zone of lowered kill rather than a clean disc
    // of it — a smooth radial falloff reads as an opaque stamp painted on, so
    // the boost is broken up by a moving speckle field and only the parts that
    // survive it get the growth.
    float kill = uKill;
    if (uPointerActive > 0.5) {
      vec2 pd = vUv - uPointer;
      pd.x *= uAspect;
      float dist = length(pd) / uBoostRadius;
      if (dist < 1.0) {
        float speck = vnoise(
          vec2(vUv.x * uAspect, vUv.y) * 42.0 +
            vec2(uTime * 0.35, uTime * -0.27)
        );
        float falloff = (1.0 - dist) * smoothstep(0.28, 0.72, speck);
        kill = max(uKillMin, kill - uKillDrop * falloff);
      }
    }

    float uvv = u * v * v;
    float nu = u + (uDu * lap.x - uvv + uFeed * (1.0 - u)) * uDt;
    float nv = v + (uDv * lap.y + uvv - (uFeed + kill) * v) * uDt;
    nv -= nv * decay;

    outColor = vec4(clamp(nu, 0.0, 1.0), clamp(nv, 0.0, 1.0), 0.0, 1.0);
  }`;

  // Plants whole blobs, skipping any whose centre lands on barren ground.
  const STAMP_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 outColor;
  uniform sampler2D uState;
  uniform vec2 uStamps[${MAX_STAMPS}];
  uniform int uStampCount;
  uniform float uRadius, uAspect;
  uniform float uNoiseFreq, uFertileThresh, uMaskDetail;
  uniform vec2 uDrift;
  ${NOISE_GLSL}
  void main() {
    vec2 s = texture(uState, vUv).xy;
    for (int i = 0; i < ${MAX_STAMPS}; i++) {
      if (i >= uStampCount) break;
      vec2 c = uStamps[i];
      if (fertAt(c, uAspect, uNoiseFreq, uDrift, uMaskDetail) < uFertileThresh) {
        continue;
      }
      vec2 d = vUv - c;
      d.x *= uAspect;
      if (length(d) < uRadius) s = vec2(0.2, 0.6);
    }
    outColor = vec4(s, 0.0, 1.0);
  }`;

  // Rescales live state into a new-sized texture so resizing reframes the
  // pattern instead of reseeding (which would flash).
  const COPY_FRAG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 outColor;
  uniform sampler2D uState;
  void main() {
    outColor = vec4(texture(uState, vUv).xy, 0.0, 1.0);
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

  let gl: WebGL2RenderingContext | null = null;
  let simProgram: WebGLProgram | null = null;
  let seedProgram: WebGLProgram | null = null;
  let stampProgram: WebGLProgram | null = null;
  let copyProgram: WebGLProgram | null = null;
  let displayProgram: WebGLProgram | null = null;
  let quadVao: WebGLVertexArrayObject | null = null;
  let samplerNearest: WebGLSampler | null = null;
  let samplerLinear: WebGLSampler | null = null;
  let texA: WebGLTexture | null = null;
  let texB: WebGLTexture | null = null;
  let fboA: WebGLFramebuffer | null = null;
  let fboB: WebGLFramebuffer | null = null;
  let copyUState: WebGLUniformLocation | null = null;

  const simU: Record<string, WebGLUniformLocation | null> = {};
  const seedU: Record<string, WebGLUniformLocation | null> = {};
  const stampU: Record<string, WebGLUniformLocation | null> = {};
  const dispU: Record<string, WebGLUniformLocation | null> = {};

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
  let lastTime = 0;
  let elapsed = 0;
  let driftX = 0;
  let driftY = 0;
  let stampAccum = 0;
  let warmupRemaining = 0;
  let pointerActive = false;
  let pointerU = 0;
  let pointerV = 0;
  // Touch-device influence ball.
  let hasFinePointer = true;
  let touching = false;
  let hasTilt = false;
  let neutralBeta: number | null = null;
  let tiltX = 0;
  let tiltY = 0;
  let ballU = 0.5;
  let ballV = 0.5;
  let ballVX = 0;
  let ballVY = 0;
  let inhibitCenterU = 0.5;
  let inhibitCenterV = -1;
  let inhibitRadiusU = 0.1;
  let inhibitRadiusV = 0.1;
  let inhibitStrength = 0;
  let resizeHandler: (() => void) | null = null;

  function compile(type: number, src: string) {
    if (!gl) return null;
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('RD shader compile failed:', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  function link(v: string, f: string) {
    if (!gl) return null;
    const vs = compile(gl.VERTEX_SHADER, v);
    const fs = compile(gl.FRAGMENT_SHADER, f);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    if (!p) return null;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('RD program link failed:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  function makeTex() {
    if (!gl) return null;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
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
    return t;
  }

  function makeFbo(t: WebGLTexture | null) {
    if (!gl) return null;
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      t,
      0,
    );
    return f;
  }

  function swap() {
    const t = texA;
    texA = texB;
    texB = t;
    const f = fboA;
    fboA = fboB;
    fboB = f;
  }

  function seed() {
    if (!gl || !seedProgram) return;
    const n = new Float32Array(SEED_NUCLEI * 2);
    for (let i = 0; i < SEED_NUCLEI; i++) {
      n[i * 2] = Math.random();
      n[i * 2 + 1] = Math.random();
    }
    gl.useProgram(seedProgram);
    gl.uniform2fv(seedU.uNuclei, n);
    gl.uniform1f(seedU.uAspect, cssW / cssH);
    gl.uniform1f(seedU.uRadius, SEED_RADIUS);
    gl.bindVertexArray(quadVao);
    gl.viewport(0, 0, simCols, simRows);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboA);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function simStep(stepSeconds: number) {
    if (!gl || !simProgram) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboB);
    gl.viewport(0, 0, simCols, simRows);
    gl.useProgram(simProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.bindSampler(0, samplerNearest);
    gl.uniform1i(simU.uState, 0);
    gl.uniform2f(simU.uTexel, 1 / simCols, 1 / simRows);
    gl.uniform1f(simU.uDu, DU);
    gl.uniform1f(simU.uDv, DV);
    gl.uniform1f(simU.uDt, DT);
    gl.uniform1f(simU.uFeed, FEED);
    gl.uniform1f(simU.uKill, KILL);
    gl.uniform1f(simU.uNoiseFreq, NOISE_FREQ);
    gl.uniform1f(simU.uFertileThresh, FERTILE_THRESH);
    gl.uniform1f(simU.uFertileEdge, FERTILE_EDGE);
    gl.uniform1f(simU.uMaskDetail, MASK_DETAIL);
    gl.uniform1f(simU.uGlobalDecay, GLOBAL_DECAY_PER_SEC * stepSeconds);
    gl.uniform1f(simU.uBarrenDecay, BARREN_DECAY_PER_SEC * stepSeconds);
    gl.uniform2f(simU.uDrift, driftX, driftY);
    gl.uniform1f(simU.uAspect, cssW / cssH);
    gl.uniform2f(simU.uPointer, pointerU, pointerV);
    gl.uniform1f(simU.uPointerActive, pointerActive ? 1 : 0);
    gl.uniform1f(simU.uKillDrop, KILL_DROP);
    gl.uniform1f(simU.uKillMin, KILL_MIN);
    gl.uniform1f(simU.uBoostRadius, BOOST_RADIUS);
    gl.uniform1f(simU.uTime, elapsed);
    gl.uniform2f(simU.uInhibitCenter, inhibitCenterU, inhibitCenterV);
    gl.uniform2f(simU.uInhibitRadius, inhibitRadiusU, inhibitRadiusV);
    gl.uniform1f(simU.uInhibitStrength, inhibitStrength * stepSeconds);
    gl.uniform1f(simU.uInhibitInner, INHIBIT_INNER);
    gl.uniform1f(simU.uInhibitOuter, INHIBIT_OUTER);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    swap();
  }

  function stampNuclei(count: number) {
    if (!gl || !stampProgram || count <= 0) return;
    const pts = new Float32Array(MAX_STAMPS * 2);
    for (let i = 0; i < count; i++) {
      pts[i * 2] = Math.random();
      pts[i * 2 + 1] = Math.random();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboB);
    gl.viewport(0, 0, simCols, simRows);
    gl.useProgram(stampProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.bindSampler(0, samplerNearest);
    gl.uniform1i(stampU.uState, 0);
    gl.uniform2fv(stampU.uStamps, pts);
    gl.uniform1i(stampU.uStampCount, count);
    gl.uniform1f(stampU.uRadius, NUCLEUS_RADIUS);
    gl.uniform1f(stampU.uAspect, cssW / cssH);
    gl.uniform1f(stampU.uNoiseFreq, NOISE_FREQ);
    gl.uniform1f(stampU.uFertileThresh, FERTILE_THRESH);
    gl.uniform1f(stampU.uMaskDetail, MASK_DETAIL);
    gl.uniform2f(stampU.uDrift, driftX, driftY);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    swap();
  }

  function copyState(src: WebGLTexture | null) {
    if (!gl || !copyProgram) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboA);
    gl.viewport(0, 0, simCols, simRows);
    gl.useProgram(copyProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.bindSampler(0, samplerLinear);
    gl.uniform1i(copyUState, 0);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
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
    gl.bindSampler(0, samplerLinear);
    gl.uniform1i(dispU.uState, 0);
    gl.uniform3f(dispU.uColor, COLOR[0] / 255, COLOR[1] / 255, COLOR[2] / 255);
    gl.uniform1f(dispU.uThreshLo, THRESH_LO);
    gl.uniform1f(dispU.uThreshHi, THRESH_HI);
    gl.uniform1f(dispU.uMaxAlpha, MAX_ALPHA);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Measure the wordmark and map its rect into the soft inhibitor ellipse, so
  // the dead zone tracks the title across breakpoints and scroll.
  function updateInhibitor() {
    if (cssW <= 0 || cssH <= 0) {
      inhibitStrength = 0;
      return;
    }
    // Union of the script words' rects.
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const sel of INHIBIT_SELECTORS) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      left = Math.min(left, r.left);
      right = Math.max(right, r.right);
      top = Math.min(top, r.top);
      bottom = Math.max(bottom, r.bottom);
    }
    if (!Number.isFinite(left) || bottom <= 0 || top >= cssH) {
      inhibitStrength = 0; // absent or scrolled away
      return;
    }
    inhibitCenterU = (left + right) / 2 / cssW;
    // Flip: clientY grows downward, uv.y grows upward.
    inhibitCenterV = 1 - (top + bottom) / 2 / cssH;
    inhibitRadiusU = (((right - left) / 2) * INHIBIT_MARGIN) / cssW;
    inhibitRadiusV = (((bottom - top) / 2) * INHIBIT_MARGIN) / cssH;
    inhibitStrength = INHIBIT_STRENGTH;
  }

  // Integrate the drift along a slowly wandering heading so the field meanders
  // instead of sliding along one fixed axis.
  function advanceDrift(dtSec: number) {
    const angle =
      1.2 * Math.sin(DRIFT_TURN_A * elapsed) +
      0.7 * Math.sin(DRIFT_TURN_B * elapsed + 2.1);
    driftX += Math.cos(angle) * DRIFT_SPEED * dtSec;
    driftY += Math.sin(angle) * DRIFT_SPEED * dtSec;
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
    simCols = Math.min(MAX_SIM_COLS, Math.max(1, Math.round(cssW / SIM_SCALE)));
    simRows = Math.max(1, Math.round((simCols * cssH) / cssW));

    texA = makeTex();
    texB = makeTex();
    fboA = makeFbo(texA);
    fboB = makeFbo(texB);
    updateInhibitor();

    if (hadState) {
      copyState(oldTexA); // reframe the live pattern; no reseed flash
    } else {
      seed();
      if (motionOK) {
        warmupRemaining = WARMUP_ITERS; // grown in chunks by the loop
      } else {
        for (let n = 0; n < STATIC_ITERS; n++) simStep(WARM_STEP_SECONDS);
        ready.value = true;
      }
    }

    if (oldTexA) gl.deleteTexture(oldTexA);
    if (oldTexB) gl.deleteTexture(oldTexB);
    if (oldFboA) gl.deleteFramebuffer(oldFboA);
    if (oldFboB) gl.deleteFramebuffer(oldFboB);
    display();
  }

  function loop(now: number) {
    if (!running) return;
    const dtSec = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
    lastTime = now;
    elapsed += dtSec;
    advanceDrift(dtSec);
    if (!hasFinePointer) updateBall(dtSec);
    updateInhibitor();

    stampAccum += NUCLEATION_PER_SEC * dtSec;
    if (stampAccum >= 1) {
      const n = Math.min(MAX_STAMPS, Math.floor(stampAccum));
      stampAccum -= Math.floor(stampAccum);
      stampNuclei(n);
    }

    if (warmupRemaining > 0) {
      const chunk = Math.min(WARMUP_CHUNK, warmupRemaining);
      for (let i = 0; i < chunk; i++) simStep(WARM_STEP_SECONDS);
      warmupRemaining -= chunk;
      if (warmupRemaining === 0) ready.value = true;
    } else {
      const stepSeconds = dtSec / ITERS_PER_FRAME;
      for (let i = 0; i < ITERS_PER_FRAME; i++) simStep(stepSeconds);
    }
    display();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || failed) return;
    running = true;
    lastTime = 0;
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

  // --- Touch-device influence point ------------------------------------------
  // Held as a ball with velocity and drag rather than mapped straight from
  // tilt: absolute tilt would peg the point to one edge, since a phone is
  // normally held at a slant. Tilt is an acceleration, so a resting slant makes
  // it roll and settle instead of sticking.
  function handleOrientation(event: DeviceOrientationEvent) {
    const { beta, gamma } = event;
    if (beta === null || gamma === null) return;
    // First reading becomes neutral, so "level" is however they hold the phone.
    if (neutralBeta === null) neutralBeta = beta;
    tiltX = Math.max(-1, Math.min(1, gamma / TILT_FULL_DEG));
    tiltY = Math.max(-1, Math.min(1, -(beta - neutralBeta) / TILT_FULL_DEG));
    hasTilt = true;
  }

  function handleTouch(event: TouchEvent) {
    const t = event.touches[0];
    if (!t || cssW <= 0 || cssH <= 0) return;
    touching = true;
    ballU = t.clientX / cssW;
    ballV = 1 - t.clientY / cssH; // clientY grows down, uv.y grows up
    ballVX = 0;
    ballVY = 0;
  }

  function handleTouchEnd() {
    touching = false;
  }

  function updateBall(dtSec: number) {
    if (!touching) {
      // Wander uses two incommensurate frequencies so it never loops visibly.
      // It carries the motion where tilt is unavailable (notably iOS, which we
      // deliberately never prompt for) and mostly steps aside once tilt exists.
      const wander = hasTilt ? WANDER_ACCEL * 0.25 : WANDER_ACCEL;
      const ax = tiltX * TILT_ACCEL + Math.sin(elapsed * 0.23) * wander;
      const ay = tiltY * TILT_ACCEL + Math.cos(elapsed * 0.19 + 1.3) * wander;
      const damp = Math.exp(-BALL_DRAG * dtSec);
      ballVX = (ballVX + ax * dtSec) * damp;
      ballVY = (ballVY + ay * dtSec) * damp;
      ballU += ballVX * dtSec;
      ballV += ballVY * dtSec;
      if (ballU < 0) {
        ballU = 0;
        ballVX = Math.abs(ballVX) * BALL_BOUNCE;
      } else if (ballU > 1) {
        ballU = 1;
        ballVX = -Math.abs(ballVX) * BALL_BOUNCE;
      }
      if (ballV < 0) {
        ballV = 0;
        ballVY = Math.abs(ballVY) * BALL_BOUNCE;
      } else if (ballV > 1) {
        ballV = 1;
        ballVY = -Math.abs(ballVY) * BALL_BOUNCE;
      }
    }
    pointerU = ballU;
    pointerV = ballV;
    pointerActive = true;
  }

  function handlePointerMove(event: MouseEvent) {
    pointerU = event.clientX / cssW;
    // Flip: clientY grows downward, uv.y grows upward.
    pointerV = 1 - event.clientY / cssH;
    pointerActive = true;
  }

  function handleDocumentLeave() {
    pointerActive = false;
  }

  function handleVisibility() {
    isVisible = document.visibilityState === 'visible';
    evaluateRun();
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
    stampProgram = link(QUAD_VERT, STAMP_FRAG);
    copyProgram = link(QUAD_VERT, COPY_FRAG);
    displayProgram = link(QUAD_VERT, DISPLAY_FRAG);
    if (
      !simProgram ||
      !seedProgram ||
      !stampProgram ||
      !copyProgram ||
      !displayProgram
    ) {
      return false;
    }
    copyUState = gl.getUniformLocation(copyProgram, 'uState');

    for (const k of [
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
      'uMaskDetail',
      'uGlobalDecay',
      'uBarrenDecay',
      'uDrift',
      'uAspect',
      'uPointer',
      'uPointerActive',
      'uKillDrop',
      'uKillMin',
      'uBoostRadius',
      'uTime',
      'uInhibitCenter',
      'uInhibitRadius',
      'uInhibitStrength',
      'uInhibitInner',
      'uInhibitOuter',
    ]) {
      simU[k] = gl.getUniformLocation(simProgram, k);
    }
    for (const k of ['uNuclei', 'uAspect', 'uRadius']) {
      seedU[k] = gl.getUniformLocation(seedProgram, k);
    }
    for (const k of [
      'uState',
      'uStamps',
      'uStampCount',
      'uRadius',
      'uAspect',
      'uNoiseFreq',
      'uFertileThresh',
      'uMaskDetail',
      'uDrift',
    ]) {
      stampU[k] = gl.getUniformLocation(stampProgram, k);
    }
    for (const k of [
      'uState',
      'uColor',
      'uThreshLo',
      'uThreshHi',
      'uMaxAlpha',
    ]) {
      dispU[k] = gl.getUniformLocation(displayProgram, k);
    }

    // The sim needs exact texel reads (NEAREST); only the display upscale wants
    // LINEAR. Sampler objects let one texture serve both.
    samplerNearest = gl.createSampler();
    samplerLinear = gl.createSampler();
    for (const [s, f] of [
      [samplerNearest, gl.NEAREST],
      [samplerLinear, gl.LINEAR],
    ] as const) {
      gl.samplerParameteri(s!, gl.TEXTURE_MIN_FILTER, f);
      gl.samplerParameteri(s!, gl.TEXTURE_MAG_FILTER, f);
      gl.samplerParameteri(s!, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.samplerParameteri(s!, gl.TEXTURE_WRAP_T, gl.REPEAT);
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

  onMounted(() => {
    if (!canvasEl.value) return;
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

    hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasFinePointer) {
      window.addEventListener('mousemove', handlePointerMove, { passive: true });
      document.addEventListener('mouseleave', handleDocumentLeave);
    } else {
      // Passive so dragging the finger never blocks scrolling.
      window.addEventListener('touchstart', handleTouch, { passive: true });
      window.addEventListener('touchmove', handleTouch, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
      window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
      // Never call DeviceOrientationEvent.requestPermission(): on iOS that is a
      // modal prompt, which is far too much friction for a background texture.
      // Listening unprompted simply yields no events there, leaving touch+wander.
      window.addEventListener('deviceorientation', handleOrientation, {
        passive: true,
      });
    }
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
    window.removeEventListener('touchstart', handleTouch);
    window.removeEventListener('touchmove', handleTouch);
    window.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('touchcancel', handleTouchEnd);
    window.removeEventListener('deviceorientation', handleOrientation);
    document.removeEventListener('visibilitychange', handleVisibility);
  });
</script>

<template>
  <canvas
    ref="canvasEl"
    class="rd-canvas"
    :class="{ 'is-ready': ready }"
    aria-hidden="true"
  />
</template>

<style lang="scss" scoped>
  .rd-canvas {
    position: fixed;
    inset: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    opacity: 0;
    transition: opacity 700ms ease;
  }

  .rd-canvas.is-ready {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .rd-canvas {
      transition: none;
    }
  }
</style>
