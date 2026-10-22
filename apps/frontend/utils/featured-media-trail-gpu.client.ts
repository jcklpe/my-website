import {
  halftoneVertex,
  halftoneFragment,
  pairedKernel,
} from './halftone-shader-source';

type Rect = { left: number; top: number; width: number; height: number };
type Corner = { x: number; y: number };
type Photo = { texture: WebGLTexture; width: number; height: number };
type Treatment = 'photo' | 'halftone';
type TrailReport = {
  status: string;
  draws: number;
  photoDraws: number;
  halftoneDraws: number;
  uploads: number;
  active: boolean;
  errors: string[];
  frameCosts: number[];
};

declare global {
  interface Window {
    __featuredMediaTrails?: TrailReport;
  }
}

// Writing stays photographic. Like the prototype's final halftone pass, this shader clips rounded corners and emits premultiplied alpha for GPU blending.
const photoFragment = `precision highp float;
varying vec2 uv;
uniform sampler2D source;
uniform vec2 size, imageSize;
uniform vec4 radiusX, radiusY;
uniform float opacity;
void main(){
  vec2 local=vec2(uv.x,1.-uv.y)*size;
  float cover=max(size.x/imageSize.x,size.y/imageSize.y);
  vec4 photo=texture2D(source,(local-size*.5)/(imageSize*cover)+.5);
  vec2 r=vec2(0.), center=vec2(0.);
  if(local.x<radiusX.x&&local.y<radiusY.x){r=vec2(radiusX.x,radiusY.x);center=r;}
  else if(local.x>size.x-radiusX.y&&local.y<radiusY.y){r=vec2(radiusX.y,radiusY.y);center=vec2(size.x-r.x,r.y);}
  else if(local.x>size.x-radiusX.z&&local.y>size.y-radiusY.z){r=vec2(radiusX.z,radiusY.z);center=size-r;}
  else if(local.x<radiusX.w&&local.y>size.y-radiusY.w){r=vec2(radiusX.w,radiusY.w);center=vec2(r.x,size.y-r.y);}
  float alpha=photo.a*opacity;
  if(r.x>0.&&r.y>0.){float edge=length((local-center)/r);alpha*=1.-smoothstep(1.-.5/min(r.x,r.y),1.+.5/min(r.x,r.y),edge);}
  gl_FragColor=vec4(photo.rgb*alpha,alpha);
}`;

const uniformNames = [
  'source',
  'size',
  'imageSize',
  'pixels',
  'sampleScale',
  'kernel[0]',
  'compactKernel',
  'stage',
  'cellSize',
  'clipMode',
  'opacity',
  'radiusX',
  'radiusY',
] as const;
type UniformName = (typeof uniformNames)[number];

// One transparent viewport canvas owns all echoes. Intermediate halftone passes stay offscreen; the final pass blends directly into this canvas, as in S59.
export function createTrailGpu() {
  const report: TrailReport = {
    status: 'initializing',
    draws: 0,
    photoDraws: 0,
    halftoneDraws: 0,
    uploads: 0,
    active: false,
    errors: [],
    frameCosts: [],
  };
  window.__featuredMediaTrails = report;
  const canvas = document.createElement('canvas');
  canvas.className = 'featured-media-trails';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
  const context = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });
  if (!context) {
    report.status = 'unavailable';
    return null;
  }
  const gl = context;
  let stopped = false;
  let dpr = 1;
  let bufferWidth = 0;
  let bufferHeight = 0;
  let cachedBytes = 0;
  const photos = new Map<string, Photo>();
  const pending = new Map<
    string,
    { promise: Promise<void>; controller: AbortController }
  >();
  let pinnedUrl: string | null = null;

  function compileProgram(fragment: string) {
    const program = gl.createProgram();
    if (!program) throw new Error('Could not create trail program');
    try {
      for (const [type, source] of [
        [gl.VERTEX_SHADER, halftoneVertex],
        [gl.FRAGMENT_SHADER, fragment],
      ] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Could not create trail shader');
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (compiled) gl.attachShader(program, shader);
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        if (!compiled)
          throw new Error(error || 'Trail shader compilation failed');
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error(
          gl.getProgramInfoLog(program) || 'Trail shader link failed',
        );
      const uniforms = Object.fromEntries(
        uniformNames.map((name) => [
          name,
          gl.getUniformLocation(program, name),
        ]),
      ) as Record<UniformName, WebGLUniformLocation | null>;
      return {
        program,
        uniforms,
        position: gl.getAttribLocation(program, 'position'),
      };
    } catch (error) {
      gl.deleteProgram(program);
      throw error;
    }
  }
  let photoProgram: ReturnType<typeof compileProgram>;
  let halftoneProgram: ReturnType<typeof compileProgram> | null = null;
  try {
    photoProgram = compileProgram(photoFragment);
  } catch (error) {
    report.errors.push(String(error));
    report.status = 'failed';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }
  const vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  function texture() {
    const result = gl.createTexture();
    if (!result) throw new Error('Could not allocate trail texture');
    gl.bindTexture(gl.TEXTURE_2D, result);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return result;
  }
  const targets: { texture: WebGLTexture; framebuffer: WebGLFramebuffer }[] =
    [];
  function prepareHalftone() {
    if (halftoneProgram) return;
    halftoneProgram = compileProgram(halftoneFragment);
    for (let i = 0; i < 2; i++) {
      const framebuffer = gl.createFramebuffer();
      if (!framebuffer) throw new Error('Could not allocate trail framebuffer');
      targets.push({ texture: texture(), framebuffer });
    }
  }

  function prepare(url: string, treatment: Treatment): Promise<void> {
    if (stopped) return Promise.resolve();
    try {
      if (treatment === 'halftone') prepareHalftone();
    } catch (error) {
      report.errors.push(String(error));
      dispose();
      return Promise.resolve();
    }
    const existing = photos.get(url);
    if (existing) {
      photos.delete(url);
      photos.set(url, existing);
      return Promise.resolve();
    }
    const request = pending.get(url);
    if (request) return request.promise;
    if (pending.size >= 2 || typeof createImageBitmap !== 'function')
      return Promise.resolve();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const promise = (async () => {
      let bitmap: ImageBitmap | null = null;
      let uploaded: WebGLTexture | null = null;
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok)
          throw new Error(`Trail image HTTP ${response.status}`);
        bitmap = await createImageBitmap(await response.blob());
        if (stopped || controller.signal.aborted) return;
        const bytes = bitmap.width * bitmap.height * 4;
        const maxBytes = 64 * 1024 * 1024;
        if (bytes > maxBytes) return;
        while (photos.size >= 2 || cachedBytes + bytes > maxBytes) {
          const oldest = [...photos].find(([key]) => key !== pinnedUrl);
          if (!oldest) return;
          gl.deleteTexture(oldest[1].texture);
          cachedBytes -= oldest[1].width * oldest[1].height * 4;
          photos.delete(oldest[0]);
        }
        uploaded = texture();
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          bitmap,
        );
        if (gl.getError() !== gl.NO_ERROR)
          throw new Error('Trail texture upload failed');
        photos.set(url, {
          texture: uploaded,
          width: bitmap.width,
          height: bitmap.height,
        });
        uploaded = null;
        cachedBytes += bytes;
        report.uploads++;
        report.status = 'ready';
      } catch (error) {
        if (!controller.signal.aborted && !stopped)
          report.errors.push(String(error));
      } finally {
        if (uploaded) gl.deleteTexture(uploaded);
        bitmap?.close();
        clearTimeout(timeout);
        if (pending.get(url)?.controller === controller) pending.delete(url);
      }
    })();
    pending.set(url, { promise, controller });
    return promise;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.ceil(innerWidth * dpr),
      height = Math.ceil(innerHeight * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
  }
  function begin(owner: HTMLElement, url: string) {
    if (stopped || !photos.has(url)) return false;
    resize();
    pinnedUrl = url;
    owner.append(canvas);
    report.active = true;
    return true;
  }
  function clear() {
    if (stopped) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  function draw(
    rect: Rect,
    corners: Corner[],
    opacity: number,
    treatment: Treatment,
  ) {
    const photo = pinnedUrl ? photos.get(pinnedUrl) : null;
    if (
      stopped ||
      !photo ||
      rect.width <= 0 ||
      rect.height <= 0 ||
      opacity <= 0
    )
      return;
    const selected = treatment === 'halftone' ? halftoneProgram : photoProgram;
    if (!selected) return;
    const { program, uniforms: u, position } = selected;
    const width = Math.max(1, Math.ceil(rect.width * dpr));
    const height = Math.max(1, Math.ceil(rect.height * dpr));
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(u.source, 0);
    gl.uniform2f(u.size, rect.width, rect.height);
    gl.uniform2f(u.imageSize, photo.width, photo.height);
    gl.uniform1f(u.opacity, opacity);
    const [a, b, c, d] = corners as [Corner, Corner, Corner, Corner];
    const scale = Math.min(
      1,
      rect.width / (a.x + b.x),
      rect.width / (c.x + d.x),
      rect.height / (a.y + d.y),
      rect.height / (b.y + c.y),
    );
    gl.uniform4f(u.radiusX, a.x * scale, b.x * scale, c.x * scale, d.x * scale);
    gl.uniform4f(u.radiusY, a.y * scale, b.y * scale, c.y * scale, d.y * scale);
    if (treatment === 'halftone') {
      if (bufferWidth < width || bufferHeight < height) {
        bufferWidth = Math.ceil(Math.max(width, bufferWidth) / 256) * 256;
        bufferHeight = Math.ceil(Math.max(height, bufferHeight) / 256) * 256;
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
      gl.uniform2f(u.sampleScale, width / bufferWidth, height / bufferHeight);
      gl.uniform2f(u.pixels, width, height);
      gl.uniform1f(u.cellSize, 11);
      gl.uniform1f(u.clipMode, 1);
      const kernels = [
        null,
        pairedKernel(1.1, width / rect.width),
        pairedKernel(1.1, height / rect.height),
        pairedKernel(0.6, width / rect.width),
        pairedKernel(0.6, height / rect.height),
      ];
      for (let stage = 0; stage < 5; stage++) {
        const kernel = kernels[stage];
        gl.uniform1f(u.compactKernel, kernel ? 1 : 0);
        if (kernel) gl.uniform2fv(u['kernel[0]'], kernel);
        if (stage === 4) setOutput(rect, width, height);
        else {
          gl.disable(gl.BLEND);
          gl.viewport(0, 0, width, height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, targets[stage % 2]!.framebuffer);
        }
        gl.bindTexture(
          gl.TEXTURE_2D,
          stage === 0 ? photo.texture : targets[(stage - 1) % 2]!.texture,
        );
        gl.uniform1f(u.stage, stage);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      report.halftoneDraws++;
    } else {
      setOutput(rect, width, height);
      gl.bindTexture(gl.TEXTURE_2D, photo.texture);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      report.photoDraws++;
    }
    report.draws++;
  }
  function setOutput(rect: Rect, width: number, height: number) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(
      Math.round(rect.left * dpr),
      canvas.height - Math.round((rect.top + rect.height) * dpr),
      width,
      height,
    );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }
  function stop() {
    report.active = false;
    pinnedUrl = null;
    canvas.remove();
    clear();
  }
  function dispose() {
    if (stopped) return;
    stop();
    stopped = true;
    for (const request of pending.values()) request.controller.abort();
    pending.clear();
    for (const photo of photos.values()) gl.deleteTexture(photo.texture);
    photos.clear();
    for (const target of targets) {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    }
    gl.deleteProgram(photoProgram.program);
    if (halftoneProgram) gl.deleteProgram(halftoneProgram.program);
    gl.deleteBuffer(vertices);
    report.status = 'stopped';
    canvas.removeEventListener('webglcontextlost', onContextLost);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
  function onContextLost(event: Event) {
    event.preventDefault();
    dispose();
    report.status = 'context lost';
  }
  canvas.addEventListener('webglcontextlost', onContextLost);
  report.status = 'ready';
  return {
    prepare,
    begin,
    clear,
    draw,
    stop,
    dispose,
    report,
    get available() {
      return !stopped;
    },
  };
}
