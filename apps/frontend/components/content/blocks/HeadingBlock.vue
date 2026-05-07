<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const heading = computed(() => extractRootElement(props.block.renderedHtml));
  const headingClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(heading.value?.attributes, 'class'),
    ),
  );
  const safeLevel = computed(() => {
    const tagName = heading.value?.tagName ?? 'h2';

    return /^h[1-6]$/.test(tagName) ? tagName : 'h2';
  });
</script>

<template>
  <h1
    v-if="heading && safeLevel === 'h1'"
    :class="headingClass"
    v-html="heading.innerHtml"
  />
  <h2
    v-else-if="heading && safeLevel === 'h2'"
    :class="headingClass"
    v-html="heading.innerHtml"
  />
  <h3
    v-else-if="heading && safeLevel === 'h3'"
    :class="headingClass"
    v-html="heading.innerHtml"
  />
  <h4
    v-else-if="heading && safeLevel === 'h4'"
    :class="headingClass"
    v-html="heading.innerHtml"
  />
  <h5
    v-else-if="heading && safeLevel === 'h5'"
    :class="headingClass"
    v-html="heading.innerHtml"
  />
  <h6 v-else-if="heading" :class="headingClass" v-html="heading.innerHtml" />
</template>

<style lang="scss" scoped>
  h1 {
    @include heading-h1-block;
  }

  h2 {
    @include heading-h2-block;
  }

  h3 {
    @include heading-h3-block;
  }

  h4 {
    @include heading-h4-block;
  }

  h5 {
    @include heading-h5-block;
  }

  h6 {
    @include heading-h6-block;
  }
</style>
