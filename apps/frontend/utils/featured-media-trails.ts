import { createTrailGpu } from './featured-media-trail-gpu.client';

type Rect = { left: number; top: number; width: number; height: number };
type Radius = { value: number; percent: boolean };
type Radii = { x: Radius[]; y: Radius[] };
type TrailFlight = {
  from: Rect;
  to: Rect;
  radiusFrom: string;
  radiusTo: string;
  duration: number;
  easing: string;
  count: number;
  opacity: number;
  spread: number;
  treatment: 'photo' | 'halftone';
  startedAt?: number;
  fadePower?: number;
};

function parseRadii(value: string): Radii {
  const [horizontal = '0px', vertical = horizontal] = value.split('/');
  function expand(text: string) {
    const values = text.trim().split(/\s+/);
    return [
      values[0],
      values[1] || values[0],
      values[2] || values[0],
      values[3] || values[1] || values[0],
    ].map((length) => {
      if (!length || !/^(\d+(?:\.\d+)?)(px|%)$/.test(length)) {
        throw new Error(`Unsupported trail radius: ${length}`);
      }
      return { value: parseFloat(length), percent: length.endsWith('%') };
    });
  }
  return { x: expand(horizontal), y: expand(vertical) };
}

function easingFor(value: string) {
  const named: Record<string, string> = {
    linear: '0,0,1,1',
    ease: '.25,.1,.25,1',
    'ease-in': '.42,0,1,1',
    'ease-out': '0,0,.58,1',
    'ease-in-out': '.42,0,.58,1',
  };
  const curve = named[value] ?? value.match(/^cubic-bezier\(([^)]+)\)$/)?.[1];
  const points = curve?.split(',').map(Number);
  if (
    !points ||
    points.length !== 4 ||
    points.some((point) => !Number.isFinite(point))
  ) {
    throw new Error(`Unsupported trail easing: ${value}`);
  }
  const [x1, y1, x2, y2] = points as [number, number, number, number];
  const bezier = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  return (progress: number) => {
    if (progress <= 0 || progress >= 1)
      return Math.max(0, Math.min(1, progress));
    let low = 0,
      high = 1,
      t = progress;
    for (let i = 0; i < 22; i++) {
      const x = bezier(t, x1, x2);
      if (Math.abs(x - progress) < 1e-8) break;
      if (x < progress) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return bezier(t, y1, y2);
  };
}

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

// One renderer belongs to the persistent transition layer. It draws only decorative media; primary geometry, DOM text and destination handoff remain independent.
export function createFeaturedMediaTrails() {
  let gpu: ReturnType<typeof createTrailGpu> = null;
  let unavailable = false;
  let raf = 0;

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    gpu?.stop();
  }

  function dispose() {
    stop();
    gpu?.dispose();
    gpu = null;
    unavailable = false;
  }

  function prepare(url: string, treatment: TrailFlight['treatment']) {
    if (unavailable) return Promise.resolve();
    if (!gpu || !gpu.available) gpu = createTrailGpu();
    if (!gpu) {
      unavailable = true;
      return Promise.resolve();
    }
    return gpu.prepare(new URL(url, location.href).href, treatment);
  }

  function play(
    owner: HTMLElement,
    image: HTMLImageElement,
    flight: TrailFlight,
  ) {
    stop();
    // Preparation runs during the source exit. An unfinished optional texture must not delay navigation or start a late echo flight.
    const renderer = gpu;
    if (!renderer?.available || !owner.isConnected) return;
    const url = image.currentSrc || image.src;
    let fromRadii: Radii, toRadii: Radii, ease: (progress: number) => number;
    try {
      fromRadii = parseRadii(flight.radiusFrom);
      toRadii = parseRadii(flight.radiusTo);
      ease = easingFor(flight.easing);
    } catch {
      return;
    }
    if (!renderer.begin(owner, url)) return;
    const count = Math.max(1, Math.min(8, Math.round(flight.count)));
    const spread = Math.max(0, Math.min(0.6, flight.spread));
    const opacity = Math.max(0, Math.min(1, flight.opacity));
    const trails = Array.from({ length: count }, (_, index) => {
      const delay = (index / Math.max(1, count - 1)) * flight.duration * spread;
      return {
        delay,
        duration: flight.duration * 0.94 - delay,
        opacity: opacity * (1 - (index / count) * 0.65),
      };
    });
    let start = flight.startedAt;
    const draw = (now: number) => {
      if (
        !owner.isConnected ||
        document.hidden ||
        !renderer.available ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        stop();
        return;
      }
      // Route flights start on their first drawable frame. A lightbox may join an already-moving image after its optional texture finishes decoding.
      start ??= now;
      const frameStart = performance.now();
      renderer.clear();
      let remaining = false;
      for (const trail of trails) {
        const elapsed = now - start - trail.delay;
        if (elapsed >= trail.duration) continue;
        remaining = true;
        const progress = ease(Math.max(0, elapsed / trail.duration));
        const width = mix(flight.from.width, flight.to.width, progress);
        const height = mix(flight.from.height, flight.to.height, progress);
        const left = mix(flight.from.left, flight.to.left, progress);
        const top = mix(flight.from.top, flight.to.top, progress);
        const radius = (axis: 'x' | 'y', index: number, length: number) => {
          const from = fromRadii[axis][index]!,
            to = toRadii[axis][index]!;
          return mix(
            from.value * (from.percent ? length / 100 : 1),
            to.value * (to.percent ? length / 100 : 1),
            progress,
          );
        };
        const corners = [0, 1, 2, 3].map((i) => ({
          x: radius('x', i, width),
          y: radius('y', i, height),
        }));
        renderer.draw(
          { left, top, width, height },
          corners,
          mix(trail.opacity, 0, progress ** (flight.fadePower ?? 1)),
          flight.treatment,
        );
      }
      renderer.report.frameCosts.push(performance.now() - frameStart);
      if (renderer.report.frameCosts.length > 500)
        renderer.report.frameCosts.shift();
      if (remaining) raf = requestAnimationFrame(draw);
      else stop();
    };
    raf = requestAnimationFrame(draw);
  }

  return { prepare, play, stop, dispose };
}
