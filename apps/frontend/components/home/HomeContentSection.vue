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
    :class="`home-content-section--${kind}`"
  >
    <div class="home-content-section__heading">
      <SectionHeading :title="title" />
    </div>

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
    position: relative;
    padding: var(--space-8) 0;
  }

  .home-content-section::before {
    content: '';
    display: block;
    width: min(100%, 18rem);
    height: 0.35rem;
    margin-bottom: var(--space-7);
    background: var(--color-poster-black);
    box-shadow: 4rem 0 0 var(--color-primary);
  }

  .home-content-section--case-studies {
    margin-inline: calc(var(--space-6) * -1);
  }

  .home-content-section--case-studies::before,
  .home-content-section--case-studies .home-content-section__heading {
    margin-inline: var(--space-6);
  }

  @media (max-width: 720px) {
    .home-content-section--case-studies {
      margin-inline: calc(var(--space-4) * -1);
    }

    .home-content-section--case-studies::before,
    .home-content-section--case-studies .home-content-section__heading {
      margin-inline: var(--space-4);
    }
  }
</style>
