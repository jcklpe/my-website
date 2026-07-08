/**
 * PhotoSwipe lightbox helpers shared by single images, footnote images, and
 * gallery-like content. PhotoSwipe is dynamically imported at open time so SSR
 * and initial page load stay clean.
 */

export interface ImageLightboxSlide {
  src: string;
  alt?: string;
  caption?: string;
  msrc?: string;
  width?: number;
  height?: number;
}

interface PhotoSwipeSlide {
  src: string;
  alt?: string;
  caption?: string;
  msrc?: string;
  width: number;
  height: number;
}

const fallbackDimensions = { width: 1200, height: 900 };

function getImageNaturalSize(
  src: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function getLargestSrcFromSrcset(srcset: string | null | undefined) {
  if (!srcset) {
    return '';
  }

  const candidates = srcset
    .split(',')
    .map((candidate) => candidate.trim())
    .map((candidate) => {
      const [src = '', descriptor = ''] = candidate.split(/\s+/);
      const width = Number.parseInt(descriptor.replace(/w$/, ''), 10);

      return {
        src,
        width: Number.isFinite(width) ? width : 0,
      };
    })
    .filter((candidate) => candidate.src);

  return candidates.sort((a, b) => b.width - a.width)[0]?.src ?? '';
}

export function getBestLightboxImageSource(options: {
  href?: string;
  src?: string;
  srcset?: string;
}) {
  if (options.href && isImageFileUrl(options.href)) {
    return options.href;
  }

  return getLargestSrcFromSrcset(options.srcset) || options.src || '';
}

export function isImageFileUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(value);
}

export function useImageLightbox() {
  async function resolveSlides(slides: ImageLightboxSlide[]) {
    return Promise.all(
      slides.map(async (slide): Promise<PhotoSwipeSlide | null> => {
        if (!slide.src) {
          return null;
        }

        const dimensions =
          slide.width && slide.height
            ? { width: slide.width, height: slide.height }
            : await getImageNaturalSize(slide.src);

        return {
          ...slide,
          ...(dimensions ?? fallbackDimensions),
        };
      }),
    );
  }

  async function openSlides(slides: ImageLightboxSlide[], index = 0) {
    const resolvedSlides = (await resolveSlides(slides)).filter(
      (slide): slide is PhotoSwipeSlide => Boolean(slide),
    );

    if (resolvedSlides.length === 0) {
      return;
    }

    const { default: PhotoSwipe } = await import('photoswipe');
    const pswp = new PhotoSwipe({
      dataSource: resolvedSlides,
      index: Math.min(Math.max(index, 0), resolvedSlides.length - 1),
    });
    pswp.init();
  }

  async function openImage(src: string, alt = '') {
    await openSlides([{ src, alt }]);
  }

  return { openImage, openSlides };
}
