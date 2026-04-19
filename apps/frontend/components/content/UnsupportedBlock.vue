<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';

  defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const isDevelopment = import.meta.dev;
</script>

<template>
  <section class="unsupported-block">
    <p v-if="isDevelopment" class="notice">
      Unsupported block: <code>{{ block.name }}</code>
    </p>
    <div
      v-if="block.renderedHtml"
      class="fallback-html"
      :data-block-name="block.name"
      v-html="block.renderedHtml"
    />
  </section>
</template>

<style lang="scss" scoped>
  .unsupported-block {
    margin-block: var(--space-5);
  }

  .notice {
    width: min(70ch, calc(100% - var(--space-6)));
    margin: 0 auto var(--space-3);
    padding: 0.65rem 0.8rem;
    border-left: 4px solid var(--color-primary);
    background: rgba(38, 87, 235, 0.08);
    color: var(--color-muted);
    font-size: var(--type-step--1);
  }

  .notice code {
    color: var(--color-ink);
    font-family: var(--font-mono);
  }
</style>
