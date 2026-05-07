<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractClassNames } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  // <hr> is a void element — extractRootElement requires a closing tag and
  // returns null for void elements. Use extractClassNames to scan the raw HTML
  // for the class attribute instead. Filter to is-style-* only; wp-block-separator
  // must not appear on the rendered <hr>.
  const separatorClass = computed(() =>
    extractClassNames(props.block.renderedHtml).filter((cls) =>
      cls.startsWith('is-style-'),
    ),
  );
</script>

<template>
  <hr :class="separatorClass" />
</template>

<style lang="scss" scoped>
  hr {
    @include separator-root;
  }
</style>
