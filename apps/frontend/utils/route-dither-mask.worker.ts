import { atkinsonCoverage } from './dither-atkinson';
import type { DitherMaskInput } from './route-dither-mask';

function pngChunk(type: string, bytes: Uint8Array) {
  const chunk = new Uint8Array(bytes.length + 12);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, bytes.length);
  chunk.set(new TextEncoder().encode(type), 4);
  chunk.set(bytes, 8);
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, -4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ ((crc & 1) * 0xedb88320);
  }
  view.setUint32(chunk.length - 4, (crc ^ 0xffffffff) >>> 0);
  return chunk;
}

self.onmessage = async ({ data }: MessageEvent<DitherMaskInput>) => {
  const { luminance, columns, rows, width, height } = data;
  const started = performance.now();
  const atlasWidth = columns * 8;
  const atlasHeight = rows * 5;
  const stride = atlasWidth / 8 + 1;
  const pixels = new Uint8Array(stride * atlasHeight);
  // A one-bit PNG stores the binary masks directly. Encoding one atlas avoids canvas PNG encoders' idle scheduling and 37 separate image encodes.
  for (let frame = 0; frame <= 36; frame++) {
    const coverage = atkinsonCoverage(luminance, columns, rows, frame / 36);
    const left = (frame % 8) * columns;
    const top = Math.floor(frame / 8) * rows;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        if (!coverage[y * columns + x]) continue;
        const column = left + x;
        pixels[(top + y) * stride + 1 + (column >> 3)]! |=
          1 << (7 - (column & 7));
      }
    }
  }
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, atlasWidth);
  view.setUint32(4, atlasHeight);
  header[8] = 1; // One-bit grayscale; every scanline uses PNG's unfiltered layout.
  const stream = new Blob([pixels])
    .stream()
    .pipeThrough(new CompressionStream('deflate'));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  const png = new Blob(
    [
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
      pngChunk('IHDR', header),
      pngChunk('IDAT', compressed),
      pngChunk('IEND', new Uint8Array()),
    ],
    { type: 'image/png' },
  );
  self.postMessage({
    png,
    columns,
    rows,
    width,
    height,
    elapsed: performance.now() - started,
  });
};
