/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { setLiveHalftoneController } from './halftone-control.client';
import {
  halftoneVertex as vertex,
  halftoneFragment as fragment,
  halftonePatternOrigin,
  pairedKernel,
} from './halftone-shader-source';

declare global {
  interface Window {
    __halftoneShader: any;
  }
}

type HalftoneRenderer = {
  register: (image: HTMLImageElement) => () => void;
  invalidate: () => void;
  setFlightActive: (active: boolean) => void;
};

let rendererPromise: Promise<HalftoneRenderer | null> | null = null;

export function installHalftone() {
  rendererPromise ??= Promise.resolve(createRenderer());
  return rendererPromise;
}

export async function registerHalftoneSurface(image: HTMLImageElement) {
  const renderer = await installHalftone();
  return renderer?.register(image) ?? (() => {});
}

// S55: preserve S53 presentation while pairing the discrete blur kernel into linear-filtered texture samples.
function createRenderer(): HalftoneRenderer | null {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const report = {
    status: 'initializing',
    draws: 0,
    uploads: 0,
    errors: [],
    surfaces: 0,
    trailDraws: 0,
    cellSize: 11,
    contexts: 1,
    frameCosts: [],
    allocations: 0,
  };
  window.__halftoneShader = report;
  const status = (text: string) => {
    report.status = text;
    const badge = document.getElementById('shader-status');
    if (badge) badge.textContent = badge.dataset.label + ' — ' + text;
  };
  const gpu = document.createElement('canvas');
  const gl = gpu.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) {
    status('Unavailable — original image');
    return null;
  }
  function compile(type: number, source: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, source);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
      throw gl!.getShaderInfoLog(s);
    return s;
  }
  const program = gl.createProgram()!;
  try {
    for (const type of [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER]) {
      const shader = compile(
        type,
        type === gl.VERTEX_SHADER ? vertex : fragment,
      );
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(program) || '');
  } catch (error) {
    report.errors.push(String(error));
    status('Shader error — original image');
    return null;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(
    [
      'kernel[0]',
      'compactKernel',
      'source',
      'size',
      'patternOrigin',
      'imageSize',
      'pixels',
      'sampleScale',
      'clipMode',
      'opacity',
      'radiusX',
      'radiusY',
      'stage',
      'cellSize',
    ].map((n) => [n, gl.getUniformLocation(program, n)]),
  ) as any;
  gl.uniform1i(u.source, 0);
  gl.uniform1f(u.cellSize, 11);
  function texture() {
    const t = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, t);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    return t;
  }
  const targets = [0, 1].map(() => ({
    texture: texture(),
    framebuffer: gl!.createFramebuffer(),
  }));
  const prepared = new Map<string, any>();
  const surfaces = new Map<HTMLImageElement, any>();
  let raf = 0,
    flightActive = false,
    lost = false;

  function sourceFor(image: any) {
    if (!(image instanceof HTMLImageElement)) return null;
    try {
      return new URL(
        image.currentSrc || image.dataset.originalSrc || image.src,
        location.href,
      ).href;
    } catch {
      return null;
    }
  }

  function prepareImage(url: string) {
    if (prepared.has(url)) return prepared.get(url);
    const promise = (async () => {
      let bitmap: ImageBitmap | null = null;
      try {
        const response = await fetch(url);
        if (!response.ok) throw Error('HTTP ' + response.status);
        const blob = await response.blob();
        bitmap = await createImageBitmap(blob);
        if (lost) return null;
        const data = {
          width: bitmap.width,
          height: bitmap.height,
          texture: texture(),
        };
        if (!data.texture) throw Error('Could not allocate source texture');
        gl!.texImage2D(
          gl!.TEXTURE_2D,
          0,
          gl!.RGBA,
          gl!.RGBA,
          gl!.UNSIGNED_BYTE,
          bitmap,
        );
        const uploadError = gl!.getError();
        if (uploadError !== gl!.NO_ERROR) {
          gl!.deleteTexture(data.texture);
          throw Error('Texture upload failed: ' + uploadError);
        }
        prepared.set(url, data);
        report.uploads++;
        schedule();
        return data;
      } catch (error) {
        report.errors.push(String(error));
        prepared.set(url, null);
        return null;
      } finally {
        bitmap?.close();
      }
    })();
    prepared.set(url, promise);
    return promise;
  }

  let bufferWidth = 0,
    bufferHeight = 0;
  function render(photo, rect, cellSize: number) {
    const dpr = Math.min(devicePixelRatio, 1.5),
      w = Math.max(1, Math.ceil(rect.width * dpr)),
      h = Math.max(1, Math.ceil(rect.height * dpr));
    if (gpu.width < w || gpu.height < h) {
      gpu.width = Math.ceil(Math.max(w, gpu.width) / 256) * 256;
      gpu.height = Math.ceil(Math.max(h, gpu.height) / 256) * 256;
    }
    if (bufferWidth < w || bufferHeight < h) {
      bufferWidth = Math.ceil(Math.max(w, bufferWidth) / 256) * 256;
      bufferHeight = Math.ceil(Math.max(h, bufferHeight) / 256) * 256;
      report.allocations++;
      for (const target of targets) {
        gl.bindTexture(gl.TEXTURE_2D, target.texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          bufferWidth,
          bufferHeight,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          target.texture,
          0,
        );
      }
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.sampleScale, w / bufferWidth, h / bufferHeight);
    gl.uniform2f(u.pixels, w, h);
    gl.uniform2f(u.size, rect.width, rect.height);
    const origin = halftonePatternOrigin(
      rect,
      window.scrollX,
      window.scrollY,
      reducedMotion.matches,
    );
    gl.uniform2f(u.patternOrigin, origin.x, origin.y);
    gl.uniform2f(u.imageSize, photo.width, photo.height);
    gl.uniform1f(u.cellSize, cellSize);
    gl.uniform1f(u.clipMode, 0);
    gl.uniform1f(u.opacity, 1);
    const kernels = [
      null,
      pairedKernel(1.1, w / rect.width),
      pairedKernel(1.1, h / rect.height),
      pairedKernel(0.6, w / rect.width),
      pairedKernel(0.6, h / rect.height),
    ];
    for (let stage = 0; stage < 5; stage++) {
      const kernel = kernels[stage];
      gl.uniform1f(u.compactKernel, kernel ? 1 : 0);
      if (kernel) gl.uniform2fv(u['kernel[0]'], kernel);
      gl.disable(gl.BLEND);
      gl.viewport(0, 0, w, h);
      gl.bindFramebuffer(
        gl.FRAMEBUFFER,
        stage === 4 ? null : targets[stage % 2].framebuffer,
      );
      gl.bindTexture(
        gl.TEXTURE_2D,
        stage === 0 ? photo.texture : targets[(stage - 1) % 2].texture,
      );
      gl.uniform1f(u.stage, stage);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    report.draws++;
    return { canvas: gpu, width: w, height: h };
  }
  const resizeObserver = new ResizeObserver(() => schedule());

  function unregister(image: HTMLImageElement) {
    const surface = surfaces.get(image);
    if (!surface) return;
    resizeObserver.unobserve(image);
    surface.root?.classList.remove('is-live-halftone-ready');
    surface.root?.classList.remove('is-live-halftone-failed');
    surface.canvas.remove();
    if (surface.changedPosition)
      surface.parent.style.position = surface.originalPosition;
    surfaces.delete(image);
    report.surfaces = surfaces.size;
  }

  function register(image: HTMLImageElement) {
    if (lost || surfaces.has(image)) return () => unregister(image);
    const url = sourceFor(image);
    const parent = image.parentElement;
    if (!url || !parent) return () => {};
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      image
        .closest(
          '.card-halftone-box, .hero-halftone-box, .media-treatment, .frame-halftone, .strip-halftone-box',
        )
        ?.classList.add('is-live-halftone-failed');
      return () => {};
    }
    canvas.className = 's51-live-photo';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    const changedPosition = getComputedStyle(parent).position === 'static';
    const originalPosition = parent.style.position;
    if (changedPosition) parent.style.position = 'relative';
    const surface = {
      canvas,
      context,
      parent,
      changedPosition,
      originalPosition,
      root: image.closest(
        '.card-halftone-box, .hero-halftone-box, .media-treatment, .frame-halftone, .strip-halftone-box',
      ),
      photo: null,
      key: '',
    };
    parent.append(canvas);
    surfaces.set(image, surface);
    report.surfaces = surfaces.size;
    resizeObserver.observe(image);
    Promise.resolve(prepareImage(url)).then((photo) => {
      if (lost || surfaces.get(image) !== surface) return;
      if (!photo) {
        surface.root?.classList.add('is-live-halftone-failed');
        return;
      }
      surface.photo = photo;
      schedule();
    });
    schedule();
    return () => unregister(image);
  }

  function draw() {
    raf = 0;
    if (lost || document.hidden) return;
    const started = performance.now();
    for (const [image] of surfaces) {
      if (!image.isConnected) unregister(image);
    }

    // Snapshot every surface before changing canvas geometry or readiness classes; later images must not force layout after earlier canvas writes.
    const paints = [];
    for (const [image, surface] of surfaces) {
      if (!surface.photo) continue;
      const rect = image.getBoundingClientRect();
      const isFlyingClone = Boolean(image.closest('.ftml-layer--media'));
      if (
        !rect.width ||
        !rect.height ||
        (!isFlyingClone &&
          (rect.bottom < 0 ||
            rect.top > innerHeight ||
            rect.right < 0 ||
            rect.left > innerWidth))
      )
        continue;
      const parentRect = surface.parent.getBoundingClientRect();
      const scaleX = parentRect.width / surface.parent.offsetWidth || 1;
      const scaleY = parentRect.height / surface.parent.offsetHeight || 1;
      const computed = getComputedStyle(image);
      const opacity = computed.opacity;
      const cellSize = Number(image.dataset.halftoneCellSize) || 11;
      const key = [
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        image.currentSrc,
        opacity,
        cellSize,
        window.scrollX,
        window.scrollY,
        reducedMotion.matches,
      ].join(':');
      if (key === surface.key) continue;
      paints.push({
        surface,
        rect,
        cellSize,
        key,
        left:
          (rect.left - parentRect.left) / scaleX - surface.parent.clientLeft,
        top: (rect.top - parentRect.top) / scaleY - surface.parent.clientTop,
        width: rect.width / scaleX,
        height: rect.height / scaleY,
        opacity,
      });
    }

    for (const paint of paints) {
      const { surface, rect, cellSize, key } = paint;
      surface.canvas.style.left = paint.left + 'px';
      surface.canvas.style.top = paint.top + 'px';
      surface.canvas.style.width = paint.width + 'px';
      surface.canvas.style.height = paint.height + 'px';
      surface.canvas.style.opacity = paint.opacity;
      const output = render(surface.photo, rect, cellSize);
      if (surface.canvas.width !== output.width)
        surface.canvas.width = output.width;
      if (surface.canvas.height !== output.height)
        surface.canvas.height = output.height;
      surface.context.drawImage(
        output.canvas,
        0,
        output.canvas.height - output.height,
        output.width,
        output.height,
        0,
        0,
        output.width,
        output.height,
      );
      surface.key = key;
      surface.root?.classList.add('is-live-halftone-ready');
    }
    report.frameCosts.push(performance.now() - started);
    if (report.frameCosts.length > 500) report.frameCosts.shift();
    if ([...surfaces.values()].some((surface) => surface.key))
      status('LIVE throughout — 11px dots');
    if (flightActive && surfaces.size) schedule();
  }

  function schedule() {
    if (!raf && !lost && !document.hidden) raf = requestAnimationFrame(draw);
  }

  function setFlightActive(active: boolean) {
    flightActive = active;
    if (active) schedule();
  }

  function fail(message: string) {
    lost = true;
    cancelAnimationFrame(raf);
    raf = 0;
    for (const image of [...surfaces.keys()]) unregister(image);
    document.documentElement.classList.remove('is-live-halftone-pending');
    setLiveHalftoneController(null);
    status(message);
  }

  function onVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else schedule();
  }

  function onPageHide(event: PageTransitionEvent) {
    if (event.persisted) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else dispose();
  }

  function dispose() {
    fail('Stopped — original image');
    resizeObserver.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', schedule);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.removeEventListener('change', schedule);
    for (const value of prepared.values()) {
      if (value && !(value instanceof Promise)) gl.deleteTexture(value.texture);
    }
    for (const target of targets) {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    }
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    style.remove();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener('change', schedule);
  gpu.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    fail('Context lost — original image');
  });
  setLiveHalftoneController({ invalidate: schedule, setFlightActive });

  const style = document.createElement('style');
  style.textContent = `
    .card-halftone-box.is-live-halftone-ready,
    .card-halftone-box.is-live-halftone-ready .card-halftone,
    .hero-halftone-box.is-live-halftone-ready,
    .hero-halftone-box.is-live-halftone-ready .hero-halftone,
    .frame-halftone.is-live-halftone-ready,
    .media-treatment.is-live-halftone-ready,
    .strip-halftone-box.is-live-halftone-ready { filter: none !important; }
    .card-halftone-box.is-live-halftone-ready .card-ink,
    .card-halftone-box.is-live-halftone-ready .card-k-layer,
    .card-halftone-box.is-live-halftone-ready .card-gradient-tint,
    .card-halftone-box.is-live-halftone-ready .card-bleed,
    .hero-halftone-box.is-live-halftone-ready .hero-ink,
    .hero-halftone-box.is-live-halftone-ready .hero-k-layer,
    .hero-halftone-box.is-live-halftone-ready .hero-bleed,
    .hero-halftone-box.is-live-halftone-ready .hero-gradient-tint,
    .frame-halftone.is-live-halftone-ready .frame-ink,
    .frame-halftone.is-live-halftone-ready .frame-k-layer { display: none !important; }
    .is-live-halftone-ready .s51-live-photo { display: block; }
  `;
  document.head.append(style);
  return { register, invalidate: schedule, setFlightActive };
}
