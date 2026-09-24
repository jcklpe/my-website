/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { setLiveHalftoneController } from './halftone-control.client';

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
  const vertex =
    'attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
  const fragment = `precision highp float;
    varying vec2 uv;
    uniform sampler2D source;
    uniform vec2 size, origin, imageSize, pixels, sampleScale;
    uniform vec2 kernel[7]; uniform float compactKernel;
    uniform float stage, cellSize, anchored, clipMode, opacity; uniform vec4 radiusX, radiusY;
    vec2 rotatePoint(vec2 p,float angle){float c=cos(angle),s=sin(angle);return vec2(c*p.x+s*p.y,-s*p.x+c*p.y);}
    float ramp(float distance){float t=clamp(distance/(cellSize*.45),0.,1.);return t<.5?t*.8:.4+(t-.5)*1.2;}
    float circle(vec2 tile,vec2 center){return ramp(length(tile-center*cellSize));}
    vec3 saturateColor(vec3 color,float amount){float luminance=dot(color,vec3(.213,.715,.072));return clamp(mix(vec3(luminance),color,amount),0.,1.);}
    vec4 composite(){
      vec2 local=vec2(uv.x,1.-uv.y)*size;
      float cover=max(size.x/imageSize.x,size.y/imageSize.y);
      vec3 photo=texture2D(source,(local-size*.5)/(imageSize*cover)+.5).rgb;
      vec2 point=local+origin*anchored;
      vec2 y=mod(rotatePoint(point,.523598776),cellSize);
      vec2 cm=mod(rotatePoint(point,-.366519143)-vec2(cellSize*.58,0.),cellSize);
      float yellow=circle(y,vec2(.25))*circle(y,vec2(.75));
      float magenta=circle(cm,vec2(.75,.25))*circle(cm,vec2(.25,.75));
      float cyan=circle(cm,vec2(.75))*circle(cm,vec2(.25));
      vec3 hues=saturateColor(photo*.75+.25,2.);
      vec3 screened=1.-(1.-hues)*(1.-vec3(cyan,magenta,yellow));
      // CSS soft K: two gradients screened over grayscale(.8), then blurred without threshold.
      float d=clamp(length(y-vec2(.25)*cellSize)/(cellSize*.45),0.,1.);
      float first=d<.6666667?d*1.2:.8+(d-.6666667)*.6;
      float second=clamp(length(y-vec2(.75)*cellSize)/(cellSize*.45),0.,1.);
      float k=1.-(1.-dot(photo,vec3(.2126,.7152,.0722))*.8)*(1.-first*second);
      return vec4(screened*.635,k);
    }
    void main(){
      if(stage<.5){gl_FragColor=composite();return;}
      bool firstBlur=stage<2.5;
      float sigma=firstBlur?1.1:.6;
      vec2 direction=(stage==1.||stage==3.)?vec2(1.,0.):vec2(0.,1.);
      // Gaussian blur radius in CSS pixels, independent of backing resolution.
      vec4 value=vec4(0.);float total=0.;
      if(compactKernel>.5){
        // The CPU distributes the original half-CSS-pixel taps onto texel centers, then combines adjacent texels using hardware linear interpolation.
        for(int n=0;n<7;n++){
          vec2 tap=kernel[n];
          value+=texture2D(source,clamp(uv+direction*tap.x/pixels,.5/pixels,1.-.5/pixels)*sampleScale)*tap.y;
        }
      }else{
      for(int n=-6;n<=6;n++){
        float distance=float(n)*.5;
        float weight=exp(-.5*distance*distance/(sigma*sigma));
        value+=texture2D(source,clamp(uv+direction*distance/size, .5/pixels, 1.-.5/pixels)*sampleScale)*weight;total+=weight;
      }
      value/=total;
      }
      if(stage==2.)value.rgb=clamp((value.rgb-.5)*1000.+.5,0.,1.);
      if(stage==4.){
        vec3 color=value.rgb*value.a;
        vec3 sepia=vec3(dot(color,vec3(.393,.769,.189)),dot(color,vec3(.349,.686,.168)),dot(color,vec3(.272,.534,.131)));
        color=clamp(mix(color,sepia,.35),0.,1.);
        float alpha=opacity;
        if(clipMode>0.){
          vec2 local=vec2(uv.x,1.-uv.y)*size, r=vec2(0.), center=vec2(0.);
          if(local.x<radiusX.x&&local.y<radiusY.x){r=vec2(radiusX.x,radiusY.x);center=r;}
          else if(local.x>size.x-radiusX.y&&local.y<radiusY.y){r=vec2(radiusX.y,radiusY.y);center=vec2(size.x-r.x,r.y);}
          else if(local.x>size.x-radiusX.z&&local.y>size.y-radiusY.z){r=vec2(radiusX.z,radiusY.z);center=size-r;}
          else if(local.x<radiusX.w&&local.y>size.y-radiusY.w){r=vec2(radiusX.w,radiusY.w);center=vec2(r.x,size.y-r.y);}
          if(r.x>0.&&r.y>0.){float edge=length((local-center)/r);alpha*=1.-smoothstep(1.-.5/min(r.x,r.y),1.+.5/min(r.x,r.y),edge);}
        }
        gl_FragColor=vec4(saturateColor(color,1.5)*alpha,alpha);
      }else gl_FragColor=value;
    }`;
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
      'origin',
      'imageSize',
      'pixels',
      'sampleScale',
      'clipMode',
      'opacity',
      'radiusX',
      'radiusY',
      'stage',
      'cellSize',
      'anchored',
    ].map((n) => [n, gl.getUniformLocation(program, n)]),
  ) as any;
  gl.uniform1i(u.source, 0);
  gl.uniform1f(u.cellSize, 11);
  gl.uniform1f(u.anchored, 1);
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

  function pairedKernel(sigma: number, pixelsPerCssPixel: number) {
    const radius = Math.ceil(3 * pixelsPerCssPixel);
    if (radius > 6) return null;
    const discrete = new Float64Array(radius * 2 + 1);
    let total = 0;
    for (let n = -6; n <= 6; n++) {
      const distance = n * 0.5;
      const weight = Math.exp((-0.5 * distance * distance) / (sigma * sigma));
      const offset = distance * pixelsPerCssPixel;
      const left = Math.floor(offset);
      const fraction = offset - left;
      discrete[left + radius] += weight * (1 - fraction);
      if (fraction > 0) discrete[left + radius + 1] += weight * fraction;
      total += weight;
    }
    const pairs = new Float32Array(14);
    for (let i = 0; i < discrete.length; i += 2) {
      const leftWeight = discrete[i];
      const rightWeight = discrete[i + 1] || 0;
      const combined = leftWeight + rightWeight;
      pairs[i] = i - radius + rightWeight / combined;
      pairs[i + 1] = combined / total;
    }
    return pairs;
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
    gl.uniform2f(u.origin, rect.left, rect.top);
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
          '.card-halftone-box, .hero-halftone-box, .media-treatment, .frame, .strip-halftone-box',
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
        '.card-halftone-box, .hero-halftone-box, .media-treatment, .frame, .strip-halftone-box',
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
    for (const [image, surface] of surfaces) {
      if (!image.isConnected) {
        unregister(image);
        continue;
      }
      if (!surface.photo) continue;
      const rect = image.getBoundingClientRect();
      if (
        !rect.width ||
        !rect.height ||
        rect.bottom < 0 ||
        rect.top > innerHeight ||
        rect.right < 0 ||
        rect.left > innerWidth
      )
        continue;
      const parentRect = surface.parent.getBoundingClientRect();
      const scaleX = parentRect.width / surface.parent.offsetWidth || 1;
      const scaleY = parentRect.height / surface.parent.offsetHeight || 1;
      const computed = getComputedStyle(image);
      const cellSize = Number(image.dataset.halftoneCellSize) || 11;
      const key = [
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        image.currentSrc,
        computed.opacity,
        cellSize,
      ].join(':');
      if (key === surface.key) continue;
      surface.canvas.style.left =
        (rect.left - parentRect.left) / scaleX -
        surface.parent.clientLeft +
        'px';
      surface.canvas.style.top =
        (rect.top - parentRect.top) / scaleY - surface.parent.clientTop + 'px';
      surface.canvas.style.width = rect.width / scaleX + 'px';
      surface.canvas.style.height = rect.height / scaleY + 'px';
      surface.canvas.style.opacity = computed.opacity;
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
    .frame.is-live-halftone-ready,
    .frame.is-live-halftone-ready .frame-halftone,
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
    .frame.is-live-halftone-ready .frame-ink,
    .frame.is-live-halftone-ready .frame-k-layer { display: none !important; }
    .is-live-halftone-ready .s51-live-photo { display: block; }
  `;
  document.head.append(style);
  return { register, invalidate: schedule, setFlightActive };
}
