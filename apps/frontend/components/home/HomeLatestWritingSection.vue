<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  withDefaults(
    defineProps<{
      posts?: WordPressPost[] | null;
      error?: boolean;
    }>(),
    {
      posts: null,
      error: false,
    },
  );

  const { prefetchInitialArchivePage } = useWritingArchive();

  const bentoGridEl = ref<HTMLElement | null>(null);

  // Gap-free 11-item period, mathematically verified for 5 columns.
  // Only combinations that sum to exactly 5 cols per row group are used,
  // so BentoGrid never needs to generate invisible filler cells.
  //
  // Row group layout (BentoGrid places top-left first):
  //   Rows 1-2: [1x1][1x2][3x2] + [1x1 fills col-1 gap]  → 1+1+3 = 5 ✓
  //   Row 3:    [3x1][2x1]                                 → 3+2 = 5 ✓
  //   Rows 4-5: [3x2][2x2]                                 → 3+2 = 5 ✓
  //   Row 6:    [2x1][1x1][2x1]                            → 2+1+2 = 5 ✓
  //
  // Stagger: the 3|2 col split alternates sides each group, so no horizontal
  // or vertical line runs continuously edge-to-edge.
  //
  // Compact (1-tall: 1x1, 2x1, 3x1) → horizontal image-left layout.
  // Image-led (2-tall: 1x2, 3x2, 2x2) → vertical layout.
  //
  // aspectRatio breakpoints prevent 2-row cards from being too tall at wide
  // viewports. BentoGrid measures the target element's clientWidth (incl. padding)
  // against these min-width thresholds.
  const BENTO_PATTERN = ['1x1', '1x2', '3x2', '1x1', '3x1', '2x1', '3x2', '2x2', '2x1', '1x1', '2x1'];
  const COMPACT_SIZES = new Set(['1x1', '2x1', '3x1']);

  function getBentoSize(index: number): string {
    return BENTO_PATTERN[index % BENTO_PATTERN.length];
  }

  function isCompact(size: string): boolean {
    return COMPACT_SIZES.has(size);
  }

  onMounted(async () => {
    if (!bentoGridEl.value) return;
    const { default: BentoGrid } = await import('@bentogrid/core');
    if (!bentoGridEl.value) return;
    new BentoGrid({
      target: bentoGridEl.value,
      columns: 1,
      cellGap: 12,
      aspectRatio: 2.5,
      breakpoints: {
        // 768–1399px container: 5 cols, cells ~106px tall → 2-row card ~225px
        768: { columns: 5, cellGap: 14, aspectRatio: 1.5 },
        // ≥1400px container: taller columns → keep 2-row cards under ~30vh
        1400: { columns: 5, cellGap: 14, aspectRatio: 3 },
      },
    });
  });
</script>

<template>
  <section id="latest-writing" class="latest-writing-section">
    <div class="section-label">
      <h2 class="section-title">Latest writing</h2>
    </div>

    <EmptyState v-if="error" message="Error: Posts could not be loaded." />

    <template v-else-if="posts?.length">
      <ul ref="bentoGridEl" class="bento-grid">
        <li
          v-for="(post, index) in posts"
          :key="post.id"
          class="bento-item"
          :class="{ 'bento-item--compact': isCompact(getBentoSize(index)) }"
          :data-bento="getBentoSize(index)"
        >
          <PostCard :post="post" />
        </li>
      </ul>

      <NuxtLink
        class="more-link"
        to="/writing"
        @focus="prefetchInitialArchivePage"
        @pointerdown="prefetchInitialArchivePage"
        @pointerenter="prefetchInitialArchivePage"
      >
        All writing →
      </NuxtLink>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding-bottom: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
    border-top: 1px solid var(--color-ink);
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-6) var(--space-6);

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-ink);
      opacity: 0.15;
    }
  }

  .section-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .bento-grid {
    padding-inline: var(--space-6);
    margin: 0;
    list-style: none;
  }

  // min-width: 0 is critical — without it, grid items use min-width: auto
  // which lets card content inflate individual column tracks, making the 5
  // columns unequal widths (observed: 371, 154, 355, 371, 355px).
  .bento-item {
    display: flex;
    min-height: 0;
    min-width: 0;
  }

  .bento-item :deep(.post-card) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }

  .bento-item :deep(.link) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }

  // Image-led cells: image fills the space above the text body
  .bento-item :deep(.featured-media-frame) {
    flex: 1;
    min-height: 0;
    aspect-ratio: auto;
  }

  .bento-item :deep(.body) {
    flex-shrink: 0;
  }

  // Compact cells (1x1, 2x1, 3x1): flip to horizontal — image left, text right
  .bento-item--compact :deep(.link) {
    flex-direction: row;
  }

  .bento-item--compact :deep(.featured-media-frame) {
    flex: none;
    width: 40%;
    align-self: stretch;
  }

  .bento-item--compact :deep(.body) {
    flex: 1;
    min-width: 0;
    padding: var(--space-3) var(--space-4);
    overflow: hidden;
  }

  // Excerpt doesn't fit in the compact horizontal layout
  .bento-item--compact :deep(.excerpt) {
    display: none;
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-5);
    margin-inline: var(--space-6);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 160ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    color: var(--color-ink);
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-label {
      padding-inline: var(--space-4);
    }

    .bento-grid {
      padding-inline: var(--space-4);
    }

    .more-link {
      margin-inline: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
