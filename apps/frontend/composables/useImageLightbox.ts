import type PhotoSwipe from 'photoswipe';
import type { PhotoSwipeFiltersMap } from 'photoswipe';
import { attachLightboxTrails } from '~/utils/lightbox-trails';
import {
  canEnlargeImage,
  getImageContentBox,
  imageThumbBounds,
  type ImageSize,
} from '~/utils/lightbox-geometry';

export interface ImageLightboxSlide {
  src: string;
  alt?: string;
  caption?: string;
  msrc?: string;
  width?: number;
  height?: number;
  getThumbnail?: () => HTMLImageElement | null | undefined;
}

export type MediaLightboxSlide = ImageLightboxSlide | { html: string };
const imageSizes = new Map<string, Promise<ImageSize | null>>();
let activeLightbox: PhotoSwipe | null = null;
let opening = false;

export function getImageNaturalSize(src: string): Promise<ImageSize | null> {
  if (!src) return Promise.resolve(null);
  const cached = imageSizes.get(src);
  if (cached) return cached;
  const pending = new Promise<ImageSize | null>((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve(
        img.naturalWidth && img.naturalHeight
          ? { width: img.naturalWidth, height: img.naturalHeight }
          : null,
      );
    img.onerror = () => {
      imageSizes.delete(src);
      resolve(null);
    };
    img.src = src;
  });
  imageSizes.set(src, pending);
  return pending;
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
  const motion = useHomeMotionDebug();
  let disposed = false;
  let ownedLightbox: PhotoSwipe | null = null;
  onScopeDispose(() => {
    disposed = true;
    if (ownedLightbox?.opener.isOpening) {
      ownedLightbox.on('openingAnimationEnd', () => ownedLightbox?.destroy());
    } else {
      ownedLightbox?.destroy();
    }
  });
  async function openSlides(slides: MediaLightboxSlide[], index = 0) {
    if (opening || activeLightbox || !import.meta.client) return;
    const returnFocus = document.activeElement;
    opening = true;
    try {
      const selected = slides[index];
      const resolved = await Promise.all(
        slides.map(async (slide) => {
          if (!('src' in slide)) return { source: slide, data: slide };
          const dimensions = await getImageNaturalSize(slide.src);
          if (!dimensions) return null;
          const thumbnail = slide.getThumbnail?.();
          if (
            thumbnail &&
            !canEnlargeImage(
              dimensions,
              getImageContentBox(thumbnail, false),
              getComputedStyle(thumbnail).objectFit,
            )
          )
            return null;
          return {
            source: slide,
            data: {
              ...slide,
              ...dimensions,
              msrc: thumbnail?.currentSrc || slide.msrc,
            },
          };
        }),
      );
      const available = resolved.filter((slide) => slide !== null);
      const selectedIndex = available.findIndex(
        (slide) => slide.source === selected,
      );
      if (selectedIndex < 0 || disposed) return;
      if (
        selected &&
        'src' in selected &&
        selected.getThumbnail &&
        !selected.getThumbnail()?.isConnected
      )
        return;
      const { default: PhotoSwipe } = await import('photoswipe');
      if (disposed) return;
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const tokens = getComputedStyle(document.documentElement);
      const easing = tokens.getPropertyValue('--snappy-ease-out').trim();
      const slowDuration = tokens.getPropertyValue('--slow-duration').trim();
      const duration =
        Number.parseFloat(slowDuration) *
        (slowDuration.endsWith('ms') ? 1 : 1000);
      const pswp = new PhotoSwipe({
        dataSource: available.map((slide) => slide.data),
        index: selectedIndex,
        showHideAnimationType: 'zoom',
        showAnimationDuration: reducedMotion ? 0 : duration,
        hideAnimationDuration: reducedMotion ? 0 : duration * 0.8,
        easing,
        returnFocus: false,
      });
      activeLightbox = pswp;
      ownedLightbox = pswp;
      const hiddenThumbnails = new Map<HTMLImageElement, string>();
      const hideThumbnail = () => {
        const image = pswp.currSlide?.data.getThumbnail?.() as
          | HTMLImageElement
          | undefined;
        if (!image || hiddenThumbnails.has(image)) return;
        hiddenThumbnails.set(image, image.style.visibility);
        image.style.visibility = 'hidden';
      };
      pswp.on('openingAnimationStart', hideThumbnail);
      pswp.on('change', () => {
        // Initial change fires before the placeholder is decoded and visible.
        if (pswp.opener.isOpen) hideThumbnail();
      });
      pswp.on('destroy', () => {
        for (const [image, visibility] of hiddenThumbnails)
          image.style.visibility = visibility;
        activeLightbox = null;
        ownedLightbox = null;
        // Wait for PhotoSwipe to remove its focus trap, without scrolling a tall trigger into view.
        queueMicrotask(() => {
          if (
            !disposed &&
            returnFocus instanceof HTMLElement &&
            returnFocus.isConnected
          )
            returnFocus.focus({ preventScroll: true });
        });
      });
      pswp.addFilter(
        'thumbEl',
        (element, data) => data.getThumbnail?.() ?? element,
      );
      // PhotoSwipe accepts undefined to fall back to a fade, but its filter return type omits it.
      pswp.addFilter('thumbBounds', ((bounds, data) => {
        const image = data.getThumbnail?.() as HTMLImageElement | undefined;
        if (!image?.isConnected || !data.width || !data.height)
          return undefined;
        const box = getImageContentBox(image);
        if (box.y + box.height <= 0 || box.y >= window.innerHeight)
          return undefined;
        const style = getComputedStyle(image);
        return (
          imageThumbBounds(
            { width: data.width, height: data.height },
            box,
            style.objectFit,
            style.objectPosition,
          ) ?? bounds
        );
      }) as PhotoSwipeFiltersMap['thumbBounds']);
      pswp.on('firstUpdate', () =>
        pswp.element?.setAttribute('aria-label', 'Media viewer'),
      );
      const playVideo = () => {
        pswp.currSlide?.content.element
          ?.querySelector<HTMLVideoElement>('video')
          ?.play()
          .catch(() => {});
      };
      pswp.on('openingAnimationEnd', playVideo);
      // change runs after PhotoSwipe assigns currSlide; contentActivate runs before that assignment.
      pswp.on('change', playVideo);
      pswp.on('contentDeactivate', ({ content }) =>
        content.element?.querySelector<HTMLVideoElement>('video')?.pause(),
      );
      if (!reducedMotion && motion.enableTransitionTrails.value) {
        attachLightboxTrails(pswp, {
          count: motion.trailCount.value,
          opacity: motion.trailOpacity.value,
          spread: motion.trailSpread.value,
        });
      }
      pswp.init();
    } finally {
      opening = false;
    }
  }

  async function openImage(
    src: string,
    alt = '',
    thumbnail?: HTMLImageElement,
  ) {
    await openSlides([
      { src, alt, getThumbnail: thumbnail ? () => thumbnail : undefined },
    ]);
  }
  return { openImage, openSlides };
}
