import type { Ref } from 'vue';
import {
  getBestLightboxImageSource,
  isImageFileUrl,
  useImageLightbox,
} from './useImageLightbox';
import { observeLightboxEligibility } from './useLightboxEligibility';

// Enhance only the per-block v-html islands; Vue-rendered images keep declarative controls.
export function useHtmlImageLightbox(
  root: Ref<HTMLElement | null>,
  html: Ref<string>,
  enabled: Ref<boolean> = ref(true),
) {
  const { openImage } = useImageLightbox();
  watch(
    [root, html, enabled],
    ([element, , allowed], _, cleanup) => {
      if (!element || !allowed) return;
      const restorations: (() => void)[] = [];
      for (const image of element.querySelectorAll('img')) {
        const anchor = image.closest('a');
        if (anchor && !isImageFileUrl(anchor.href)) continue;
        const src = getBestLightboxImageSource({
          href: anchor?.href,
          src: image.src,
          srcset: image.srcset,
        });
        // A media-file link must also lose its action when there is no enlargement.
        const anchorChildren = anchor ? Array.from(anchor.childNodes) : [];
        if (anchor) anchor.replaceWith(...anchorChildren);
        let button: HTMLButtonElement | null = null;
        const stop = observeLightboxEligibility(image, src, (eligible) => {
          if (eligible && !button) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'raw-image-lightbox-trigger';
            button.setAttribute(
              'aria-label',
              image.alt ? `View: ${image.alt}` : 'View image fullsize',
            );
            button.onclick = () => {
              void openImage(src, image.alt, image);
            };
            image.replaceWith(button);
            button.append(image);
          } else if (!eligible && button) {
            button.replaceWith(image);
            button = null;
          }
        });
        restorations.push(() => {
          stop();
          if (button) button.replaceWith(image);
          const firstChild = anchorChildren[0];
          if (anchor && firstChild?.isConnected) {
            firstChild.parentNode?.insertBefore(anchor, firstChild);
            anchor.append(...anchorChildren);
          }
        });
      }
      cleanup(() => restorations.forEach((restore) => restore()));
    },
    { flush: 'post' },
  );
}
