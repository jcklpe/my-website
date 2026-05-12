<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { addContentMediaDefaultsToHtml } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const isDevelopment = import.meta.dev;
  const fallbackHtml = computed(() =>
    addContentMediaDefaultsToHtml(props.block.renderedHtml ?? ''),
  );
</script>

<template>
  <section class="unsupported-block">
    <p v-if="isDevelopment" class="notice">
      Unsupported block: <code>{{ props.block.name }}</code>
    </p>
    <div
      v-if="fallbackHtml"
      class="fallback-html"
      :data-block-name="props.block.name"
      v-html="fallbackHtml"
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
    background: var(--color-surface-soft);
    color: var(--color-muted);
    font-size: var(--type-small);
  }

  .notice code {
    color: var(--color-ink);
    font-family: var(--font-mono);
  }
</style>
