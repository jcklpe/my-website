let active: { startedAt: number; duration: number; strength: number } | null =
  null;

export function beginCrtWarp(duration: number, strength: number) {
  const pulse = { startedAt: performance.now(), duration, strength };
  active = pulse;
  return () => {
    if (active === pulse) active = null;
  };
}

export function stopCrtWarp() {
  active = null;
}

export function readCrtWarp() {
  if (!active) return { milliseconds: 560, strength: 0 };
  const phase = (performance.now() - active.startedAt) / active.duration;
  return {
    milliseconds: Math.min(1, phase) * 560,
    strength: phase < 1 ? active.strength : 0,
  };
}

function noiseHash(x: number, y: number) {
  const fract = (value: number) => value - Math.floor(value);
  let a = fract(x * 0.1031);
  let b = fract(y * 0.103);
  let c = fract(x * 0.0973);
  const dot = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
  a += dot;
  b += dot;
  c += dot;
  return { x: fract((a + b) * c), y: fract((a + c) * b) };
}

function smoothNoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = noiseHash(ix, iy);
  const b = noiseHash(ix + 1, iy);
  const c = noiseHash(ix, iy + 1);
  const d = noiseHash(ix + 1, iy + 1);
  const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
  return {
    x: mix(mix(a.x, b.x, u), mix(c.x, d.x, u), v) - 0.5,
    y: mix(mix(a.y, b.y, u), mix(c.y, d.y, u), v) - 0.5,
  };
}

// Keep the DOM fallback and image-frame projection locally aligned with the shared shader field.
export function crtWarpPoint(
  x: number,
  y: number,
  milliseconds: number,
  width: number,
  height: number,
  strength: number,
) {
  const distance = Math.hypot(x, y);
  const delay =
    25 + 115 * Math.min(1, distance / (Math.hypot(width, height) / 2));
  const phase = (milliseconds - delay) / 170;
  let shift = 0;
  if (phase > 0 && phase < 1)
    shift = strength * Math.sin(phase * Math.PI * 2) * Math.exp(-1.8 * phase);
  const release = Math.min(1, Math.max(0, (milliseconds - 430) / 130));
  const tail =
    strength *
    0.5 *
    (1 - Math.exp(-milliseconds / 16)) *
    Math.exp(-milliseconds / 240) *
    (1 - release * release * (3 - 2 * release));
  const noise = smoothNoise(
    x * 0.018 + milliseconds * 0.009,
    y * 0.025 - milliseconds * 0.005,
  );
  return {
    x: (x / Math.max(distance, 1)) * shift + noise.x * tail,
    y: (y / Math.max(distance, 1)) * shift + noise.y * tail,
  };
}

// Both GPU surfaces use the same field: a quick rounded wave and a longer smooth-value-noise tail. Coordinates and displacement are in viewport CSS pixels.
export const crtWarpGlsl = `
highp vec2 crtHash(highp vec2 p) {
  highp vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy);
}
highp vec2 crtNoise(highp vec2 p) {
  highp vec2 i = floor(p);
  highp vec2 f = fract(p);
  highp vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(crtHash(i), crtHash(i + vec2(1.0, 0.0)), u.x),
             mix(crtHash(i + vec2(0.0, 1.0)), crtHash(i + vec2(1.0, 1.0)), u.x), u.y) - 0.5;
}
highp vec2 crtWarp(highp vec2 pixels, highp vec2 viewportSize, highp vec2 ripple) {
  if (ripple.y <= 0.0) return vec2(0.0);
  highp vec2 p = pixels - viewportSize * 0.5;
  highp float radius = length(p);
  highp float delay = 25.0 + 115.0 * min(1.0, radius / (length(viewportSize) * 0.5));
  highp float phase = (ripple.x - delay) / 170.0;
  highp float shift = 0.0;
  if (phase > 0.0 && phase < 1.0)
    shift = ripple.y * sin(phase * 6.283185) * exp(-1.8 * phase);
  highp float tail = ripple.y * 0.5 * (1.0 - exp(-ripple.x / 16.0)) * exp(-ripple.x / 240.0) * (1.0 - smoothstep(430.0, 560.0, ripple.x));
  highp vec2 noise = crtNoise(p * vec2(0.018, 0.025) + vec2(ripple.x * 0.009, -ripple.x * 0.005));
  return p / max(radius, 1.0) * shift + noise * tail;
}`;
