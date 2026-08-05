<script setup lang="ts">
  // Reaction-diffusion debug harness. Disposable dev-only page for isolating the
  // subsystems of HomeReactionDiffusionBackground — the reaction, the fertility
  // mask, the drift and the nucleation are independently controllable, and the
  // display can show the raw fields instead of the composited look.
  //
  // The point is to stop judging coupled systems through one output. Established
  // here: the reaction is healthy (mask + drift off is persistent coral); the
  // old per-cell hash seeding is what drew the diagonal "wind" and has been
  // deleted; drift and decay must be rates per second, not per sim step.
  //
  // Not linked from anywhere. Kept after Thread B as a possible easter egg /
  // blog-post toy, so it is maintained rather than disposable.

  definePageMeta({ layout: false });

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const status = ref('booting');
  const fps = ref(0);
  const linearOK = ref(false);
  // Tilt readout: is the device actually delivering deviceorientation events?
  // Android should; iOS will not, because we never call requestPermission().
  // The panel is taller than a phone screen, so it starts collapsed there and
  // only the status header shows.
  const collapsed = ref(false);
  const tiltEvents = ref(0);
  const tiltBeta = ref(0);
  const tiltGamma = ref(0);

  // DEFAULTS MIRROR HomeReactionDiffusionBackground.vue. They had drifted apart
  // — different fertility threshold, nucleus radius, grid size — so the harness
  // stopped previewing the homepage and showed a worse pattern than the real
  // thing. Keep them in step when either side is tuned.

  // Toggles (reactive → pushed into uniforms each frame).
  const useMask = ref(true);
  const useDrift = ref(true);
  const use32F = ref(false);
  const classicParams = ref(false);
  // Sim state must be read with NEAREST: with LINEAR, a vUv that lands a hair
  // off a texel centre makes every neighbour read a BLEND of two texels, which
  // is a sub-texel smear in a fixed direction applied ~1000x/sec — advection,
  // i.e. the "wind". Display still upscales with LINEAR.
  const nearestSim = ref(true);
  // Whether 1/N is exactly representable (N a power of two) decides how bad the
  // LINEAR bias is — so the viewport silently selects whether the bug shows.
  const pow2Grid = ref(false);
  const iters = ref(15);
  const view = ref<'composite' | 'v' | 'u' | 'mask'>('composite');

  // Live parameters. F/k choose the Gray-Scott regime — coral settles into a
  // static maze, while mitosis/u-skate/chaos never settle, which is where
  // intrinsic (non-drift) motion comes from. Drift and decay are per SECOND:
  // they used to be applied per sim step, so their real strength was silently
  // multiplied by the iteration count.
  const feed = ref(0.0496);
  const kill = ref(0.0619);
  const driftSpeed = ref(0.085); // noise units per second — the dominant motion
  const barrenDecayPerSec = ref(16.7);
  const globalDecayPerSec = ref(0.11);
  const fertileThresh = ref(0.34);
  const noiseFreq = ref(5.5);
  const maskDetail = ref(0); // 0 = single octave (the tuned look); up = fuzzier
  const nucleationRate = ref(1.5); // blobs per second, planted in fertile land
  const nucleusRadius = ref(0.002); // uv radius of one blob
  // 0 = fixed heading (conveyor belt); up = the heading wanders, so the drift
  // follows a curved, meandering path.
  const driftWander = ref(1);

  // Influence point ("the ball"): the mouse drives it on desktop; on touch it is
  // grabbed by a finger, rolled by device tilt, and kept alive by a slow wander.
  const showMarker = ref(true);
  const boostRadius = ref(0.14);
  const killDrop = ref(0.018);
  const killMin = ref(0.044);
  const wanderAccel = ref(0.16);
  const ballDrag = ref(1.7);
  const ballBounce = ref(0.45);

  // Tilt sloshes the whole fertility field like water in a shallow pan, rather
  // than rolling a point through it: tilt accelerates the drift and drag lets it
  // coast back, so levelling the device makes the field settle instead of stop.
  // The accel range spans zero because the sign of `gamma`/`beta` versus the
  // direction the pattern should travel is a convention worth flipping by eye.
  // Tilt is a BOUNDED POSITION MAP (rellax-style parallax), not an acceleration:
  // acceleration integrates, so a sustained tilt runs away and a phone held
  // still keeps sloshing ever faster. A dead zone and a slowly-adapting neutral
  // make rest mean "however you are holding it" rather than "perfectly level".
  const tiltDeadzone = ref(0.06);
  const tiltRange = ref(0.45);
  const tiltRecalibrate = ref(1.82);
  // Hard cap on how fast the offset may change (noise units/sec). Bounding the
  // offset limits how FAR the pattern travels; this limits how FAST, which is
  // what keeps a sharp tilt from sending it sprinting into stripes.
  const tiltMaxSpeed = ref(0.05);
  const tiltMaxOffset = ref(0.2);
  const tiltEase = ref(2.5);
  const tiltNeutralAdapt = ref(0.05);
  // Sloshing moves the fertile band faster than coral can creep into it, so the
  // barren side simply wipes the pattern out. These let growth keep up: more
  // nucleation while sloshing (growth starts AHEAD of the band instead of only
  // spreading from existing coral) and a kill reduction so it matures faster.
  const sloshGrowth = ref(0.006); // kill reduction at full slosh
  // Slosh drives the REACTION rather than extra seeding: feeding it seeds to
  // keep up just floods the field into solid walls. v diffuses harder ALONG the
  // tilt axis and is transported TOWARD it, so the coral fingers reach that way.
  // aniso/advect kept small: both MOVE the pattern rather than growing it, and
  // past a little they read as rolling tiger stripes. The rate gradient is the
  // main mechanism — the reaction just runs faster toward the tilt.
  const sloshAniso = ref(0.65);
  const sloshAdvect = ref(0.06);
  const sloshRate = ref(0.25);
  const sloshFertile = ref(0.06);

  const PRESETS: Record<string, [number, number]> = {
    coral: [0.0545, 0.062],
    mitosis: [0.0367, 0.0649],
    worms: [0.058, 0.065],
    maze: [0.029, 0.057],
    uskate: [0.062, 0.0609],
    chaos: [0.026, 0.051],
    spots: [0.014, 0.054],
  };

  function applyPreset(name: string) {
    const p = PRESETS[name];
    if (!p) return;
    feed.value = p[0];
    kill.value = p[1];
  }

  const SIM_SCALE = 3.75; // matches the component
  const MAX_SIM_COLS = 700;
  const FERTILE_EDGE = 0.14;
  const DRIFT_BASE_ANGLE = 0.51; // radians; the heading when wander is 0
  const DRIFT_TURN_A = 0.037; // rad/sec of the slow wander terms
  const DRIFT_TURN_B = 0.0163;
  const SEED_NUCLEI = 14;
  const NUCLEUS_RADIUS = 0.02;
  const COLOR: readonly [number, number, number] = [205, 222, 255];
  const THRESH_LO = 0.13;
  const THRESH_HI = 0.22;
  const MAX_ALPHA = 0.62;

  // Shared so the sim, the stamp pass and the mask view all agree on exactly
  // where fertile land is. maskDetail folds in a second octave to break up the
  // obvious blobbiness of a single-octave value noise.
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
  uniform float uNoiseFreq, uFertileThresh, uFertileEdge;
  uniform float uGlobalDecay, uBarrenDecay;
  uniform vec2 uDrift;
  uniform float uAspect;
  uniform float uUseMask;
  uniform float uMaskDetail;
  uniform vec2 uPointer;
  uniform float uPointerActive, uKillDrop, uKillMin, uBoostRadius, uTime;
  uniform vec2 uSloshVec; // screen-space tilt direction, length = 0..1
  uniform float uSloshAniso, uSloshAdvect, uSloshRate, uSloshFertile;
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

    float decay = 0.0;
    float barren = 0.0;
    if (uUseMask > 0.5) {
      float fert =
        fertAt(vUv, uAspect, uNoiseFreq, uDrift, uMaskDetail);
      barren = clamp((uFertileThresh - fert) / uFertileEdge, 0.0, 1.0);
      decay = uGlobalDecay + uBarrenDecay * barren;
    }

    // Influence point lowers the local kill so coral grows toward it, broken up
    // by a drifting speckle field so it reads as growth rather than a painted disc.
    float kill = uKill;
    if (uPointerActive > 0.5) {
      vec2 pd = vUv - uPointer;
      pd.x *= uAspect;
      float dist = length(pd) / uBoostRadius;
      if (dist < 1.0) {
        float speck = vnoise(
          vec2(vUv.x * uAspect, vUv.y) * 42.0 + vec2(uTime * 0.35, uTime * -0.27)
        );
        kill = max(uKillMin, kill - uKillDrop * (1.0 - dist) * smoothstep(0.28, 0.72, speck));
      }
    }

    // Slosh makes the reaction directional: extra diffusion along the tilt axis
    // stretches the pattern that way, and an upwind transport term carries v
    // toward the tilt so growth reaches ahead.
    float advect = 0.0;
    float dt = uDt;
    float sloshLen = length(uSloshVec);

    if (sloshLen > 0.001) {
      vec2 dir = uSloshVec / sloshLen;
      vec2 off = dir * uTexel * 1.5;
      float vp = texture(uState, vUv + off).y;
      float vm = texture(uState, vUv - off).y;

      lap.y += uSloshAniso * sloshLen * (vp + vm - 2.0 * v);
      advect = uSloshAdvect * sloshLen * (vm - vp);

      // The main mechanism: the reaction simply RUNS FASTER toward the tilt —
      // a smooth ramp from the trailing edge to the leading one. The pattern
      // stays isotropic coral and stays put; it just grows harder on that side.
      // Transporting or stretching it instead reads as rolling stripes, because
      // both move the pattern rather than growing it.
      float ramp = clamp(dot(vUv - 0.5, dir) * 2.0 + 0.5, 0.0, 1.0);

      dt = uDt * (1.0 + uSloshRate * sloshLen * ramp);
    }

    float uvv = u * v * v;
    float nu = u + (uDu * lap.x - uvv + uFeed * (1.0 - u)) * dt;
    float nv = v + (uDv * lap.y + uvv - (uFeed + kill) * v + advect) * dt;
    nv -= nv * decay;

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
  uniform float uMaskDetail;
  uniform vec2 uPointer;
  uniform float uShowMarker, uBoostRadius, uAspect2;
  ${NOISE_GLSL}

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
      float fert = fertAt(vUv, uAspect, uNoiseFreq, uDrift, uMaskDetail);
      float barren = clamp((uFertileThresh - fert) / uFertileEdge, 0.0, 1.0);
      // green = fertile (reaction survives), red = barren (v is decayed away)
      outColor = vec4(barren, 1.0 - barren, 0.2, 1.0);
    }

    // Debug marker: a magenta ring at the influence radius plus a centre dot,
    // so the influence point is locatable even where the coral does not react.
    if (uShowMarker > 0.5) {
      vec2 pd = vUv - uPointer;
      pd.x *= uAspect2;
      float d = length(pd);
      float ring = abs(d - uBoostRadius);
      float px = fwidth(d) * 1.5;
      float onRing = 1.0 - smoothstep(0.0, px, ring);
      float onDot = 1.0 - smoothstep(0.0, px, d - uBoostRadius * 0.06);
      float m = max(onRing, onDot);
      outColor = mix(outColor, vec4(1.0, 0.1, 0.7, 1.0), m);
    }
  }`;

  // Discrete nucleation: copies the state and plants whole blobs at given uv
  // centres, skipping any centre that lands on barren ground. Unlike the old
  // per-cell hash seeding (whose lucky set slid one cell per step and therefore
  // DREW diagonal lines), each blob is an isolated event with no direction, so
  // it cannot produce streaks. It also lets growth start ahead of an advancing
  // fertile front instead of only spreading from existing coral, which is what
  // sets the drift-speed ceiling.
  const MAX_STAMPS = 8;
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

  let gl: WebGL2RenderingContext | null = null;
  let simProgram: WebGLProgram | null = null;
  let seedProgram: WebGLProgram | null = null;
  let displayProgram: WebGLProgram | null = null;
  let quadVao: WebGLVertexArrayObject | null = null;
  let texA: WebGLTexture | null = null;
  let texB: WebGLTexture | null = null;
  let fboA: WebGLFramebuffer | null = null;
  let fboB: WebGLFramebuffer | null = null;
  let samplerNearest: WebGLSampler | null = null;
  let samplerLinear: WebGLSampler | null = null;
  let simCols = 0;
  let simRows = 0;
  let cssW = 0;
  let cssH = 0;
  let rafId = 0;
  let lastFpsAt = 0;
  let framesSince = 0;
  let lastTime = 0;
  let elapsed = 0;
  let driftX = 0;
  let driftY = 0;
  let hasFinePointer = true;
  let touching = false;
  let ballU = 0.5;
  let ballV = 0.5;
  let ballVX = 0;
  let ballVY = 0;
  let pointerActive = false;
  let rawBeta: number | null = null;
  let rawGamma = 0;
  let neutralBetaAdapt: number | null = null;
  let neutralGammaAdapt = 0;
  let tiltOffX = 0;
  let tiltOffY = 0;
  let tiltMag = 0;

  const simU: Record<string, WebGLUniformLocation | null> = {};
  const dispU: Record<string, WebGLUniformLocation | null> = {};
  const seedU: Record<string, WebGLUniformLocation | null> = {};
  const stampU: Record<string, WebGLUniformLocation | null> = {};
  let stampProgram: WebGLProgram | null = null;
  let stampAccum = 0; // fractional blobs carried between frames

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
  }

  // stepSeconds: wall-clock seconds this single sim step represents, so decay
  // and drift are rates per second rather than per step.
  function simStep(stepSeconds: number) {
    if (!gl || !simProgram) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboB);
    gl.viewport(0, 0, simCols, simRows);
    gl.useProgram(simProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.bindSampler(0, nearestSim.value ? samplerNearest : samplerLinear);
    gl.uniform1i(simU.uState, 0);
    gl.uniform2f(simU.uTexel, 1 / simCols, 1 / simRows);
    gl.uniform1f(simU.uDu, classicParams.value ? 0.16 : 0.32);
    gl.uniform1f(simU.uDv, classicParams.value ? 0.08 : 0.16);
    gl.uniform1f(simU.uDt, classicParams.value ? 1.0 : 0.6);
    gl.uniform1f(simU.uFeed, feed.value);
    gl.uniform1f(simU.uKill, kill.value - sloshGrowth.value * tiltMag);
    gl.uniform1f(simU.uNoiseFreq, noiseFreq.value);
    gl.uniform1f(simU.uFertileThresh, fertileThresh.value);
    gl.uniform1f(simU.uFertileEdge, FERTILE_EDGE);
    gl.uniform1f(simU.uGlobalDecay, globalDecayPerSec.value * stepSeconds);
    gl.uniform1f(simU.uBarrenDecay, barrenDecayPerSec.value * stepSeconds);
    gl.uniform2f(simU.uDrift, driftX + tiltOffX, driftY + tiltOffY);
    gl.uniform1f(simU.uAspect, cssW / cssH);
    gl.uniform1f(simU.uUseMask, useMask.value ? 1 : 0);
    gl.uniform1f(simU.uMaskDetail, maskDetail.value);
    gl.uniform2f(simU.uPointer, ballU, ballV);
    gl.uniform1f(simU.uPointerActive, pointerActive ? 1 : 0);
    gl.uniform1f(simU.uKillDrop, killDrop.value);
    gl.uniform1f(simU.uKillMin, killMin.value);
    gl.uniform1f(simU.uBoostRadius, boostRadius.value);
    gl.uniform1f(simU.uTime, elapsed);
    const tiltLen = Math.hypot(tiltOffX, tiltOffY) || 1;

    gl.uniform2f(
      simU.uSloshVec,
      (-tiltOffX / tiltLen) * tiltMag,
      (-tiltOffY / tiltLen) * tiltMag,
    );
    gl.uniform1f(simU.uSloshAniso, sloshAniso.value);
    gl.uniform1f(simU.uSloshAdvect, sloshAdvect.value);
    gl.uniform1f(simU.uSloshRate, sloshRate.value);
    gl.uniform1f(simU.uSloshFertile, sloshFertile.value);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const t = texA;
    texA = texB;
    texB = t;
    const f = fboA;
    fboA = fboB;
    fboB = f;
  }

  // Plant `count` blobs at random uv positions; the shader drops any that land
  // on barren ground. One pass for the whole batch.
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
    gl.uniform1f(stampU.uRadius, nucleusRadius.value);
    gl.uniform1f(stampU.uAspect, cssW / cssH);
    gl.uniform1f(stampU.uNoiseFreq, noiseFreq.value);
    gl.uniform1f(stampU.uFertileThresh, fertileThresh.value);
    gl.uniform1f(stampU.uMaskDetail, maskDetail.value);
    gl.uniform2f(stampU.uDrift, driftX + tiltOffX, driftY + tiltOffY);
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
    gl.bindSampler(0, linearOK.value ? samplerLinear : samplerNearest);
    gl.uniform1i(dispU.uState, 0);
    gl.uniform3f(dispU.uColor, COLOR[0] / 255, COLOR[1] / 255, COLOR[2] / 255);
    gl.uniform1f(dispU.uThreshLo, THRESH_LO);
    gl.uniform1f(dispU.uThreshHi, THRESH_HI);
    gl.uniform1f(dispU.uMaxAlpha, MAX_ALPHA);
    const modes = { composite: 0, v: 1, u: 2, mask: 3 };
    gl.uniform1f(dispU.uView, modes[view.value]);
    gl.uniform1f(dispU.uNoiseFreq, noiseFreq.value);
    gl.uniform1f(dispU.uFertileThresh, fertileThresh.value);
    gl.uniform1f(dispU.uFertileEdge, FERTILE_EDGE);
    gl.uniform1f(dispU.uAspect, cssW / cssH);
    gl.uniform2f(dispU.uDrift, driftX + tiltOffX, driftY + tiltOffY);
    gl.uniform1f(dispU.uMaskDetail, maskDetail.value);
    gl.uniform2f(dispU.uPointer, ballU, ballV);
    gl.uniform1f(dispU.uShowMarker, showMarker.value ? 1 : 0);
    gl.uniform1f(dispU.uBoostRadius, boostRadius.value);
    gl.uniform1f(dispU.uAspect2, cssW / cssH);
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
    if (pow2Grid.value) {
      simCols = 512;
      simRows = 256;
    } else {
      simCols = Math.min(MAX_SIM_COLS, Math.floor(cssW / SIM_SCALE));
      simRows = Math.max(1, Math.floor((simCols * cssH) / cssW));
    }
    if (texA) gl.deleteTexture(texA);
    if (texB) gl.deleteTexture(texB);
    if (fboA) gl.deleteFramebuffer(fboA);
    if (fboB) gl.deleteFramebuffer(fboB);
    texA = makeTex();
    texB = makeTex();
    fboA = makeFbo(texA);
    fboB = makeFbo(texB);
    seed();
    const pow2 = (n: number) => (n & (n - 1)) === 0;
    status.value =
      `${simCols}x${simRows}${pow2(simCols) && pow2(simRows) ? ' (pow2)' : ''}` +
      ` · ${use32F.value ? '32F' : '16F'} · sim:${nearestSim.value ? 'NEAREST' : 'LINEAR'}`;
  }

  function loop(now: number) {
    // Clamped so a background tab or a long stall can't jump the whole field.
    const dtSec = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
    lastTime = now;
    elapsed += dtSec;
    if (useDrift.value) {
      // Integrate along a wandering heading so the path curves over time.
      const angle =
        DRIFT_BASE_ANGLE +
        driftWander.value *
          (1.2 * Math.sin(DRIFT_TURN_A * elapsed) +
            0.7 * Math.sin(DRIFT_TURN_B * elapsed + 2.1));
      driftX += Math.cos(angle) * driftSpeed.value * dtSec;
      driftY += Math.sin(angle) * driftSpeed.value * dtSec;
    }

    updateTilt(dtSec);
    const stepSeconds = dtSec / Math.max(1, iters.value);
    updateBall(dtSec);
    stampAccum += nucleationRate.value * dtSec;
    if (stampAccum >= 1) {
      const n = Math.min(MAX_STAMPS, Math.floor(stampAccum));
      stampAccum -= Math.floor(stampAccum);
      stampNuclei(n);
    }
    for (let i = 0; i < iters.value; i++) {
      simStep(stepSeconds);
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
  watch([use32F, pow2Grid], () => sizeAndReset());
  watch(nearestSim, () => sizeAndReset());

  function handleOrientation(e: DeviceOrientationEvent) {
    if (e.beta === null || e.gamma === null) return;
    tiltEvents.value++;
    tiltBeta.value = e.beta;
    tiltGamma.value = e.gamma;
    rawBeta = e.beta;
    rawGamma = e.gamma;
  }

  function deadzone(value: number) {
    const past = Math.max(0, Math.abs(value) - tiltDeadzone.value);

    return (
      Math.sign(value) * Math.min(1, past / Math.max(0.01, tiltRange.value))
    );
  }

  function updateTilt(dtSec: number) {
    if (rawBeta === null) return;

    // Gravity projected on the screen plane, not raw angles: gamma is
    // ill-conditioned near vertical (beta ~ 90deg) and swings wildly on tiny
    // movements, which is what made an upright phone strobe. cos(beta) takes its
    // influence to zero exactly where it goes unstable.
    const b = (rawBeta * Math.PI) / 180;
    const g = (rawGamma * Math.PI) / 180;
    const gx = Math.cos(b) * Math.sin(g);
    const gy = Math.sin(b);

    if (neutralBetaAdapt === null) {
      neutralBetaAdapt = gy;
      neutralGammaAdapt = gx;
    }

    // parallax.js's calibration threshold: stray far enough and the zero moves
    // to here, so a new resting attitude stops reading as a held tilt.
    if (
      Math.hypot(gx - neutralGammaAdapt, gy - neutralBetaAdapt) >
      tiltRecalibrate.value
    ) {
      neutralGammaAdapt = gx;
      neutralBetaAdapt = gy;
    }

    const adapt = 1 - Math.exp(-tiltNeutralAdapt.value * dtSec);

    neutralBetaAdapt += (gy - neutralBetaAdapt) * adapt;
    neutralGammaAdapt += (gx - neutralGammaAdapt) * adapt;

    const nx = deadzone(gx - neutralGammaAdapt);
    const ny = -deadzone(gy - neutralBetaAdapt);
    const ease = 1 - Math.exp(-tiltEase.value * dtSec);
    const max = tiltMaxOffset.value;

    let nextX = tiltOffX + (-nx * max - tiltOffX) * ease;
    let nextY = tiltOffY + (-ny * max - tiltOffY) * ease;
    const stepX = nextX - tiltOffX;
    const stepY = nextY - tiltOffY;
    const step = Math.hypot(stepX, stepY);
    const maxStep = tiltMaxSpeed.value * dtSec;

    if (step > maxStep) {
      nextX = tiltOffX + (stepX / step) * maxStep;
      nextY = tiltOffY + (stepY / step) * maxStep;
    }

    tiltOffX = nextX;
    tiltOffY = nextY;
    tiltMag = Math.min(1, Math.hypot(tiltOffX, tiltOffY) / Math.max(0.001, max));
  }

  function handleMouseMove(e: MouseEvent) {
    ballU = e.clientX / cssW;
    ballV = 1 - e.clientY / cssH; // clientY grows down, uv.y grows up
    ballVX = 0;
    ballVY = 0;
    pointerActive = true;
  }

  function handleTouch(e: TouchEvent) {
    const t = e.touches[0];
    if (!t || cssW <= 0 || cssH <= 0) return;
    touching = true;
    pointerActive = true;
    ballU = t.clientX / cssW;
    ballV = 1 - t.clientY / cssH;
    ballVX = 0;
    ballVY = 0;
  }

  function handleTouchEnd() {
    touching = false;
  }

  // Tilt is an ACCELERATION on a ball with drag, not a direct position map: a
  // phone is normally held at a slant, so absolute tilt would peg the point to
  // an edge instead of letting it roll and settle.
  function updateBall(dtSec: number) {
    if (hasFinePointer || touching) return;
    pointerActive = true;
    // Tilt drives the drift slosh now, not the ball, so the ball only wanders.
    const wander = wanderAccel.value;
    const ax = Math.sin(elapsed * 0.23) * wander;
    const ay = Math.cos(elapsed * 0.19 + 1.3) * wander;
    const damp = Math.exp(-ballDrag.value * dtSec);
    ballVX = (ballVX + ax * dtSec) * damp;
    ballVY = (ballVY + ay * dtSec) * damp;
    ballU += ballVX * dtSec;
    ballV += ballVY * dtSec;
    if (ballU < 0) {
      ballU = 0;
      ballVX = Math.abs(ballVX) * ballBounce.value;
    } else if (ballU > 1) {
      ballU = 1;
      ballVX = -Math.abs(ballVX) * ballBounce.value;
    }
    if (ballV < 0) {
      ballV = 0;
      ballVY = Math.abs(ballVY) * ballBounce.value;
    } else if (ballV > 1) {
      ballV = 1;
      ballVY = -Math.abs(ballVY) * ballBounce.value;
    }
  }

  onMounted(() => {
    collapsed.value = window.innerWidth < 700;
    hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasFinePointer) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    } else {
      window.addEventListener('touchstart', handleTouch, { passive: true });
      window.addEventListener('touchmove', handleTouch, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
      window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }
    window.addEventListener('deviceorientation', handleOrientation, {
      passive: true,
    });
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
    stampProgram = link(QUAD_VERT, STAMP_FRAG);
    if (!simProgram || !seedProgram || !displayProgram || !stampProgram) return;
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
    ])
      stampU[k] = gl.getUniformLocation(stampProgram, k);
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
      'uUseMask',
      'uMaskDetail',
      'uPointer',
      'uPointerActive',
      'uKillDrop',
      'uKillMin',
      'uBoostRadius',
      'uTime',
      'uSloshVec',
      'uSloshAniso',
      'uSloshAdvect',
      'uSloshRate',
      'uSloshFertile',
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
      'uMaskDetail',
      'uPointer',
      'uShowMarker',
      'uBoostRadius',
      'uAspect2',
    ])
      dispU[k] = gl.getUniformLocation(displayProgram, k);
    for (const k of ['uNuclei', 'uAspect', 'uRadius'])
      seedU[k] = gl.getUniformLocation(seedProgram, k);

    // Sampler objects let the same state texture be read NEAREST by the sim
    // (exact texel reads) and LINEAR by the display (smooth upscale).
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

    sizeAndReset();
    window.addEventListener('resize', sizeAndReset);
    rafId = requestAnimationFrame(loop);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchstart', handleTouch);
    window.removeEventListener('touchmove', handleTouch);
    window.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('touchcancel', handleTouchEnd);
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', sizeAndReset);
  });
</script>

<template>
  <div class="rd-dev">
    <canvas ref="canvasEl" class="rd-dev-canvas" />
    <div class="rd-dev-panel" :class="{ 'is-collapsed': collapsed }">
      <!-- Header stays visible while collapsed: on a phone the readout IS the
           thing being checked, so it must not be behind a toggle. -->
      <div class="rd-dev-head">
        <div>
          <p class="rd-dev-status">{{ status }} · {{ fps }}fps</p>
          <p class="rd-dev-status" :class="{ 'is-live': tiltEvents }">
            tilt:
            <template v-if="tiltEvents">
              b {{ tiltBeta.toFixed(0) }} g {{ tiltGamma.toFixed(0) }} ({{
                tiltEvents
              }} events)
            </template>
            <template v-else>no events</template>
          </p>
        </div>
        <button
          class="rd-dev-toggle"
          type="button"
          :aria-expanded="!collapsed"
          @click="collapsed = !collapsed"
        >
          {{ collapsed ? 'controls ▾' : 'hide ▴' }}
        </button>
      </div>

      <div class="rd-dev-body">
      <label><input v-model="useMask" type="checkbox" /> fertility mask</label>
      <label><input v-model="useDrift" type="checkbox" /> drift</label>
      <label><input v-model="use32F" type="checkbox" /> RGBA32F</label>
      <label>
        <input v-model="classicParams" type="checkbox" />
        classic params (0.16/0.08/dt1)
      </label>
      <label>
        <input v-model="nearestSim" type="checkbox" />
        NEAREST sim reads
      </label>
      <label>
        <input v-model="pow2Grid" type="checkbox" />
        force 512x256 grid
      </label>
      <label>
        iters/frame {{ iters }}
        <input v-model.number="iters" type="range" min="1" max="40" />
      </label>

      <p class="rd-dev-group">regime (F/k)</p>
      <div class="rd-dev-presets">
        <button
          v-for="(p, name) in PRESETS"
          :key="name"
          type="button"
          @click="applyPreset(name)"
        >
          {{ name }}
        </button>
      </div>
      <label>
        feed {{ feed.toFixed(4) }}
        <input
          v-model.number="feed"
          type="range"
          min="0.008"
          max="0.09"
          step="0.0001"
        />
      </label>
      <label>
        kill {{ kill.toFixed(4) }}
        <input
          v-model.number="kill"
          type="range"
          min="0.04"
          max="0.072"
          step="0.0001"
        />
      </label>

      <p class="rd-dev-group">turnover</p>
      <label>
        drift/sec {{ driftSpeed.toFixed(3) }}
        <input
          v-model.number="driftSpeed"
          type="range"
          min="0"
          max="0.4"
          step="0.001"
        />
      </label>
      <label>
        drift wander {{ driftWander.toFixed(2) }}
        <input
          v-model.number="driftWander"
          type="range"
          min="0"
          max="2"
          step="0.01"
        />
      </label>
      <label>
        barren decay/sec {{ barrenDecayPerSec.toFixed(1) }}
        <input
          v-model.number="barrenDecayPerSec"
          type="range"
          min="0"
          max="30"
          step="0.1"
        />
      </label>
      <label>
        global decay/sec {{ globalDecayPerSec.toFixed(2) }}
        <input
          v-model.number="globalDecayPerSec"
          type="range"
          min="0"
          max="3"
          step="0.01"
        />
      </label>

      <p class="rd-dev-group">tilt slosh</p>
      <label>
        tilt offset {{ tiltMaxOffset.toFixed(2) }}
        <input v-model.number="tiltMaxOffset" type="range" min="0" max="1.5" step="0.01" />
      </label>
      <label>
        tilt span {{ tiltRange.toFixed(2) }}
        <input v-model.number="tiltRange" type="range" min="0.05" max="1.5" step="0.01" />
      </label>
      <label>
        tilt deadzone {{ tiltDeadzone.toFixed(2) }}
        <input v-model.number="tiltDeadzone" type="range" min="0" max="0.4" step="0.01" />
      </label>
      <label>
        tilt max speed {{ tiltMaxSpeed.toFixed(3) }}
        <input v-model.number="tiltMaxSpeed" type="range" min="0.005" max="0.5" step="0.005" />
      </label>
      <label>
        recalibrate at {{ tiltRecalibrate.toFixed(2) }}
        <input v-model.number="tiltRecalibrate" type="range" min="0.1" max="2" step="0.01" />
      </label>
      <label>
        tilt ease {{ tiltEase.toFixed(2) }}
        <input v-model.number="tiltEase" type="range" min="0.1" max="8" step="0.05" />
      </label>
      <label>
        neutral adapt {{ tiltNeutralAdapt.toFixed(3) }}/s
        <input v-model.number="tiltNeutralAdapt" type="range" min="0" max="0.5" step="0.005" />
      </label>

      <label>
        slosh fertile {{ sloshFertile.toFixed(3) }}
        <input v-model.number="sloshFertile" type="range" min="0" max="0.2" step="0.002" />
      </label>
      <label>
        slosh rate {{ sloshRate.toFixed(2) }}
        <input v-model.number="sloshRate" type="range" min="0" max="4" step="0.05" />
      </label>
      <label>
        slosh aniso {{ sloshAniso.toFixed(2) }}
        <input v-model.number="sloshAniso" type="range" min="0" max="4" step="0.05" />
      </label>
      <label>
        slosh advect {{ sloshAdvect.toFixed(2) }}
        <input v-model.number="sloshAdvect" type="range" min="0" max="1.5" step="0.01" />
      </label>
      <label>
        slosh growth {{ sloshGrowth.toFixed(4) }}
        <input v-model.number="sloshGrowth" type="range" min="0" max="0.02" step="0.0005" />
      </label>


      <p class="rd-dev-group">influence point</p>
      <label>
        <input v-model="showMarker" type="checkbox" />
        show marker (magenta ring)
      </label>
      <label>
        boost radius {{ boostRadius.toFixed(3) }}
        <input
          v-model.number="boostRadius"
          type="range"
          min="0.02"
          max="0.5"
          step="0.005"
        />
      </label>
      <label>
        kill drop {{ killDrop.toFixed(4) }}
        <input
          v-model.number="killDrop"
          type="range"
          min="0"
          max="0.06"
          step="0.0005"
        />
      </label>
      <label>
        kill floor {{ killMin.toFixed(4) }}
        <input
          v-model.number="killMin"
          type="range"
          min="0.03"
          max="0.062"
          step="0.0005"
        />
      </label>
      <label>
        wander accel {{ wanderAccel.toFixed(2) }}
        <input
          v-model.number="wanderAccel"
          type="range"
          min="0"
          max="1"
          step="0.01"
        />
      </label>
      <label>
        ball drag {{ ballDrag.toFixed(2) }}
        <input
          v-model.number="ballDrag"
          type="range"
          min="0.2"
          max="6"
          step="0.05"
        />
      </label>

      <p class="rd-dev-group">nucleation</p>
      <label>
        blobs/sec {{ nucleationRate.toFixed(1) }}
        <input
          v-model.number="nucleationRate"
          type="range"
          min="0"
          max="25"
          step="0.5"
        />
      </label>
      <label>
        blob radius {{ nucleusRadius.toFixed(3) }}
        <input
          v-model.number="nucleusRadius"
          type="range"
          min="0.002"
          max="0.05"
          step="0.001"
        />
      </label>

      <p class="rd-dev-group">negative space</p>
      <label>
        mask detail {{ maskDetail.toFixed(2) }}
        <input
          v-model.number="maskDetail"
          type="range"
          min="0"
          max="1"
          step="0.01"
        />
      </label>
      <label>
        fertile thresh {{ fertileThresh.toFixed(2) }}
        <input
          v-model.number="fertileThresh"
          type="range"
          min="0"
          max="0.8"
          step="0.01"
        />
      </label>
      <label>
        noise freq {{ noiseFreq.toFixed(1) }}
        <input
          v-model.number="noiseFreq"
          type="range"
          min="0.5"
          max="8"
          step="0.1"
        />
      </label>

      <p class="rd-dev-group">view</p>
      <label v-for="m in ['composite', 'v', 'u', 'mask']" :key="m">
        <input v-model="view" type="radio" :value="m" />
        {{ m }}
      </label>

      <p class="rd-dev-hint">
        Two independent sources of motion: the F/k regime (coral settles into a
        static maze; mitosis / u-skate / chaos never settle) and drift moving the
        fertile land under the pattern. Nucleation plants discrete blobs, which
        is what lets growth appear ahead of a fast-moving fertile front. The old
        per-cell seeding is gone: its lucky set slid one cell per step, so it
        drew diagonal lines — that was the wind.
      </p>
      </div>
    </div>

    <button class="rd-dev-reseed" type="button" @click="seed()">reseed</button>
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
    max-width: min(17rem, calc(100vw - 2rem));
    max-height: calc(100vh - 6rem);
    overflow-y: auto;
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

  /* Green once real orientation events arrive, so "is the accelerometer doing
     anything" is answerable at a glance instead of by reading numbers. */
  .rd-dev-status.is-live {
    color: #0a7f3f;
  }

  .rd-dev-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .rd-dev-toggle {
    flex: none;
    margin-top: 0;
    padding: 0.3rem 0.5rem;
    font: inherit;
    white-space: nowrap;
  }

  .rd-dev-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .rd-dev-panel.is-collapsed .rd-dev-body {
    display: none;
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

  /* Floating so it stays reachable however long the control panel gets. */
  .rd-dev-reseed {
    position: absolute;
    right: 1.25rem;
    bottom: 1.25rem;
    margin-top: 0;
    padding: 0.6rem 1.4rem;
    background: #fff;
    border: 1px solid #0c112b;
    font-family: ui-monospace, monospace;
    font-size: 13px;
    cursor: pointer;
  }

  .rd-dev-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .rd-dev-presets button {
    margin-top: 0;
    padding: 0.15rem 0.35rem;
  }

  label input[type='range'] {
    display: block;
    /* Comfortable to drag with a thumb: the panel is tuned on a phone, where
       the default 4px track is close to unusable. */
    width: 100%;
    height: 1.6rem;
    margin: 0.1rem 0 0.35rem;
  }

  label {
    line-height: 1.35;
  }
</style>
