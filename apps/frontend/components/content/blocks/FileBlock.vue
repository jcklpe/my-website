<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAnchors,
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
    stripHtmlToText,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const root = computed(() => extractRootElement(props.block.renderedHtml, 'div'));
  const rootClass = computed(() =>
    removeWordPressFrontendClasses(extractAttribute(root.value?.attributes, 'class')),
  );
  const fileLinks = computed(() => extractAnchors(props.block.renderedHtml));
  const primaryLink = computed(() => fileLinks.value[0] ?? null);
  const explicitDownloadLink = computed(() => fileLinks.value[1] ?? null);
  const downloadLink = computed(() =>
    explicitDownloadLink.value ?? primaryLink.value,
  );
  const fileTitle = computed(() =>
    stripHtmlToText(primaryLink.value?.innerHtml) || getFileName(primaryLink.value?.href),
  );
  const fileName = computed(() => {
    const resolvedFileName = getFileName(primaryLink.value?.href);

    return resolvedFileName && resolvedFileName !== fileTitle.value
      ? resolvedFileName
      : '';
  });
  const downloadLabel = computed(() =>
    stripHtmlToText(explicitDownloadLink.value?.innerHtml) || 'Download file',
  );

  function getFileName(href: string | undefined) {
    if (!href) {
      return '';
    }

    try {
      const url = new URL(href);
      const pathPart = url.pathname.split('/').filter(Boolean).at(-1) ?? '';

      return decodeURIComponent(pathPart);
    } catch {
      return href.split('/').filter(Boolean).at(-1) ?? '';
    }
  }
</script>

<template>
  <div v-if="primaryLink" class="file-block" :class="rootClass">
    <div class="file-meta">
      <p class="file-kicker">File download</p>
      <a
        class="file-link"
        :href="primaryLink.href"
        :target="primaryLink.target || undefined"
        :rel="primaryLink.rel || undefined"
        :download="primaryLink.download || undefined"
        v-html="primaryLink.innerHtml"
      />
      <p v-if="fileName" class="file-name">{{ fileName }}</p>
    </div>

    <a
      v-if="downloadLink"
      class="button outline download-link"
      :href="downloadLink.href"
      :target="downloadLink.target || undefined"
      :rel="downloadLink.rel || undefined"
      :download="downloadLink.download || undefined"
    >
      <span class="download-icon" aria-hidden="true">↓</span>
      <span>{{ downloadLabel }}</span>
    </a>
  </div>
</template>
