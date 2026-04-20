<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractAnchors } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const fileLinks = computed(() => extractAnchors(props.block.renderedHtml));
  const primaryLink = computed(() => fileLinks.value[0] ?? null);
  const downloadLink = computed(() => fileLinks.value[1] ?? null);
</script>

<template>
  <div v-if="primaryLink" class="file-block">
    <a
      class="file-link"
      :href="primaryLink.href"
      :target="primaryLink.target || undefined"
      :rel="primaryLink.rel || undefined"
      :download="primaryLink.download || undefined"
      v-html="primaryLink.innerHtml"
    />

    <a
      v-if="downloadLink"
      class="button outline download-link"
      :href="downloadLink.href"
      :target="downloadLink.target || undefined"
      :rel="downloadLink.rel || undefined"
      :download="downloadLink.download || undefined"
      v-html="downloadLink.innerHtml"
    />
  </div>
</template>
