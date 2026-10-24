<script setup lang="ts">
  import type Masonry from 'masonry-layout';
  import {
    getBestLightboxImageSource,
    isImageFileUrl,
    type MediaLightboxSlide,
  } from '~/composables/useImageLightbox';
  import { observeLightboxEligibility } from '~/composables/useLightboxEligibility';
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractAttribute } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  interface ImageItem {
    type: 'image';
    thumbSrc: string;
    thumbSrcSet: string;
    thumbSizes: string;
    fullSrc: string;
    href?: string;
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
    const sizes = extractAttribute(attrs, 'sizes');

    const link = html.match(/<a\b([^>]*)>\s*<img/i);
    const href = link ? extractAttribute(link[1], 'href') : '';
    const fullSrc = getBestLightboxImageSource({ href, src, srcset });

    const captionMatch = html.match(
      /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
    );
    const caption = captionMatch
      ? captionMatch[1].replace(/<[^>]+>/g, '').trim()
      : '';

    return {
      type: 'image',
      thumbSrc: src,
      thumbSrcSet: srcset || '',
      thumbSizes:
        sizes || '(max-width: 640px) 100vw, (max-width: 960px) 50vw, 34vw',
      fullSrc,
      href: href && !isImageFileUrl(href) ? href : undefined,
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

  const blockAttrs = computed(() => {
    const html = props.block.renderedHtml ?? '';
    const divMatch = html.match(/<div\b([^>]*)>/i);
    const divAttrs = divMatch ? divMatch[1] : '';

    const columnsAttr = extractAttribute(divAttrs, 'data-columns');
    const columns = columnsAttr ? parseInt(columnsAttr, 10) : 3;

    const classAttr = extractAttribute(divAttrs, 'class') ?? '';
    const alignMatch = classAttr.match(/\balign(wide|full)\b/);
    const alignClass = alignMatch ? alignMatch[0] : '';

    return { columns, alignClass };
  });

  const columns = computed(() => blockAttrs.value.columns);
  const blockClass = computed(() => blockAttrs.value.alignClass);
  const activeColumns = ref(columns.value);

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
  const loadedVideoIndexes = ref(new Set<number>());
  let masonryInstance: Masonry | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let videoObserver: IntersectionObserver | null = null;
  let stopColumnsWatch: (() => void) | null = null;
  let layoutFrame = 0;
  let componentMounted = false;

  function getResponsiveColumns() {
    const requestedColumns = Math.max(1, columns.value);

    if (window.matchMedia('(max-width: 480px)').matches) {
      return 1;
    }

    if (window.matchMedia('(max-width: 768px)').matches) {
      return Math.min(requestedColumns, 2);
    }

    return requestedColumns;
  }

  function scheduleLayout() {
    if (layoutFrame) {
      cancelAnimationFrame(layoutFrame);
    }

    nextTick(() => {
      if (!componentMounted) return;

      layoutFrame = requestAnimationFrame(() => {
        layoutFrame = 0;
        masonryInstance?.reloadItems?.();
        masonryInstance?.layout?.();
      });
    });
  }

  function observeMasonryItems() {
    if (!galleryEl.value || !resizeObserver) return;

    galleryEl.value
      .querySelectorAll<HTMLElement>('.mega-gallery-item')
      .forEach((item) => resizeObserver?.observe(item));
  }

  function isVideoLoaded(index: number) {
    return loadedVideoIndexes.value.has(index);
  }

  function markVideoLoaded(index: number) {
    if (loadedVideoIndexes.value.has(index)) {
      return;
    }

    loadedVideoIndexes.value = new Set([...loadedVideoIndexes.value, index]);

    void nextTick(() => {
      const video = galleryEl.value?.querySelector<HTMLVideoElement>(
        `.mega-gallery-item[data-gallery-index="${index}"] video`,
      );

      video?.load();
      void video?.play().catch(() => {});
    });
  }

  function observeLazyVideos() {
    videoObserver?.disconnect();
    videoObserver = null;

    if (!galleryEl.value) {
      return;
    }

    const videoItems = Array.from(
      galleryEl.value.querySelectorAll<HTMLElement>(
        '.mega-gallery-item--video',
      ),
    );

    if (videoItems.length === 0) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      for (const videoItem of videoItems) {
        const index = Number(videoItem.dataset.galleryIndex);

        if (Number.isFinite(index)) {
          markVideoLoaded(index);
        }
      }

      return;
    }

    videoObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const videoItem = entry.target as HTMLElement;
          const index = Number(videoItem.dataset.galleryIndex);

          if (Number.isFinite(index)) {
            markVideoLoaded(index);
          }

          videoObserver?.unobserve(videoItem);
        }
      },
      {
        rootMargin: '700px 0px',
      },
    );

    for (const videoItem of videoItems) {
      videoObserver.observe(videoItem);
    }
  }

  function updateActiveColumns() {
    const nextColumns = getResponsiveColumns();

    if (activeColumns.value !== nextColumns) {
      activeColumns.value = nextColumns;
    }

    scheduleLayout();
  }

  onMounted(async () => {
    if (!galleryEl.value || galleryItems.value.length === 0) return;

    componentMounted = true;
    activeColumns.value = getResponsiveColumns();
    window.addEventListener('resize', updateActiveColumns);

    const { default: MasonryLib } = await import('masonry-layout');
    if (!componentMounted || !galleryEl.value) return;

    masonryInstance = new MasonryLib(galleryEl.value, {
      itemSelector: '.mega-gallery-item',
      columnWidth: '.mega-gallery-sizer',
      percentPosition: true,
      gutter: 12,
      transitionDuration: 0,
    });

    stopColumnsWatch = watch([columns, galleryItems], () => {
      updateActiveColumns();
      nextTick(() => {
        observeMasonryItems();
        observeLazyVideos();
      });
    });

    resizeObserver = new ResizeObserver(() => {
      scheduleLayout();
    });
    observeMasonryItems();
    observeLazyVideos();
    scheduleLayout();
  });

  onUnmounted(() => {
    componentMounted = false;
    window.removeEventListener('resize', updateActiveColumns);
    resizeObserver?.disconnect();
    videoObserver?.disconnect();
    stopColumnsWatch?.();

    if (layoutFrame) {
      cancelAnimationFrame(layoutFrame);
    }

    masonryInstance?.destroy?.();
    resizeObserver = null;
    videoObserver = null;
    stopColumnsWatch = null;
    layoutFrame = 0;
    masonryInstance = null;
  });

  function onMediaLoad() {
    scheduleLayout();
  }

  const { openSlides } = useImageLightbox();
  const eligibleImages = ref<Record<number, boolean>>({});
  const imageObservers = new Map<
    number,
    { image: HTMLImageElement; stop: () => void }
  >();

  function setThumbnail(element: unknown, index: number, item: ImageItem) {
    const current = imageObservers.get(index);
    if (current?.image === element) return;
    current?.stop();
    imageObservers.delete(index);
    if (!(element instanceof HTMLImageElement) || item.href) return;
    const stop = observeLightboxEligibility(
      element,
      item.fullSrc,
      (eligible) => {
        eligibleImages.value[index] = eligible;
      },
    );
    imageObservers.set(index, { image: element, stop });
  }
  onBeforeUnmount(() => {
    for (const entry of imageObservers.values()) entry.stop();
  });

  function imageWrapper(item: ImageItem, index: number) {
    if (item.href) return 'a';
    return eligibleImages.value[index] ? 'button' : 'div';
  }

  async function openLightbox(item: GalleryItem) {
    const lightboxItems = galleryItems.value.filter(
      (entry) => entry.type === 'video' || !entry.href,
    );
    const index = lightboxItems.indexOf(item);
    const originalIndex = galleryItems.value.indexOf(item);
    if (
      index < 0 ||
      (item.type === 'image' && !eligibleImages.value[originalIndex])
    )
      return;
    const slides: MediaLightboxSlide[] = lightboxItems.map((entry) => {
      if (entry.type === 'image')
        return {
          src: entry.fullSrc,
          msrc: entry.thumbSrc,
          alt: entry.alt,
          caption: entry.caption,
          getThumbnail: () =>
            imageObservers.get(galleryItems.value.indexOf(entry))?.image,
        };
      const video = document.createElement('video');
      video.className = 'pswp-video';
      video.src = entry.videoSrc;
      if (entry.poster) video.poster = entry.poster;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      return {
        html: `<div class="pswp-video-wrap">${video.outerHTML}</div>`,
      };
    });
    await openSlides(slides, index);
  }
</script>

<template>
  <div
    class="mega-gallery-block"
    :class="blockClass"
    :style="{ '--gallery-columns': activeColumns }"
  >
    <div ref="galleryEl" class="mega-gallery-grid">
      <div class="mega-gallery-sizer" aria-hidden="true"></div>
      <div
        v-for="(item, i) in galleryItems"
        :key="i"
        class="mega-gallery-item"
        :class="`mega-gallery-item--${item.type}`"
        :data-gallery-index="i"
      >
        <component
          :is="imageWrapper(item, i)"
          v-if="item.type === 'image'"
          class="mega-gallery-trigger"
          :href="item.href"
          :class="{ 'has-lightbox': eligibleImages[i] }"
          :type="eligibleImages[i] ? 'button' : undefined"
          :aria-label="
            eligibleImages[i]
              ? item.alt
                ? `View: ${item.alt}`
                : 'View image fullsize'
              : undefined
          "
          @click="openLightbox(item)"
        >
          <img
            :ref="(element) => setThumbnail(element, i, item)"
            :src="item.thumbSrc"
            :srcset="item.thumbSrcSet || undefined"
            :sizes="item.thumbSizes || undefined"
            :alt="item.alt"
            :width="item.width"
            :height="item.height"
            loading="lazy"
            decoding="async"
            @load="onMediaLoad"
          />
          <figcaption v-if="item.caption" class="mega-gallery-caption">
            {{ item.caption }}
          </figcaption>
        </component>

        <button
          v-else
          class="mega-gallery-trigger"
          type="button"
          aria-label="View video fullscreen"
          @click="openLightbox(item)"
        >
          <video
            class="mega-gallery-video"
            :autoplay="isVideoLoaded(i)"
            loop
            muted
            playsinline
            preload="metadata"
            :poster="item.poster || undefined"
            @loadeddata="onMediaLoad"
            @loadedmetadata="onMediaLoad"
          >
            <source
              v-if="isVideoLoaded(i)"
              :src="item.videoSrc"
              type="video/mp4"
            />
          </video>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .mega-gallery-block {
    margin-bottom: var(--space-7);
    @include underlap-matte;

    @include width-alignment(default);

    @include width-alignment(wide) {
      grid-column: wide;
    }

    @include width-alignment(full) {
      grid-column: full;
    }

    @include breakpoint(phone) {
      &.alignfull {
        // Item shadows extend 0.35rem right; give them room so they don't
        // reach the viewport edge and create a horizontal scrollbar.
        padding-inline: var(--space-2);
      }
    }
  }

  .mega-gallery-grid {
    position: relative;
    width: 100%;
  }

  .mega-gallery-sizer,
  .mega-gallery-item {
    width: calc(
      100% / var(--gallery-columns, 3) -
        (12px * (var(--gallery-columns, 3) - 1) / var(--gallery-columns, 3))
    );
  }

  .mega-gallery-item {
    margin-bottom: 12px;
  }

  .mega-gallery-trigger {
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 0;
    border: var(--border-window);
    background: var(--color-surface);
    box-shadow: var(--shadow-hard-low);
    cursor: inherit;

    &.has-lightbox,
    &:is(button) {
      cursor: zoom-in;
    }
    line-height: 0;

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
    background: var(--color-ink);
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
