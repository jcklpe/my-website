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
    removeWordPressFrontendClasses(extractAttribute(heading.value?.attributes, 'class')),
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
  h2,
  h3,
  h4,
  h5,
  h6 {
    width: min(100%, var(--article-column-heading));
    max-width: none;
    margin-inline: auto;
  }

  h2 {
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-ink-30);
    line-height: 1.04;
  }

  h3 {
    line-height: 1.12;
  }

  h4 {
    font-size: clamp(1.35rem, 1.18rem + 0.9vw, 1.75rem);
    font-weight: 600;
    line-height: 1.22;
  }

  h5 {
    font-size: clamp(1.12rem, 1.02rem + 0.45vw, 1.35rem);
    font-weight: 600;
    line-height: 1.24;
  }

  h6 {
    font-size: clamp(1rem, 0.96rem + 0.12vw, 1.04rem);
    font-weight: 600;
    letter-spacing: 0.08em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  :is(h2, h3, h4, h5, h6).has-text-align-center {
    text-align: center;
  }

  :is(h2, h3, h4, h5, h6).has-text-align-right {
    text-align: right;
  }

  :is(h2, h3, h4, h5, h6).has-text-align-left {
    text-align: left;
  }
</style>
