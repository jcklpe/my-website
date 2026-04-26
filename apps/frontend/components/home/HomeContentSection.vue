<script setup lang="ts">
  import type { WordPressCaseStudy, WordPressPost } from '~/types/wordpress';

  withDefaults(
    defineProps<{
      title: string;
      kind: 'case-studies' | 'writing';
      items?: WordPressCaseStudy[] | WordPressPost[] | null;
      error?: boolean;
      errorMessage: string;
      emptyMessage: string;
    }>(),
    {
      items: null,
      error: false,
    },
  );
</script>

<template>
  <section
    class="home-content-section"
    :class="{
      'case-studies': kind === 'case-studies',
      writing: kind === 'writing',
    }"
  >
    <header class="section-header">
      <span class="section-num" aria-hidden="true">{{
        kind === 'case-studies' ? '01' : '02'
      }}</span>
      <h2 class="section-title">{{ title }}</h2>
      <div class="section-rule" aria-hidden="true"></div>
    </header>

    <EmptyState v-if="error" :message="errorMessage" />

    <CaseStudyList
      v-else-if="kind === 'case-studies' && items?.length"
      :case-studies="items as WordPressCaseStudy[]"
    />

    <PostList v-else-if="items?.length" :posts="items as WordPressPost[]" />

    <EmptyState v-else :message="emptyMessage" />
  </section>
</template>

<style lang="scss" scoped>
  .home-content-section {
    padding-block: var(--space-8) var(--space-7);
  }

  .case-studies {
    margin-inline: calc(var(--space-6) * -1);
    padding-inline: var(--space-6);
  }

  .writing {
    margin-inline: calc(var(--space-6) * -1);
    padding-inline: var(--space-6);
  }

  .section-header {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-7);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid rgba(12, 17, 43, 0.12);
  }

  .section-num {
    font-family: var(--font-mono);
    font-size: clamp(0.62rem, 1vw, 0.72rem);
    font-weight: 700;
    font-style: italic;
    letter-spacing: 0.1em;
    color: var(--color-amber);
    flex-shrink: 0;
  }

  .section-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: clamp(0.75rem, 1.1vw, 0.88rem);
    font-weight: 400;
    font-style: normal;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ink);
    white-space: nowrap;
  }

  .section-rule {
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(181, 104, 0, 0.4),
      rgba(181, 104, 0, 0.08) 40%,
      transparent
    );
  }

  @media (max-width: 720px) {
    .case-studies,
    .writing {
      margin-inline: calc(var(--space-4) * -1);
      padding-inline: var(--space-4);
    }
  }
</style>
