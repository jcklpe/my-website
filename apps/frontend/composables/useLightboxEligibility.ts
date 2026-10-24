import type { Ref } from 'vue';
import {
  canEnlargeImage,
  getImageContentBox,
  type ImageSize,
} from '~/utils/lightbox-geometry';
import { getImageNaturalSize } from './useImageLightbox';

export function observeLightboxEligibility(
  image: HTMLImageElement,
  src: string,
  update: (eligible: boolean) => void,
) {
  let active = true;
  let dimensions: ImageSize | null = null;
  let requested = false;
  const measure = () => {
    if (!active || !dimensions) return;
    update(
      canEnlargeImage(
        dimensions,
        getImageContentBox(image, false),
        getComputedStyle(image).objectFit,
      ),
    );
  };
  const observer = new ResizeObserver(measure);
  observer.observe(image);
  image.addEventListener('load', measure);
  const intersection = new IntersectionObserver(
    (entries) => {
      if (requested || !entries.some((entry) => entry.isIntersecting)) return;
      requested = true;
      void getImageNaturalSize(src).then((size) => {
        if (!active) return;
        dimensions = size;
        if (!size) update(false);
        measure();
      });
    },
    { rootMargin: '300px' },
  );
  intersection.observe(image);
  return () => {
    active = false;
    observer.disconnect();
    intersection.disconnect();
    image.removeEventListener('load', measure);
  };
}

export function useLightboxEligibility(
  image: Ref<HTMLImageElement | null>,
  src: Ref<string>,
) {
  const eligible = ref(false);
  watch(
    [image, src],
    ([element, source], [, previousSource], cleanup) => {
      if (source !== previousSource) eligible.value = false;
      if (!element || !source) return;
      cleanup(
        observeLightboxEligibility(element, source, (value) => {
          eligible.value = value;
        }),
      );
    },
    { flush: 'post' },
  );
  return eligible;
}
