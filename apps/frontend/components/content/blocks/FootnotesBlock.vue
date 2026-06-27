<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractRootElement } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
  }>();

  const list = computed(() =>
    extractRootElement(props.block.renderedHtml, 'ol'),
  );
</script>

<template>
  <details v-if="list" class="footnotes-block">
    <summary class="footnotes-summary">
      <span class="footnotes-label">End Notes</span>
    </summary>
    <ol class="footnotes-list" v-html="list.innerHtml" />
  </details>
</template>

<style lang="scss" scoped>
  .footnotes-block {
    margin-top: var(--space-8);
    border-top: 1px solid var(--color-primary);

    @include content-flow-child {
      grid-column: content;
    }

    // Remove default marker — we style the summary ourselves.
    summary { list-style: none; }
    summary::-webkit-details-marker { display: none; }
  }

  .footnotes-summary {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-block: var(--space-4);
    cursor: pointer;
    user-select: none;

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 3px;
    }

    // Chevron indicator that flips open/closed.
    &::after {
      content: '›';
      color: var(--color-primary);
      font-size: 1.1em;
      line-height: 1;
      transition: transform 180ms var(--snappy-ease-out);
    }

    .footnotes-block[open] &::after {
      transform: rotate(90deg);
    }
  }

  .footnotes-label {
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .footnotes-list {
    margin: 0;
    padding-left: var(--space-5);
    padding-bottom: var(--space-5);
    font-size: var(--type-base);
    line-height: 1.55;
  }

  .footnotes-list :deep(li) {
    margin-bottom: var(--space-3);
    color: var(--color-ink-80);
  }

  .footnotes-list :deep(li:last-child) {
    margin-bottom: 0;
  }

  .footnotes-list :deep(a) {
    @include rich-link;
  }

  .footnotes-list :deep(a:hover),
  .footnotes-list :deep(a:focus-visible) {
    @include rich-link-hover;
  }

  // Back-link (↩︎) — de-emphasise relative to note content.
  // WP 6.5+ uses aria-label="Jump to footnote reference N"; older used href="#fnref-…".
  .footnotes-list :deep(a[aria-label^="Jump to footnote reference"]),
  .footnotes-list :deep(a[href^="#fnref-"]) {
    margin-left: 0.4em;
    font-size: 0.85em;
    opacity: 0.6;
    background-image: none;
  }

  .footnotes-list :deep(a[aria-label^="Jump to footnote reference"]:hover),
  .footnotes-list :deep(a[aria-label^="Jump to footnote reference"]:focus-visible),
  .footnotes-list :deep(a[href^="#fnref-"]:hover),
  .footnotes-list :deep(a[href^="#fnref-"]:focus-visible) {
    opacity: 1;
    background-image: none;
  }

  // Rich content in notes
  .footnotes-list :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin-block: var(--space-2);
  }
</style>
