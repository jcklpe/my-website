export type DitherMaskInput = {
  luminance: Float32Array;
  columns: number;
  rows: number;
  width: number;
  height: number;
};

type DitherMasks = { frames: string[]; elapsed: number };
const masks = new Map<string, Promise<DitherMasks | null>>();
const readyMasks = new Map<string, DitherMasks>();

function geometry(image: HTMLImageElement) {
  const rect = image.getBoundingClientRect();
  const style = getComputedStyle(image);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const key = [
    image.currentSrc,
    width,
    height,
    style.objectFit,
    style.objectPosition,
  ].join('|');
  return { width, height, style, key };
}

export function preparedDitherMasks(image: HTMLImageElement) {
  return readyMasks.get(geometry(image).key);
}

export function prepareDitherMasks(image: HTMLImageElement) {
  const { width, height, style, key } = geometry(image);
  const pending = masks.get(key);
  if (pending) return pending;

  const prepare = async () => {
    // CMS uploads allow anonymous CORS. Read a separate image so existing authored image/loading semantics stay intact.
    const source = new Image();
    source.crossOrigin = 'anonymous';
    source.src = image.currentSrc;
    await source.decode();
    const cell = Math.max(2, Math.ceil(Math.sqrt((width * height) / 100_000)));
    const columns = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    const canvas = document.createElement('canvas');
    canvas.width = columns;
    canvas.height = rows;
    const context = canvas.getContext('2d')!;
    let drawWidth = width;
    let drawHeight = height;
    if (style.objectFit !== 'fill') {
      let scale = Math.min(
        width / source.naturalWidth,
        height / source.naturalHeight,
      );
      if (style.objectFit === 'cover')
        scale = Math.max(
          width / source.naturalWidth,
          height / source.naturalHeight,
        );
      if (style.objectFit === 'none') scale = 1;
      if (style.objectFit === 'scale-down') scale = Math.min(1, scale);
      drawWidth = source.naturalWidth * scale;
      drawHeight = source.naturalHeight * scale;
    }
    const position = style.objectPosition.split(' ');
    const positionX = Number.parseFloat(position[0] ?? '50') / 100;
    const positionY = Number.parseFloat(position[1] ?? '50') / 100;
    context.drawImage(
      source,
      ((width - drawWidth) * positionX * columns) / width,
      ((height - drawHeight) * positionY * rows) / height,
      (drawWidth * columns) / width,
      (drawHeight * rows) / height,
    );
    const pixels = context.getImageData(0, 0, columns, rows).data;
    const luminance = new Float32Array(columns * rows);
    for (let i = 0; i < luminance.length; i++) {
      luminance[i] =
        (0.2126 * pixels[i * 4]! +
          0.7152 * pixels[i * 4 + 1]! +
          0.0722 * pixels[i * 4 + 2]!) /
        255;
    }
    return new Promise<DitherMasks>((resolve, reject) => {
      const worker = new Worker(
        new URL('./route-dither-mask.worker.ts', import.meta.url),
        { type: 'module' },
      );
      const timeout = window.setTimeout(() => {
        worker.terminate();
        reject(new Error('Dither mask preparation timed out'));
      }, 4000);
      worker.onerror = () => {
        clearTimeout(timeout);
        worker.terminate();
        reject(new Error('Dither mask preparation failed'));
      };
      worker.onmessage = ({
        data,
      }: MessageEvent<{
        png: Blob;
        columns: number;
        rows: number;
        width: number;
        height: number;
        elapsed: number;
      }>) => {
        clearTimeout(timeout);
        worker.terminate();
        // Encode one atlas instead of 37 PNGs. Each small SVG crops one frame from the shared embedded atlas; pixelated scaling keeps the binary marks crisp.
        const reader = new FileReader();
        reader.onerror = () =>
          reject(new Error('Dither atlas could not be read'));
        reader.onload = () => {
          const frames = Array.from({ length: 37 }, (_, frame) => {
            const x = (frame % 8) * data.columns;
            const y = Math.floor(frame / 8) * data.rows;
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${data.width}" height="${data.height}" viewBox="${x} ${y} ${data.columns} ${data.rows}" preserveAspectRatio="none"><image width="${data.columns * 8}" height="${data.rows * 5}" href="${reader.result}" image-rendering="pixelated" /></svg>`;
            return URL.createObjectURL(
              new Blob([svg], { type: 'image/svg+xml' }),
            );
          });
          const result = { frames, elapsed: data.elapsed };
          readyMasks.set(key, result);
          // Keep navigation/re-entry cheap without retaining every image/viewport ever visited.
          while (readyMasks.size > 12) {
            const oldest = readyMasks.keys().next().value!;
            readyMasks
              .get(oldest)!
              .frames.forEach((url) => URL.revokeObjectURL(url));
            readyMasks.delete(oldest);
            masks.delete(oldest);
          }
          resolve(result);
        };
        reader.readAsDataURL(data.png);
      };
      worker.postMessage(
        { luminance, columns, rows, width, height } satisfies DitherMaskInput,
        [luminance.buffer],
      );
    });
  };
  // Cross-origin images without readable pixels, or unavailable workers, retain the genuine brightness-weighted Bayer path.
  const result = prepare().catch(() => {
    masks.delete(key);
    return null;
  });
  masks.set(key, result);
  return result;
}
