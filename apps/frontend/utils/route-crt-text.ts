import { crtWarpGlsl, readCrtWarp } from './crt-warp';

type TextRenderer = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  resize: () => void;
  matchesViewport: () => boolean;
  draw: () => boolean;
};
let renderer: TextRenderer | null | undefined;
let releaseActive: (() => void) | null = null;

function createRenderer(): TextRenderer | null {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  const ink = document.createElement('canvas');
  const context = ink.getContext('2d');
  if (!gl || !context) return null;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!program || !buffer || !texture) return null;
  const shaders: WebGLShader[] = [];
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
    uniform sampler2D ink;
    uniform vec2 viewportSize, ripple;
    ${crtWarpGlsl}
    void main() {
      vec2 pixels = vec2(uv.x, 1.0 - uv.y) * viewportSize;
      vec2 point = (pixels - crtWarp(pixels, viewportSize, ripple)) / viewportSize;
      bool outside = point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0;
      gl_FragColor = outside ? vec4(0.0) : texture2D(ink, point);
    }`;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  shaders.forEach((shader) => gl.deleteShader(shader));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
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
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.uniform1i(gl.getUniformLocation(program, 'ink'), 0);
  const viewport = gl.getUniformLocation(program, 'viewportSize');
  const ripple = gl.getUniformLocation(program, 'ripple');
  canvas.addEventListener('webglcontextlost', () => {
    releaseActive?.();
    renderer = undefined;
  });
  let preparedWidth = 0;
  let preparedHeight = 0;
  return {
    matchesViewport: () =>
      preparedWidth === innerWidth && preparedHeight === innerHeight,
    canvas,
    context,
    resize() {
      const scale = Math.min(
        devicePixelRatio || 1,
        1.5,
        Math.sqrt(2000000 / (innerWidth * innerHeight)),
      );
      const width = Math.max(1, Math.round(innerWidth * scale));
      const height = Math.max(1, Math.round(innerHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = ink.width = width;
        canvas.height = ink.height = height;
      }
      preparedWidth = innerWidth;
      preparedHeight = innerHeight;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      gl.viewport(0, 0, width, height);
      gl.uniform2f(viewport, innerWidth, innerHeight);
    },
    draw() {
      if (gl.isContextLost()) return false;
      const state = readCrtWarp();
      gl.uniform2f(ripple, state.milliseconds, state.strength);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ink);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return true;
    },
  };
}

export function prepareRouteCrtText() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (renderer === undefined) renderer = createRenderer();
  if (renderer) {
    renderer.resize();
    renderer.draw();
  }
}

export function startRouteCrtText(root: HTMLElement, inks: HTMLElement[]) {
  releaseActive?.();
  // Shader compilation and texture allocation happen during idle preparation, never as a navigation prerequisite.
  const output = renderer;
  if (!output || !output.matchesViewport()) return null;
  const { context, canvas } = output;
  type FontSnapshot = {
    font: string;
    color: string;
    uppercase: boolean;
    spacing: string;
    ascent: number;
    descent: number;
  };
  const fonts = new Map<HTMLElement, FontSnapshot>();
  const glyphs: Array<{
    element: HTMLElement;
    font: FontSnapshot;
    x: number;
    y: number;
  }> = [];
  for (const ink of inks) {
    for (const element of ink.querySelectorAll<HTMLElement>('span')) {
      if (element.style.display !== 'inline-block' || !element.style.width)
        continue;
      const rect = element.getBoundingClientRect();
      if (
        rect.bottom <= 0 ||
        rect.top >= innerHeight ||
        rect.right <= 0 ||
        rect.left >= innerWidth
      )
        continue;
      const parent = element.parentElement!;
      let font = fonts.get(parent);
      if (!font) {
        const style = getComputedStyle(parent);
        const family = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        context.font = family;
        const metrics = context.measureText('Mg');
        font = {
          font: family,
          color: style.color,
          uppercase: style.textTransform === 'uppercase',
          spacing:
            style.letterSpacing === 'normal' ? '0px' : style.letterSpacing,
          ascent:
            metrics.fontBoundingBoxAscent || metrics.actualBoundingBoxAscent,
          descent:
            metrics.fontBoundingBoxDescent || metrics.actualBoundingBoxDescent,
        };
        fonts.set(parent, font);
      }
      glyphs.push({
        element,
        font,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2 + (font.ascent - font.descent) / 2,
      });
    }
  }
  if (!glyphs.length) return null;
  const originals = inks.map((element) => ({
    element,
    opacity: element.style.opacity,
  }));
  let frame = 0;
  let lastPaint = -Infinity;
  let disposed = false;
  const paint = () => {
    context.clearRect(0, 0, innerWidth, innerHeight);
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    let previousFont: FontSnapshot | null = null;
    let previousColor = '';
    for (const { element, font, x, y } of glyphs) {
      if (font !== previousFont) {
        context.font = font.font;
        context.letterSpacing = font.spacing;
        previousFont = font;
      }
      const color = element.style.color || font.color;
      if (color !== previousColor) {
        context.fillStyle = color;
        previousColor = color;
      }
      const text = element.textContent ?? '';
      context.fillText(font.uppercase ? text.toUpperCase() : text, x, y);
    }
    return output.draw();
  };
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    canvas.remove();
    originals.forEach(
      ({ element, opacity }) => (element.style.opacity = opacity),
    );
    delete root.dataset.routeCrtText;
    if (releaseActive === dispose) releaseActive = null;
  }
  if (!paint()) return null;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.routeCrtTextSurface = '';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 'var(--z-low)',
  });
  root.append(canvas);
  originals.forEach(({ element }) => (element.style.opacity = '0'));
  root.dataset.routeCrtText = 'shader';
  releaseActive = dispose;
  const tick = (now: number) => {
    if (disposed) return;
    if (now - lastPaint >= 1000 / 30) {
      if (!paint()) {
        dispose();
        return;
      }
      lastPaint = now;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return dispose;
}
