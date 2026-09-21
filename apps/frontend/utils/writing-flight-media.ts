import type { FeaturedImage } from '~/types/wordpress';
import { mediaImageSourceForTreatment } from '~/utils/featured-media';

// Keep a few decoded heroes ready, not a second full archive of large images. Intent requests can bypass the serial viewport queue.
const prepared = new Map<
  string,
  { image: HTMLImageElement; result: Promise<FeaturedImage | null> }
>();
const viewportQueue: Array<{ media: FeaturedImage; idle: () => boolean }> = [];
let warming = false;
const MAX_PREPARED = 3;
const PREPARE_TIMEOUT = 1500;

export function prepareWritingFlightMedia(media?: FeaturedImage | null) {
  if (!import.meta.client || !media?.sourceUrl) return Promise.resolve(null);
  const source = mediaImageSourceForTreatment(media);
  const key = `${source.srcSet || source.sourceUrl}|${innerWidth}|${devicePixelRatio}`;
  const existing = prepared.get(key);
  if (existing) {
    prepared.delete(key);
    prepared.set(key, existing);
    return existing.result;
  }
  const image = new Image();
  image.decoding = 'async';
  image.sizes = '100vw';
  if (source.srcSet) image.srcset = source.srcSet;
  image.src = source.sourceUrl;
  const result = new Promise<FeaturedImage | null>((resolve) => {
    let finished = false;
    const finish = (ready: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      if (!ready) {
        if (prepared.get(key)?.image === image) prepared.delete(key);
        image.removeAttribute('srcset');
        image.removeAttribute('src');
      }
      resolve(
        ready
          ? {
              ...media,
              sourceUrl: image.currentSrc || image.src,
              srcSet: null,
              sizes: null,
              treatment: 'default',
            }
          : null,
      );
    };
    const timeout = setTimeout(() => finish(false), PREPARE_TIMEOUT);
    void image.decode().then(
      () => finish(image.naturalWidth > 0),
      () => finish(false),
    );
  });
  prepared.set(key, { image, result });
  while (prepared.size > MAX_PREPARED)
    prepared.delete(prepared.keys().next().value!);
  return result;
}

async function warmNext() {
  if (warming || !viewportQueue.length) return;
  if (!viewportQueue[0]!.idle()) {
    setTimeout(() => void warmNext(), 200);
    return;
  }
  warming = true;
  const next = viewportQueue.shift()!;
  await prepareWritingFlightMedia(next.media);
  warming = false;
  void warmNext();
}

export function warmWritingFlightFromViewport(
  media: FeaturedImage,
  idle: () => boolean,
) {
  if (viewportQueue.length >= MAX_PREPARED) return;
  viewportQueue.push({ media, idle });
  void warmNext();
}
