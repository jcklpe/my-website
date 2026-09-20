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
  const sources = new Map<string, { bitmap: ImageBitmap; bytes: number }>();
  const pending = new Map<
    string,
    { promise: Promise<void>; controller: AbortController }
  >();
  const maxBytes = 64 * 1024 * 1024;
  let cachedBytes = 0;
  let generation = 0;
  let pinned: ImageBitmap | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let context: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let dpr = 1;

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    pinned = null;
    canvas?.remove();
    if (canvas && context)
      context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }

  function dispose() {
    stop();
    generation++;
    for (const request of pending.values()) request.controller.abort();
    pending.clear();
    for (const source of sources.values()) source.bitmap.close();
    sources.clear();
    cachedBytes = 0;
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
    canvas = null;
    context = null;
  }

  function prepareSurface() {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'featured-media-trails';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText =
        'position:absolute;left:0;top:0;pointer-events:none';
      context = canvas.getContext('2d');
    }
    if (!context) return;
    const ratio = window.devicePixelRatio || 1;
    const width = Math.ceil(window.innerWidth * ratio);
    const height = Math.ceil(window.innerHeight * ratio);
    if (canvas.width === width && canvas.height === height && dpr === ratio)
      return;
    stop();
    dpr = ratio;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function prepare(url: string): Promise<void> {
    prepareSurface();
    const existing = sources.get(url);
    if (existing) {
      sources.delete(url);
      sources.set(url, existing);
      return Promise.resolve();
    }
    const request = pending.get(url);
    if (request) return request.promise;
    if (typeof createImageBitmap !== 'function' || pending.size >= 2)
      return Promise.resolve();
    const controller = new AbortController();
    const currentGeneration = generation;
    // A failed, late or CORS-blocked preparation never delays navigation. Blob decoding avoids the synchronous HTMLImageElement bitmap path measured in S26.
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const promise = (async () => {
      let bitmap: ImageBitmap | null = null;
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) return;
        bitmap = await createImageBitmap(await response.blob());
        if (currentGeneration !== generation || controller.signal.aborted)
          return;
        const bytes = bitmap.width * bitmap.height * 4;
        if (bytes > maxBytes) return;
        while (sources.size >= 2 || cachedBytes + bytes > maxBytes) {
          const oldest = [...sources.entries()].find(
            ([, source]) => source.bitmap !== pinned,
          );
          if (!oldest) return;
          oldest[1].bitmap.close();
          cachedBytes -= oldest[1].bytes;
          sources.delete(oldest[0]);
        }
        sources.set(url, { bitmap, bytes });
        cachedBytes += bytes;
        bitmap = null;
      } catch {
        // The flight can draw its already-loaded DOM image instead; no DOM-trail fallback can reintroduce the original strobe path.
      } finally {
        bitmap?.close();
        window.clearTimeout(timeout);
        if (pending.get(url)?.controller === controller) pending.delete(url);
      }
    })();
    pending.set(url, { promise, controller });
    return promise;
  }

  function play(
    owner: HTMLElement,
    image: HTMLImageElement,
    flight: TrailFlight,
  ) {
    stop();
    prepareSurface();
    if (!canvas || !context || typeof context.roundRect !== 'function') return;
    let fromRadii: Radii, toRadii: Radii, ease: (progress: number) => number;
    try {
      fromRadii = parseRadii(flight.radiusFrom);
      toRadii = parseRadii(flight.radiusTo);
      ease = easingFor(flight.easing);
    } catch {
      return;
    }
    const bitmap = sources.get(image.currentSrc || image.src)?.bitmap;
    const source = bitmap ?? image;
    pinned = bitmap ?? null;
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
    const surface = canvas,
      ctx = context;
    owner.appendChild(surface);
    let start: number | undefined;
    function draw(now: number) {
      if (!owner.isConnected || document.hidden) {
        stop();
        return;
      }
      start ??= now;
      ctx.clearRect(0, 0, surface.width / dpr, surface.height / dpr);
      const sourceWidth = bitmap?.width ?? image.naturalWidth;
      const sourceHeight = bitmap?.height ?? image.naturalHeight;
      let remaining = false;
      for (const trail of trails) {
        const elapsed = now - start - trail.delay;
        if (elapsed >= trail.duration) continue;
        remaining = true;
        if (!sourceWidth || !sourceHeight) continue;
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
        const scale = Math.max(width / sourceWidth, height / sourceHeight);
        const drawnWidth = sourceWidth * scale,
          drawnHeight = sourceHeight * scale;
        ctx.save();
        ctx.globalAlpha = mix(trail.opacity, 0, progress);
        ctx.beginPath();
        ctx.roundRect(left, top, width, height, corners);
        ctx.clip();
        ctx.drawImage(
          source,
          left + (width - drawnWidth) / 2,
          top + (height - drawnHeight) / 2,
          drawnWidth,
          drawnHeight,
        );
        ctx.restore();
      }
      if (remaining) raf = requestAnimationFrame(draw);
      else stop();
    }
    raf = requestAnimationFrame(draw);
  }

  return { prepare, play, stop, dispose };
}
