<script setup lang="ts">
  import type { WordPressCaseStudy, WordPressPost } from '~/types/wordpress';

  withDefaults(
    defineProps<{
      title: string;
      kind: 'case-studies' | 'writing';
      sectionId?: string;
      items?: WordPressCaseStudy[] | WordPressPost[] | null;
      error?: boolean;
      errorMessage: string;
      emptyMessage: string;
    }>(),
    {
      sectionId: undefined,
      items: null,
      error: false,
    },
  );

  const { prefetchInitialArchivePage } = useWritingArchive();
</script>

<template>
  <section
    :id="sectionId"
    class="home-content-section"
    :class="{
      'case-studies': kind === 'case-studies',
      writing: kind === 'writing',
    }"
  >
    <div
      v-if="kind === 'case-studies'"
      class="section-label selected-work-heading"
    >
      <p class="kicker">Filed under</p>
      <div class="label-rail">
        <h2 class="title">{{ title }}</h2>
      </div>
    </div>

    <div v-else class="section-label latest-writing-heading">
      <p class="kicker">Filed under</p>
      <div class="label-rail">
        <h2 class="title">{{ title }}</h2>
      </div>
    </div>

    <EmptyState v-if="error" :message="errorMessage" />

    <CaseStudyList
      v-else-if="kind === 'case-studies' && items?.length"
      :case-studies="items as WordPressCaseStudy[]"
    />

    <template v-else-if="items?.length">
      <PostList :posts="items as WordPressPost[]" />

      <NuxtLink
        v-if="kind === 'writing'"
        class="more-link"
        to="/writing"
        @focus="prefetchInitialArchivePage"
        @pointerdown="prefetchInitialArchivePage"
        @pointerenter="prefetchInitialArchivePage"
      >
        Read More
      </NuxtLink>
    </template>

    <EmptyState v-else :message="emptyMessage" />
  </section>
</template>

<style lang="scss" scoped>
  .home-content-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding: var(--space-8) 0;
  }

  .home-content-section::before {
    content: '';
    display: block;
    width: 3rem;
    height: 1px;
    margin-bottom: var(--space-7);
    background: var(--color-ink-30);
  }

  .case-studies {
    margin-inline: calc(var(--space-6) * -1);
  }

  .case-studies .selected-work-heading {
    margin-inline: var(--space-6);
  }

  .selected-work-heading {
    text-align: right;
  }

  .writing {
    margin-inline: calc(var(--space-6) * -1);
  }

  .writing .latest-writing-heading {
    margin-inline: var(--space-6);
  }

  .writing :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .section-label {
    position: relative;
    margin-bottom: var(--space-7);
  }

  .latest-writing-heading {
    text-align: left;
  }

  .section-label .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-muted);
    font-size: var(--type-small);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1;
  }

  .section-label .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 1em;
    line-height: inherit;
    letter-spacing: -0.075em;
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    color: var(--color-primary);
    font-size: var(--type-large);
    font-style: italic;
    text-decoration: none;
    background-image: linear-gradient(
      var(--color-primary),
      var(--color-primary)
    );
    background-position: 0% 100%;
    background-repeat: no-repeat;
    background-size: 0% 1px;
    transition: background-size 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    background-size: 100% 1px;
  }

  @include breakpoint(phone) {
    .case-studies {
      margin-inline: calc(var(--space-4) * -1);
    }

    .writing {
      margin-inline: calc(var(--space-4) * -1);
    }

    .case-studies::before,
    .case-studies .selected-work-heading,
    .writing::before,
    .writing .latest-writing-heading {
      margin-inline: var(--space-4);
    }

    .section-label .title {
      font-size: 1em;
    }

    .label-rail {
      font-size: clamp(3rem, 18vw, 5rem);
    }
  }
</style>
