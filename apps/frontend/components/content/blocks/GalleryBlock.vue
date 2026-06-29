<script setup lang="ts">
  import {
    extractAttribute,
    extractFirstImage,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';
  import ImageBlock from './ImageBlock.vue';
  import type { GutenbergBlock } from '~/types/wordpress';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  interface GalleryImageItem {
    block: GutenbergBlock;
    aspectRatio: number;
  }

  interface GalleryRowItem {
    block: GutenbergBlock;
    isWideLandscape: boolean;
    width: number | null;
  }

  interface GalleryRow {
    items: GalleryRowItem[];
    columnCount: number;
    cropAspectRatio: string;
    isCropped: boolean;
    isJustified: boolean;
    mobileColumnCount: number;
  }

  interface GallerySettings {
    columns: number;
    cropAspectRatio: string;
    isCropped: boolean;
  }

  const phoneBreakpoint = 767;
  const targetRowHeight = 220;
  const wideLandscapeRatio = 1.65;

  const galleryEl = ref<HTMLElement | null>(null);
  const galleryWidth = ref(0);
  const galleryGap = ref(12);
  const naturalAspectRatios = ref<Record<string, number>>({});
  let resizeObserver: ResizeObserver | null = null;
  let imageLoadAbortController: AbortController | null = null;

  const galleryClass = computed(() =>
    removeWordPressFrontendClasses(
      getGalleryClassNames(props.block.renderedHtml),
    ),
  );
  const galleryAlignmentClass = computed(() =>
    getGalleryAlignmentClass(galleryClass.value, props.block.attributes),
  );
  const gallerySettings = computed<GallerySettings>(() =>
    getGallerySettings(galleryClass.value, props.block.attributes),
  );
  const galleryCaptionHtml = computed(() =>
    extractGalleryCaptionHtml(props.block.renderedHtml),
  );
  const galleryImages = computed(() =>
    props.allBlocks.filter(
      (childBlock) => childBlock.parentClientId === props.block.clientId,
    ),
  );
  const galleryItems = computed<GalleryImageItem[]>(() =>
    galleryImages.value.map((block) => ({
      block,
      aspectRatio: getImageAspectRatio(block),
    })),
  );
  const galleryRows = computed<GalleryRow[]>(() =>
    getGalleryRows(
      galleryItems.value,
      galleryWidth.value,
      galleryGap.value,
      gallerySettings.value,
    ),
  );

  function getGallerySettings(
    className: string,
    attributes: Record<string, unknown> | undefined,
  ) {
    const attributeColumns =
      typeof attributes?.columns === 'number' ? attributes.columns : null;
    const classColumns = Number.parseInt(
      className.match(/\bcolumns-(\d+)\b/)?.[1] ?? '',
      10,
    );
    const columns = clampColumns(
      attributeColumns ?? (Number.isFinite(classColumns) ? classColumns : 3),
    );
    const isCropped =
      typeof attributes?.imageCrop === 'boolean'
        ? attributes.imageCrop
        : className.split(/\s+/).includes('is-cropped');
    const aspectRatio =
      typeof attributes?.aspectRatio === 'string'
        ? attributes.aspectRatio
        : '';

    return {
      columns,
      isCropped,
      cropAspectRatio: getCssAspectRatio(aspectRatio),
    };
  }

  function getGalleryAlignmentClass(
    className: string,
    attributes: Record<string, unknown> | undefined,
  ) {
    if (/\balign(?:wide|full|left|right|center)\b/.test(className)) {
      return '';
    }

    const alignment = getGalleryAlignment(attributes);
    const supportedAlignments = ['wide', 'full', 'left', 'right', 'center'];

    if (!supportedAlignments.includes(alignment)) {
      return '';
    }

    return `align${alignment}`;
  }

  function getGalleryClassNames(html: string | null | undefined) {
    if (!html) {
      return '';
    }

    const classes = Array.from(html.matchAll(/\bclass=(["'])(.*?)\1/gi))
      .flatMap((match) => (match[2] ?? '').split(/\s+/))
      .filter((className) => {
        if (!className) {
          return false;
        }

        return (
          className.startsWith('align') ||
          className.startsWith('columns-') ||
          className === 'is-cropped' ||
          className === 'has-nested-images'
        );
      });

    return classes.join(' ');
  }

  function getGalleryAlignment(
    attributes: Record<string, unknown> | undefined,
  ) {
    const candidates = [
      attributes?.align,
      attributes?.alignment,
      attributes?.alignWide,
      getNestedAttribute(attributes?.layout, 'align'),
      getNestedAttribute(attributes?.style, 'align'),
    ];
    const alignment = candidates.find(
      (candidate): candidate is string => typeof candidate === 'string',
    );

    return alignment?.toLowerCase() ?? '';
  }

  function getNestedAttribute(value: unknown, key: string) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    return (value as Record<string, unknown>)[key];
  }

  function clampColumns(value: number) {
    if (!Number.isFinite(value)) {
      return 3;
    }

    return Math.min(Math.max(Math.round(value), 1), 6);
  }

  function getCssAspectRatio(value: string) {
    if (!value || value === 'original') {
      return '1 / 1';
    }

    if (/^\d+(\.\d+)?$/.test(value)) {
      return value;
    }

    if (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(value)) {
      return value;
    }

    return '1 / 1';
  }

  function extractGalleryCaptionHtml(html: string | null | undefined) {
    if (!html) {
      return '';
    }

    const captions = Array.from(
      html.matchAll(/<figcaption\b([^>]*)>([\s\S]*?)<\/figcaption>/gi),
    );
    const galleryCaption = captions.find((match) => {
      const className = extractAttribute(match[1] ?? '', 'class');

      return className.split(/\s+/).includes('blocks-gallery-caption');
    });

    return galleryCaption?.[2]?.trim() ?? '';
  }

  function getImageAspectRatio(block: GutenbergBlock) {
    const naturalAspectRatio = naturalAspectRatios.value[block.clientId];

    if (naturalAspectRatio) {
      return naturalAspectRatio;
    }

    const image = extractFirstImage(block.renderedHtml);
    const width = Number.parseInt(
      extractAttribute(image?.attributes, 'width'),
      10,
    );
    const height = Number.parseInt(
      extractAttribute(image?.attributes, 'height'),
      10,
    );

    if (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
    ) {
      return width / height;
    }

    return 4 / 3;
  }

  function getTargetHeight(width: number) {
    if (width < 520) {
      return 150;
    }

    if (width < 800) {
      return 180;
    }

    return targetRowHeight;
  }

  function getGalleryRows(
    items: GalleryImageItem[],
    width: number,
    gap: number,
    settings: GallerySettings,
  ) {
    if (items.length === 0) {
      return [];
    }

    if (width <= 0) {
      return [
        {
          items: items.map((item) => ({
            block: item.block,
            isWideLandscape: isWideLandscape(item),
            width: null,
          })),
          columnCount: Math.min(settings.columns, items.length),
          cropAspectRatio: settings.cropAspectRatio,
          isCropped: settings.isCropped,
          isJustified: false,
          mobileColumnCount: getMobileColumnCount(settings.columns, items.length),
        },
      ];
    }

    const rows: GalleryRow[] = [];
    const columnCount = getColumnCount(settings.columns, items.length, width);

    for (let start = 0; start < items.length; start += columnCount) {
      const rowItems = items.slice(start, start + columnCount);

      if (settings.isCropped) {
        rows.push(getCroppedRow(rowItems, settings));
      } else if (rowItems.length > 1) {
        rows.push(getJustifiedRow(rowItems, width, gap, settings));
      } else {
        rows.push(getLooseRow(rowItems, getTargetHeight(width), settings));
      }
    }

    return rows;
  }

  function getColumnCount(columns: number, itemCount: number, width: number) {
    const maximumColumns = width <= phoneBreakpoint ? 3 : columns;

    return Math.min(columns, itemCount, maximumColumns);
  }

  function getMobileColumnCount(columns: number, itemCount: number) {
    return Math.min(columns, itemCount, 3);
  }

  function isWideLandscape(item: GalleryImageItem) {
    return item.aspectRatio >= wideLandscapeRatio;
  }

  function getCroppedRow(
    items: GalleryImageItem[],
    settings: GallerySettings,
  ): GalleryRow {
    return {
      columnCount: items.length,
      cropAspectRatio: settings.cropAspectRatio,
      isCropped: true,
      isJustified: false,
      mobileColumnCount: getMobileColumnCount(settings.columns, items.length),
      items: items.map((item) => ({
        block: item.block,
        isWideLandscape: isWideLandscape(item),
        width: null,
      })),
    };
  }

  function getJustifiedRow(
    items: GalleryImageItem[],
    width: number,
    gap: number,
    settings: GallerySettings,
  ): GalleryRow {
    const rowAspect = items.reduce((sum, item) => sum + item.aspectRatio, 0);
    const availableWidth = width - gap * Math.max(items.length - 1, 0);
    const rowHeight = availableWidth / rowAspect;

    return {
      columnCount: items.length,
      cropAspectRatio: settings.cropAspectRatio,
      isCropped: false,
      isJustified: true,
      mobileColumnCount: getMobileColumnCount(settings.columns, items.length),
      items: items.map((item) => ({
        block: item.block,
        isWideLandscape: isWideLandscape(item),
        width: Math.max(0, item.aspectRatio * rowHeight),
      })),
    };
  }

  function getLooseRow(
    items: GalleryImageItem[],
    rowHeight: number,
    settings: GallerySettings,
  ): GalleryRow {
    return {
      columnCount: items.length,
      cropAspectRatio: settings.cropAspectRatio,
      isCropped: false,
      isJustified: false,
      mobileColumnCount: getMobileColumnCount(settings.columns, items.length),
      items: items.map((item) => ({
        block: item.block,
        isWideLandscape: isWideLandscape(item),
        width: Math.max(0, item.aspectRatio * rowHeight),
      })),
    };
  }

  function updateGalleryMetrics() {
    if (!galleryEl.value) {
      return;
    }

    const styles = window.getComputedStyle(galleryEl.value);
    const columnGap = Number.parseFloat(styles.columnGap || styles.gap);

    galleryGap.value = Number.isFinite(columnGap) ? columnGap : 12;
    galleryWidth.value = galleryEl.value.clientWidth;
  }

  function updateNaturalAspectRatios() {
    if (!galleryEl.value) {
      return;
    }

    const nextAspectRatios = { ...naturalAspectRatios.value };
    let didChange = false;

    galleryEl.value
      .querySelectorAll<HTMLElement>('.gallery-item')
      .forEach((item) => {
        const clientId = item.dataset.galleryClientId;
        const image = item.querySelector<HTMLImageElement>('img');

        if (
          !clientId ||
          !image ||
          image.naturalWidth <= 0 ||
          image.naturalHeight <= 0
        ) {
          return;
        }

        const aspectRatio = image.naturalWidth / image.naturalHeight;

        if (nextAspectRatios[clientId] !== aspectRatio) {
          nextAspectRatios[clientId] = aspectRatio;
          didChange = true;
        }
      });

    if (didChange) {
      naturalAspectRatios.value = nextAspectRatios;
    }
  }

  function observeImageLoads() {
    imageLoadAbortController?.abort();
    imageLoadAbortController = new AbortController();

    galleryEl.value
      ?.querySelectorAll<HTMLImageElement>('.gallery-item img')
      .forEach((image) => {
        if (image.complete) {
          return;
        }

        image.addEventListener('load', updateNaturalAspectRatios, {
          once: true,
          signal: imageLoadAbortController?.signal,
        });
      });
  }

  onMounted(() => {
    void nextTick(() => {
      updateGalleryMetrics();
      updateNaturalAspectRatios();
      observeImageLoads();
    });

    if (!galleryEl.value) {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      updateGalleryMetrics();
    });
    resizeObserver.observe(galleryEl.value);
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
    imageLoadAbortController?.abort();
    resizeObserver = null;
    imageLoadAbortController = null;
  });
</script>

<template>
  <figure
    ref="galleryEl"
    class="gallery-block"
    :class="[
      galleryClass,
      galleryAlignmentClass,
      {
        'is-cropped': gallerySettings.isCropped,
        'is-preserve-ratio': !gallerySettings.isCropped,
      },
    ]"
  >
    <div
      v-for="(row, rowIndex) in galleryRows"
      :key="rowIndex"
      class="gallery-row"
      :class="{
        'is-cropped': row.isCropped,
        'is-justified': row.isJustified,
      }"
      :style="{
        '--gallery-row-count': row.columnCount,
        '--gallery-mobile-row-count': row.mobileColumnCount,
        '--gallery-crop-aspect-ratio': row.cropAspectRatio,
      }"
    >
      <div
        v-for="item in row.items"
        :key="item.block.clientId"
        class="gallery-item"
        :class="{ 'is-wide-landscape': item.isWideLandscape }"
        :data-gallery-client-id="item.block.clientId"
        :style="
          item.width
            ? { '--gallery-item-width': `${item.width}px` }
            : undefined
        "
      >
        <ImageBlock :block="item.block" />
      </div>
    </div>
    <figcaption
      v-if="galleryCaptionHtml"
      class="gallery-caption"
      v-html="galleryCaptionHtml"
    />
  </figure>
</template>

<style scoped lang="scss">
  .gallery-block {
    @include gallery-block;
  }
</style>
