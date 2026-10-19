type CrtRenderer = {
  draw: (
    source: HTMLCanvasElement,
    progress: number,
    level: number,
    rect: DOMRect,
  ) => HTMLCanvasElement;
  dispose: () => void;
};

// The visible 2D canvases retain their own frames; one shared GPU pass serves the Home, interior, and traveling surfaces without compiling at click time.
let renderer: CrtRenderer | null | undefined;
const surfaces = new Set<HTMLCanvasElement>();
const sources = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();
let warmupStartedAt: number | null = null;
let contentRipple: {
  startedAt: number;
  duration: number;
  strength: number;
} | null = null;

const vertex = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `
precision mediump float;
varying vec2 uv;
uniform sampler2D cells;
uniform vec2 sourceSize, surfaceSize, surfaceOrigin, viewportSize, flash, ripple;
uniform float progress, level, spread, time;

void main() {
  vec2 screen = vec2(uv.x, 1.0 - uv.y);
  // Inverse-sample the same outward pulse used by the decorative DOM lines and image frames.
  vec2 fromCenter = surfaceOrigin + screen * surfaceSize - viewportSize * 0.5;
  float radius = length(fromCenter);
  float reach = length(viewportSize) * 0.5;
  float delay = 35.0 + 180.0 * min(1.0, radius / reach);
  float wavePhase = (ripple.x - delay) / 280.0;
  float shift = 0.0;
  if (wavePhase > 0.0 && wavePhase < 1.0) {
    shift = ripple.y * sin(wavePhase * 6.283185) * exp(-1.8 * wavePhase);
  }
  screen -= fromCenter / max(radius, 1.0) * shift / surfaceSize;
  vec2 centered = screen * 2.0 - 1.0;
  float active = step(0.0, progress);
  float phase = clamp(progress, 0.0, 1.0);
  // Match crtEntryProgress: a critically damped response builds momentum and takes time to settle.
  float charge = (1.0 - (1.0 + 6.5 * phase) * exp(-6.5 * phase)) / (1.0 - 7.5 * exp(-6.5));
  float ignition = flash.x;
  float warmth = flash.y;
  float lock = ignition * smoothstep(0.20, 0.45, phase) * active;

  // The panel is a window onto a larger field. Fixed CSS-pixel coordinates preserve cell pitch while its edges expand.
  vec2 tube = centered * surfaceSize / viewportSize;
  vec2 curved = tube * (1.0 + dot(tube, tube) * 0.045);
  float band = exp(-pow((tube.y * 0.5 + 0.5 - charge) * 14.0, 2.0));
  curved.x += sin(tube.y * 4.5 + charge * 5.0) * band * lock * 0.004;
  vec2 point = (curved * viewportSize / sourceSize) * 0.5 + 0.5;
  vec2 pixel = 1.0 / sourceSize;
  vec4 cell = texture2D(cells, point);
  vec4 bloom = (
    texture2D(cells, point + vec2(pixel.x * 3.5, 0.0)) +
    texture2D(cells, point - vec2(pixel.x * 3.5, 0.0)) +
    texture2D(cells, point + vec2(0.0, pixel.y * 3.5)) +
    texture2D(cells, point - vec2(0.0, pixel.y * 3.5))
  ) * 0.25;

  float grain = fract(sin(dot(floor(surfaceOrigin + screen * surfaceSize), vec2(12.9898, 78.233)) + floor(time * 12.0)) * 43758.5453);
  float scanline = 0.68 + 0.32 * sin(screen.y * surfaceSize.y * 3.141593);
  float grille = 0.91 + 0.09 * cos(screen.x * surfaceSize.x * 2.094395);
  float vignette = 1.0 - smoothstep(0.25, 1.65, dot(tube, tube));
  float edge = (1.0 - smoothstep(0.98, 1.04, abs(centered.x))) *
               (1.0 - smoothstep(0.98, 1.04, abs(centered.y)));
  vec4 haze = (texture2D(cells, point + pixel * vec2(7.0, 7.0)) + texture2D(cells, point - pixel * vec2(7.0, 7.0))) * 0.5;
  vec3 phosphor = cell.rgb * cell.a * 1.7 + bloom.rgb * bloom.a * 0.85 + haze.rgb * haze.a * 0.18;
  phosphor += vec3(0.12, 0.5, 0.29) * bloom.a * 0.14;
  float alpha = clamp(cell.a * 0.86 + bloom.a * 0.4 + haze.a * 0.1, 0.0, 1.0);
  vec3 color = phosphor * scanline * grille * (0.94 + grain * 0.12) * (1.0 + warmth * 0.7);
  alpha *= (0.35 + vignette * 0.65) * edge * level * (1.0 + warmth * 0.9);

  // Excite the curved raster itself: a hot filament, colored phosphor bleed, and a slower diffuse charge coupled to the live cells.
  // Keep ignition centered in the viewport with a stable beam thickness, independent of the moving panel's bounds.
  vec2 flashPoint = (surfaceOrigin + screen * surfaceSize) * 2.0 / viewportSize - 1.0;
  flashPoint *= 1.0 + dot(flashPoint, flashPoint) * 0.045;
  float distanceToBeam = abs(flashPoint.y + sin(flashPoint.x * 5.0) * ignition * 0.002);
  float beam = exp(-distanceToBeam / (0.002 + ignition * 0.014)) * ignition;
  float bleed = exp(-distanceToBeam * 20.0) * warmth * (1.0 - spread);
  // Charge spreads from the filament through the whole curved phosphor surface as the tube warms, rather than lingering as a stationary line.
  vec2 chargeRadius = vec2(0.15, 0.025) + vec2(1.3, 1.5) * spread;
  vec2 chargePoint = flashPoint / chargeRadius;
  float glass = exp(-dot(chargePoint, chargePoint)) * warmth;
  float raster = scanline * grille * (0.94 + grain * 0.06);
  float light = (beam * 0.96 + bleed * 0.16 + glass * 0.34) * raster * edge;
  light *= 0.85 + cell.a * 0.15;
  light = clamp(light, 0.0, 0.98);
  vec3 glowColor = mix(vec3(0.12, 0.68, 0.32), vec3(0.94, 1.0, 0.91), clamp(beam * 1.7, 0.0, 1.0));
  float combined = alpha + light * (1.0 - alpha);
  vec3 emitted = (color * alpha + glowColor * light * (1.0 - alpha)) / max(combined, 0.0001);
  gl_FragColor = vec4(emitted, combined);
}`;

function createRenderer(): CrtRenderer | null {
  const output = document.createElement('canvas');
  const gl = output.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!program || !buffer || !texture) return null;
  const dispose = () => {
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) {
      dispose();
      return null;
    }
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      dispose();
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose();
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program, 'cells'), 0);
  const surfaceSize = gl.getUniformLocation(program, 'surfaceSize');
  const surfaceOrigin = gl.getUniformLocation(program, 'surfaceOrigin');
  const viewportSize = gl.getUniformLocation(program, 'viewportSize');
  const sourceSize = gl.getUniformLocation(program, 'sourceSize');
  const phase = gl.getUniformLocation(program, 'progress');
  const exposure = gl.getUniformLocation(program, 'level');
  const flash = gl.getUniformLocation(program, 'flash');
  const spread = gl.getUniformLocation(program, 'spread');
  const time = gl.getUniformLocation(program, 'time');
  const ripple = gl.getUniformLocation(program, 'ripple');
  return {
    draw(source, progress, level, rect) {
      if (gl.isContextLost()) return source;
      // One pass, capped below one megapixel; faster repaints are limited to the route effect and its short warmup tail.
      const scale = Math.min(1, 1200 / rect.width, 800 / rect.height);
      const width = Math.max(1, Math.round(rect.width * scale));
      const height = Math.max(1, Math.round(rect.height * scale));
      if (output.width !== width || output.height !== height) {
        output.width = width;
        output.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(surfaceSize, rect.width, rect.height);
      gl.uniform2f(surfaceOrigin, rect.left, rect.top);
      gl.uniform2f(viewportSize, innerWidth, innerHeight);
      gl.uniform2f(sourceSize, source.width, source.height);
      const age =
        warmupStartedAt === null
          ? -1
          : (performance.now() - warmupStartedAt) / 1000;
      const light = crtWarmupLight(age);
      gl.uniform2f(flash, light.strike, light.glow);
      gl.uniform1f(spread, crtWarmupSpread(age));
      const rippleAge = contentRipple
        ? (performance.now() - contentRipple.startedAt) / contentRipple.duration
        : 1;
      gl.uniform2f(
        ripple,
        rippleAge * 560,
        rippleAge < 1 && contentRipple ? contentRipple.strength : 0,
      );
      gl.uniform1f(time, performance.now() / 1000);
      gl.uniform1f(exposure, level);
      gl.uniform1f(phase, progress);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return output;
    },
    dispose,
  };
}

// Normalized critically damped step response: zero initial velocity, one acceleration peak, and a long braking tail without a rubbery overshoot.
export function crtEntryProgress(progress: number) {
  const phase = Math.min(1, Math.max(0, progress));
  return (
    (1 - (1 + 6.5 * phase) * Math.exp(-6.5 * phase)) /
    (1 - 7.5 * Math.exp(-6.5))
  );
}

export function crtWarmupLight(seconds: number) {
  if (seconds < 0 || seconds >= 2.8) return { strike: 0, glow: 0 };
  const attack = Math.min(1, Math.max(0, (seconds - 0.18) / 0.035));
  const snap = (1 - Math.pow(2, -10 * attack)) / (1 - Math.pow(2, -10));
  const decayTime = Math.max(0, seconds - 0.275);
  const fade = Math.min(1, Math.max(0, (seconds - 2.3) / 0.5));
  const tail = 1 - fade * fade * (3 - 2 * fade);
  const firstCharge = 0.12 * Math.exp(-Math.pow((seconds - 0.065) / 0.018, 2));
  const secondCharge = 0.18 * Math.exp(-Math.pow((seconds - 0.125) / 0.018, 2));
  return {
    strike: Math.max(
      firstCharge,
      secondCharge,
      snap * Math.exp(-9 * decayTime),
    ),
    glow: snap * Math.exp(-1.65 * decayTime) * tail,
  };
}

export function beginLifeCrtRipple(duration: number, strength: number) {
  const ripple = { startedAt: performance.now(), duration, strength };
  contentRipple = ripple;
  return () => {
    if (contentRipple === ripple) contentRipple = null;
  };
}

export function beginLifeCrtWarmup() {
  warmupStartedAt = performance.now();
}

export function lifeCrtWarmupAge() {
  return warmupStartedAt === null
    ? -1
    : (performance.now() - warmupStartedAt) / 1000;
}

export function crtWarmupSpread(seconds: number) {
  if (seconds < 0 || seconds >= 2.8) return 0;
  return 1 - Math.exp(-2.6 * Math.max(0, seconds - 0.215));
}

export function stopLifeCrtWarmup() {
  warmupStartedAt = null;
  contentRipple = null;
}

export function isLifeCrtWarming() {
  return warmupStartedAt !== null && performance.now() - warmupStartedAt < 2800;
}

export function drawLifeCrt(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  progress = -1,
) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const width = Math.max(1, Math.round(bounds.width));
  const height = Math.max(1, Math.round(bounds.height));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  surfaces.add(canvas);
  if (renderer === undefined) renderer = createRenderer();
  sources.set(canvas, source);
  const level =
    Number.parseFloat(
      getComputedStyle(canvas).getPropertyValue('--life-opacity'),
    ) || 0.2;
  const output = renderer?.draw(source, progress, level, bounds) ?? source;
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (output === source) {
    // The fallback uses the same centered crop and CSS-pixel cell pitch as the shader.
    context.drawImage(
      source,
      (source.width - bounds.width) / 2,
      (source.height - bounds.height) / 2,
      bounds.width,
      bounds.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  } else context.drawImage(output, 0, 0, canvas.width, canvas.height);
  canvas.dataset.lifeRenderer = output === source ? '2d' : 'webgl';
}

export function mirrorLifeCrt(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  progress = -1,
) {
  drawLifeCrt(canvas, sources.get(source) ?? source, progress);
}

export function disposeLifeCrt(canvas: HTMLCanvasElement) {
  surfaces.delete(canvas);
  sources.delete(canvas);
  if (!surfaces.size) {
    renderer?.dispose();
    renderer = undefined;
    stopLifeCrtWarmup();
  }
}

export function lifeCrtPointer(
  x: number,
  y: number,
  surface: Pick<DOMRect, 'width' | 'height'>,
  source: HTMLCanvasElement,
  curved: boolean,
) {
  const px = ((x * 2 - 1) * surface.width) / innerWidth;
  const py = ((y * 2 - 1) * surface.height) / innerHeight;
  const curvature = curved ? 1 + (px * px + py * py) * 0.045 : 1;
  return {
    x: 0.5 + (px * curvature * innerWidth) / (2 * source.width),
    y: 0.5 + (py * curvature * innerHeight) / (2 * source.height),
  };
}
