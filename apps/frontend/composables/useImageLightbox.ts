/**
 * Single-image PhotoSwipe lightbox — same library and CSS as MegaGalleryBlock,
 * so presentation stays consistent across all lightbox entry-points.
 */

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

export function useImageLightbox() {
  async function openImage(src: string, alt = '') {
    const dims = await getImageNaturalSize(src);
    const { default: PhotoSwipe } = await import('photoswipe');
    const pswp = new PhotoSwipe({
      dataSource: [{ src, alt, ...(dims ?? { width: 1200, height: 900 }) }],
      index: 0,
    });
    pswp.init();
  }

  return { openImage };
}
