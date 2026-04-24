<script setup lang="ts">
  import type Masonry from 'masonry-layout';
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractAttribute } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  interface ImageItem {
    type: 'image';
    thumbSrc: string;
    fullSrc: string;
    alt: string;
    width: number;
    height: number;
    caption: string;
  }

  interface VideoItem {
    type: 'video';
    videoSrc: string;
    poster: string;
  }

  type GalleryItem = ImageItem | VideoItem;

  function parseImageBlock(block: GutenbergBlock): ImageItem | null {
    const html = block.renderedHtml;
    if (!html) return null;

    const imgMatch = html.match(/<img\b([^>]*)>/i);
    if (!imgMatch) return null;

    const attrs = imgMatch[1];
    const src = extractAttribute(attrs, 'src');
    if (!src) return null;

    const alt = extractAttribute(attrs, 'alt') || '';
    const widthAttr = extractAttribute(attrs, 'width');
    const heightAttr = extractAttribute(attrs, 'height');
    const srcset = extractAttribute(attrs, 'srcset');

    // Pick the largest srcset entry for the lightbox full view
    let fullSrc = src;
    if (srcset) {
      const entries = srcset.split(',').map((s) => {
        const parts = s.trim().split(/\s+/);
        return { url: parts[0] ?? '', w: parseInt(parts[1] ?? '0', 10) };
      });
      entries.sort((a, b) => b.w - a.w);
      if (entries[0]?.url) fullSrc = entries[0].url;
    }

    const captionMatch = html.match(
      /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
    );
    const caption = captionMatch
      ? captionMatch[1].replace(/<[^>]+>/g, '').trim()
      : '';

    return {
      type: 'image',
      thumbSrc: src,
      fullSrc,
      alt,
      width: widthAttr ? parseInt(widthAttr, 10) : 1200,
      height: heightAttr ? parseInt(heightAttr, 10) : 900,
      caption,
    };
  }

  function parseVideoBlock(block: GutenbergBlock): VideoItem | null {
    const html = block.renderedHtml;
    if (!html) return null;

    const videoTagMatch = html.match(/<video\b([^>]*)>/i);
    if (!videoTagMatch) return null;

    // src can be on the <video> tag directly or on a nested <source>
    let videoSrc = extractAttribute(videoTagMatch[1], 'src');
    if (!videoSrc) {
      const sourceMatch = html.match(/<source\b([^>]*)>/i);
      if (sourceMatch) videoSrc = extractAttribute(sourceMatch[1], 'src');
    }
    if (!videoSrc) return null;

    const poster = extractAttribute(videoTagMatch[1], 'poster') || '';
    return { type: 'video', videoSrc, poster };
  }

  const galleryItems = computed((): GalleryItem[] =>
    (props.allBlocks ?? [])
      .filter((b) => b.parentClientId === props.block.clientId)
      .flatMap((b): GalleryItem[] => {
        if (b.name === 'core/image') {
          const item = parseImageBlock(b);
          return item ? [item] : [];
        }
        if (b.name === 'core/video') {
          const item = parseVideoBlock(b);
          return item ? [item] : [];
        }
        return [];
      }),
  );

  const galleryEl = ref<HTMLElement | null>(null);
  let masonryInstance: Masonry | null = null;
  let resizeObserver: ResizeObserver | null = null;

  onMounted(async () => {
    if (!galleryEl.value || galleryItems.value.length === 0) return;

    const { default: MasonryLib } = await import('masonry-layout');
    masonryInstance = new MasonryLib(galleryEl.value, {
      itemSelector: '.mega-gallery-item',
      columnWidth: '.mega-gallery-sizer',
      percentPosition: true,
      gutter: 12,
      transitionDuration: 0,
    });

    resizeObserver = new ResizeObserver(() => {
      masonryInstance?.layout?.();
    });
    resizeObserver.observe(galleryEl.value);
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
    masonryInstance?.destroy?.();
    resizeObserver = null;
    masonryInstance = null;
  });

  function onImageLoad() {
    masonryInstance?.layout?.();
  }

  async function openLightbox(item: GalleryItem) {
    const index = galleryItems.value.indexOf(item);
    if (index < 0) return;

    const slides = galleryItems.value.map((i) => {
      if (i.type === 'image') {
        return {
          src: i.fullSrc,
          width: i.width,
          height: i.height,
          alt: i.alt,
          caption: i.caption || undefined,
        };
      }
      // Video slide — PhotoSwipe renders the html string inside the slide item
      return {
        html: `<div class="pswp-video-wrap"><video class="pswp-video" src="${i.videoSrc}" autoplay loop muted playsinline ${i.poster ? `poster="${i.poster}"` : ''}></video></div>`,
      };
    });

    const { default: PhotoSwipe } = await import('photoswipe');
    const pswp = new PhotoSwipe({ dataSource: slides, index });

    // contentActivate fires after content.element is appended to the slide
    // container, so querySelector is guaranteed to find the video.
    pswp.on('contentActivate', ({ content }) => {
      (content.element as HTMLElement | undefined)
        ?.querySelector<HTMLVideoElement>('.pswp-video')
        ?.play()
        .catch(() => {});
    });

    // Pause when the slide leaves view (swipe away or gallery close).
    pswp.on('contentDeactivate', ({ content }) => {
      (content.element as HTMLElement | undefined)
        ?.querySelector<HTMLVideoElement>('.pswp-video')
        ?.pause();
    });

    pswp.init();
  }
</script>

<template>
  <div class="mega-gallery-block">
    <div ref="galleryEl" class="mega-gallery-grid">
      <div class="mega-gallery-sizer" aria-hidden="true" />
      <div
        v-for="(item, i) in galleryItems"
        :key="i"
        class="mega-gallery-item"
        :class="`mega-gallery-item--${item.type}`"
      >
        <button
          v-if="item.type === 'image'"
          class="mega-gallery-trigger"
          type="button"
          :aria-label="item.alt ? `View: ${item.alt}` : 'View image fullsize'"
          @click="openLightbox(item)"
        >
          <img
            :src="item.thumbSrc"
            :alt="item.alt"
            :width="item.width"
            :height="item.height"
            loading="lazy"
            @load="onImageLoad"
          />
          <figcaption v-if="item.caption" class="mega-gallery-caption">
            {{ item.caption }}
          </figcaption>
        </button>

        <button
          v-else
          class="mega-gallery-trigger"
          type="button"
          aria-label="View video fullscreen"
          @click="openLightbox(item)"
        >
          <video
            class="mega-gallery-video"
            autoplay
            loop
            muted
            playsinline
            :poster="item.poster || undefined"
          >
            <source :src="item.videoSrc" type="video/mp4" />
          </video>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .mega-gallery-block {
    grid-column: content;
  }

  .mega-gallery-grid {
    width: 100%;
  }

  .mega-gallery-sizer,
  .mega-gallery-item {
    // 3 columns: width = (100% - 2 * 12px gutter) / 3
    width: calc(33.3333% - 8px);
  }

  .mega-gallery-item {
    margin-bottom: 12px;

    &--video {
      overflow: hidden;
    }
  }

  .mega-gallery-trigger {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;

    img {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  .mega-gallery-video {
    display: block;
    width: 100%;
    height: auto;
    /* clicks go to the button wrapper, not the video element */
    pointer-events: none;
  }

  /* PhotoSwipe video slide layout — rules applied globally via separate style block below */

  .mega-gallery-caption {
    font-size: 0.8em;
    color: var(--color-ink);
    opacity: 0.65;
    margin-top: 0.4rem;
    text-align: center;
  }

  @media (max-width: 768px) {
    .mega-gallery-sizer,
    .mega-gallery-item {
      width: calc(50% - 6px);
    }
  }

  @media (max-width: 480px) {
    .mega-gallery-sizer,
    .mega-gallery-item {
      width: 100%;
    }
  }
</style>

<style>
  /* PhotoSwipe video slide — must be global because PhotoSwipe appends to document.body */
  .pswp-video-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .pswp-video {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
  }
</style>
