<script setup lang="ts">
  // Reaction-diffusion debug harness. Disposable dev-only page for isolating the
  // subsystems of HomeReactionDiffusionBackground: the reaction itself, the
  // fertility mask, the drift, and the seeding are each independently toggleable,
  // and the display can show the raw fields instead of the composited look.
  //
  // The point is to stop judging four coupled systems through one output. The
  // decisive test: mask/drift/seed all OFF is pure Gray-Scott from nuclei, which
  // MUST produce persistent spreading coral. If it doesn't, the sim is broken.
  //
  // Not linked from anywhere. Delete once Thread B is settled.

  definePageMeta({ layout: false });

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const status = ref('booting');
  const fps = ref(0);
  const linearOK = ref(false);

  // Toggles (reactive → pushed into uniforms each frame).
  const useMask = ref(true);
  const useDrift = ref(true);
  const useSeed = ref(true);
  const use32F = ref(false);
  const classicParams = ref(false);
  const view = ref<'composite' | 'v' | 'u' | 'mask'>('composite');

  const SIM_SCALE = 3;
  const MAX_SIM_COLS = 700;
  const ITERS_PER_FRAME = 18;
  const FEED = 0.0545;
  const KILL = 0.062;
  const NOISE_FREQ = 3.0;
  const FERTILE_THRESH = 0.46;
  const FERTILE_EDGE = 0.14;
  const BARREN_DECAY = 0.03;
  const GLOBAL_DECAY = 0.0006;
  const DRIFT_X = 0.0016;
  const DRIFT_Y = 0.0009;
  const SEED_PROB = 0.0005;
  const SEED_NUCLEI = 14;
  const NUCLEUS_RADIUS = 0.02;
  const COLOR: readonly [number, number, number] = [205, 222, 255];
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
  uniform float uNoiseFreq, uFertileThresh, uFertileEdge;
  uniform float uGlobalDecay, uBarrenDecay;
  uniform vec2 uDrift;
  uniform float uAspect;
  uniform float uSeedTime, uSeedProb;
  uniform float uUseMask, uUseSeed;

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

    float decay = 0.0;
    float barren = 0.0;
    if (uUseMask > 0.5) {
      float fert = vnoise(vec2(vUv.x * uAspect, vUv.y) * uNoiseFreq + uDrift);
      barren = clamp((uFertileThresh - fert) / uFertileEdge, 0.0, 1.0);
      decay = uGlobalDecay + uBarrenDecay * barren;
    }

    float uvv = u * v * v;
    float nu = u + (uDu * lap.x - uvv + uFeed * (1.0 - u)) * uDt;
    float nv = v + (uDv * lap.y + uvv - (uFeed + uKill) * v) * uDt;
    nv -= nv * decay;

    if (uUseSeed > 0.5 && barren < 0.15) {
      float h = hash(floor(vUv / uTexel) + uSeedTime);
      if (h < uSeedProb) nv = max(nv, 0.5);
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
  uniform float uView; // 0 composite, 1 raw v, 2 raw u, 3 mask
  uniform float uNoiseFreq, uFertileThresh, uFertileEdge, uAspect;
  uniform vec2 uDrift;

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

  void main() {
    vec2 s = texture(uState, vUv).xy;
    if (uView < 0.5) {
      float a = smoothstep(uThreshLo, uThreshHi, s.y) * uMaxAlpha;
      outColor = vec4(uColor * a, a);
    } else if (uView < 1.5) {
      // Raw v, autoscaled x4 so faint fields are still legible.
      float g = clamp(s.y * 4.0, 0.0, 1.0);
      outColor = vec4(g, g * 0.55, 1.0 - g, 1.0);
    } else if (uView < 2.5) {
      outColor = vec4(vec3(clamp(s.x, 0.0, 1.0)), 1.0);
    } else {
      float fert = vnoise(vec2(vUv.x * uAspect, vUv.y) * uNoiseFreq + uDrift);
      float barren = clamp((uFertileThresh - fert) / uFertileEdge, 0.0, 1.0);
      // green = fertile (reaction survives), red = barren (v is decayed away)
      outColor = vec4(barren, 1.0 - barren, 0.2, 1.0);
    }
  }`;

  let gl: WebGL2RenderingContext | null = null;
  let simProgram: WebGLProgram | null = null;
  let seedProgram: WebGLProgram | null = null;
  let displayProgram: WebGLProgram | null = null;
  let quadVao: WebGLVertexArrayObject | null = null;
  let texA: WebGLTexture | null = null;
  let texB: WebGLTexture | null = null;
  let fboA: WebGLFramebuffer | null = null;
  let fboB: WebGLFramebuffer | null = null;
  let simCols = 0;
  let simRows = 0;
  let cssW = 0;
  let cssH = 0;
  let frame = 0;
  let rafId = 0;
  let lastFpsAt = 0;
  let framesSince = 0;

  const simU: Record<string, WebGLUniformLocation | null> = {};
  const dispU: Record<string, WebGLUniformLocation | null> = {};
  const seedU: Record<string, WebGLUniformLocation | null> = {};

  function compile(type: number, src: string) {
    if (!gl) return null;
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      status.value = `shader error: ${gl.getShaderInfoLog(sh)}`;
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
      status.value = `link error: ${gl.getProgramInfoLog(p)}`;
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
      use32F.value ? gl.RGBA32F : gl.RGBA16F,
      simCols,
      simRows,
      0,
      gl.RGBA,
      use32F.value ? gl.FLOAT : gl.HALF_FLOAT,
      null,
    );
    // Sim reads exact texel centres, so NEAREST is correct and avoids needing
    // float-linear support; display upscaling uses LINEAR when available.
    const filter = linearOK.value ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
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
    const ok =
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    if (!ok) status.value = 'framebuffer incomplete (float render unsupported?)';
    return f;
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
    gl.uniform1f(seedU.uRadius, NUCLEUS_RADIUS);
    gl.bindVertexArray(quadVao);
    gl.viewport(0, 0, simCols, simRows);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboA);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frame = 0;
  }

  function simStep() {
    if (!gl || !simProgram) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboB);
    gl.viewport(0, 0, simCols, simRows);
    gl.useProgram(simProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.uniform1i(simU.uState, 0);
    gl.uniform2f(simU.uTexel, 1 / simCols, 1 / simRows);
    gl.uniform1f(simU.uDu, classicParams.value ? 0.16 : 0.32);
    gl.uniform1f(simU.uDv, classicParams.value ? 0.08 : 0.16);
    gl.uniform1f(simU.uDt, classicParams.value ? 1.0 : 0.6);
    gl.uniform1f(simU.uFeed, FEED);
    gl.uniform1f(simU.uKill, KILL);
    gl.uniform1f(simU.uNoiseFreq, NOISE_FREQ);
    gl.uniform1f(simU.uFertileThresh, FERTILE_THRESH);
    gl.uniform1f(simU.uFertileEdge, FERTILE_EDGE);
    gl.uniform1f(simU.uGlobalDecay, GLOBAL_DECAY);
    gl.uniform1f(simU.uBarrenDecay, BARREN_DECAY);
    const d = useDrift.value ? frame : 0;
    gl.uniform2f(simU.uDrift, d * DRIFT_X, d * DRIFT_Y);
    gl.uniform1f(simU.uAspect, cssW / cssH);
    gl.uniform1f(simU.uSeedTime, frame % 1024);
    gl.uniform1f(simU.uSeedProb, SEED_PROB);
    gl.uniform1f(simU.uUseMask, useMask.value ? 1 : 0);
    gl.uniform1f(simU.uUseSeed, useSeed.value ? 1 : 0);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
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
    gl.clearColor(0.96, 0.94, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(displayProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.uniform1i(dispU.uState, 0);
    gl.uniform3f(dispU.uColor, COLOR[0] / 255, COLOR[1] / 255, COLOR[2] / 255);
    gl.uniform1f(dispU.uThreshLo, THRESH_LO);
    gl.uniform1f(dispU.uThreshHi, THRESH_HI);
    gl.uniform1f(dispU.uMaxAlpha, MAX_ALPHA);
    const modes = { composite: 0, v: 1, u: 2, mask: 3 };
    gl.uniform1f(dispU.uView, modes[view.value]);
    gl.uniform1f(dispU.uNoiseFreq, NOISE_FREQ);
    gl.uniform1f(dispU.uFertileThresh, FERTILE_THRESH);
    gl.uniform1f(dispU.uFertileEdge, FERTILE_EDGE);
    gl.uniform1f(dispU.uAspect, cssW / cssH);
    const d = useDrift.value ? frame : 0;
    gl.uniform2f(dispU.uDrift, d * DRIFT_X, d * DRIFT_Y);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function sizeAndReset() {
    const c = canvasEl.value;
    if (!c || !gl) return;
    cssW = Math.max(1, window.innerWidth);
    cssH = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.floor(cssW * dpr);
    c.height = Math.floor(cssH * dpr);
    simCols = Math.min(MAX_SIM_COLS, Math.floor(cssW / SIM_SCALE));
    simRows = Math.max(1, Math.floor((simCols * cssH) / cssW));
    if (texA) gl.deleteTexture(texA);
    if (texB) gl.deleteTexture(texB);
    if (fboA) gl.deleteFramebuffer(fboA);
    if (fboB) gl.deleteFramebuffer(fboB);
    texA = makeTex();
    texB = makeTex();
    fboA = makeFbo(texA);
    fboB = makeFbo(texB);
    seed();
    status.value = `${simCols}x${simRows} · ${use32F.value ? 'RGBA32F' : 'RGBA16F'} · linear:${linearOK.value}`;
  }

  function loop(now: number) {
    for (let i = 0; i < ITERS_PER_FRAME; i++) {
      simStep();
      frame++;
    }
    display();
    framesSince++;
    if (now - lastFpsAt > 500) {
      fps.value = Math.round((framesSince * 1000) / (now - lastFpsAt));
      framesSince = 0;
      lastFpsAt = now;
    }
    rafId = requestAnimationFrame(loop);
  }

  // Precision + resize need full texture reallocation; the rest are live uniforms.
  watch(use32F, () => sizeAndReset());

  onMounted(() => {
    const c = canvasEl.value;
    if (!c) return;
    gl = c.getContext('webgl2', { alpha: false, antialias: false });
    if (!gl) {
      status.value = 'no webgl2';
      return;
    }
    if (!gl.getExtension('EXT_color_buffer_float')) {
      status.value = 'no EXT_color_buffer_float';
      return;
    }
    linearOK.value = !!gl.getExtension('OES_texture_float_linear');
    simProgram = link(QUAD_VERT, SIM_FRAG);
    seedProgram = link(QUAD_VERT, SEED_FRAG);
    displayProgram = link(QUAD_VERT, DISPLAY_FRAG);
    if (!simProgram || !seedProgram || !displayProgram) return;
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
      'uGlobalDecay',
      'uBarrenDecay',
      'uDrift',
      'uAspect',
      'uSeedTime',
      'uSeedProb',
      'uUseMask',
      'uUseSeed',
    ])
      simU[k] = gl.getUniformLocation(simProgram, k);
    for (const k of [
      'uState',
      'uColor',
      'uThreshLo',
      'uThreshHi',
      'uMaxAlpha',
      'uView',
      'uNoiseFreq',
      'uFertileThresh',
      'uFertileEdge',
      'uAspect',
      'uDrift',
    ])
      dispU[k] = gl.getUniformLocation(displayProgram, k);
    for (const k of ['uNuclei', 'uAspect', 'uRadius'])
      seedU[k] = gl.getUniformLocation(seedProgram, k);

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

    sizeAndReset();
    window.addEventListener('resize', sizeAndReset);
    rafId = requestAnimationFrame(loop);
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', sizeAndReset);
  });
</script>

<template>
  <div class="rd-dev">
    <canvas ref="canvasEl" class="rd-dev-canvas" />
    <div class="rd-dev-panel">
      <p class="rd-dev-status">{{ status }} · {{ fps }}fps</p>

      <label><input v-model="useMask" type="checkbox" /> fertility mask</label>
      <label><input v-model="useDrift" type="checkbox" /> drift</label>
      <label><input v-model="useSeed" type="checkbox" /> seeding</label>
      <label><input v-model="use32F" type="checkbox" /> RGBA32F</label>
      <label>
        <input v-model="classicParams" type="checkbox" />
        classic params (0.16/0.08/dt1)
      </label>

      <p class="rd-dev-group">view</p>
      <label v-for="m in ['composite', 'v', 'u', 'mask']" :key="m">
        <input v-model="view" type="radio" :value="m" />
        {{ m }}
      </label>

      <button type="button" @click="seed()">reseed</button>

      <p class="rd-dev-hint">
        Decisive test: turn OFF mask, drift and seeding. That is pure Gray-Scott
        from nuclei — it must spread and persist. If it fades, the reaction is
        broken and everything else is cosmetic.
      </p>
    </div>
  </div>
</template>

<style scoped>
  .rd-dev {
    position: fixed;
    inset: 0;
    background: #f5f1e8;
  }

  .rd-dev-canvas {
    position: absolute;
    inset: 0;
    width: 100vw;
    height: 100vh;
  }

  .rd-dev-panel {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-width: 17rem;
    padding: 0.75rem 1rem;
    background: rgb(255 255 255 / 0.92);
    border: 1px solid #0c112b;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    line-height: 1.5;
  }

  .rd-dev-status {
    margin: 0 0 0.25rem;
    font-weight: 700;
  }

  .rd-dev-group {
    margin: 0.5rem 0 0;
    font-weight: 700;
  }

  .rd-dev-hint {
    margin: 0.5rem 0 0;
    opacity: 0.75;
  }

  button {
    margin-top: 0.5rem;
    padding: 0.25rem;
    font: inherit;
  }
</style>
