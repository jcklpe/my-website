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
        <span class="chips" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
        <h2 class="title">
          <span>{{ title }}</span>
        </h2>
      </div>
    </div>

    <div v-else class="section-label latest-writing-heading">
      <p class="kicker">Filed under</p>
      <div class="label-rail">
        <h2 class="title">
          <span>{{ title }}</span>
        </h2>
        <span class="chips" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>

    <EmptyState v-if="error" :message="errorMessage" />

    <CaseStudyList
      v-else-if="kind === 'case-studies' && items?.length"
      :case-studies="items as WordPressCaseStudy[]"
    />

    <template v-else-if="items?.length">
      <PostList :posts="items as WordPressPost[]" />

      <NuxtLink v-if="kind === 'writing'" class="more-link" to="/writing">
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
    font-size: var(--type-step--1);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1;
  }

  .latest-writing-heading .label-rail {
    justify-content: flex-start;
  }

  .chips {
    display: none;
  }

  .chips span {
    display: block;
    height: 100%;
    background: var(--color-ink);
  }

  .chips span:nth-child(1) {
    width: 0.18rem;
  }

  .chips span:nth-child(2) {
    width: 0.32rem;
  }

  .chips span:nth-child(3) {
    width: 0.64rem;
  }

  .chips span:nth-child(4) {
    width: 1rem;
  }

  .chips span:nth-child(5) {
    width: 1.65rem;
  }

  .chips span:nth-child(6) {
    width: 2.7rem;
  }

  .chips span:nth-child(7) {
    width: 4.6rem;
  }

  .chips span:nth-child(8) {
    width: 7.2rem;
  }

  .chips span:nth-child(9) {
    width: 11rem;
  }

  .latest-writing-heading .chips {
    justify-content: flex-start;
  }

  .latest-writing-heading .chips span:nth-child(1) {
    width: 11rem;
  }

  .latest-writing-heading .chips span:nth-child(2) {
    width: 7.2rem;
  }

  .latest-writing-heading .chips span:nth-child(3) {
    width: 4.6rem;
  }

  .latest-writing-heading .chips span:nth-child(4) {
    width: 2.7rem;
  }

  .latest-writing-heading .chips span:nth-child(5) {
    width: 1.65rem;
  }

  .latest-writing-heading .chips span:nth-child(6) {
    width: 1rem;
  }

  .latest-writing-heading .chips span:nth-child(7) {
    width: 0.64rem;
  }

  .latest-writing-heading .chips span:nth-child(8) {
    width: 0.32rem;
  }

  .latest-writing-heading .chips span:nth-child(9) {
    width: 0.18rem;
  }

  .section-label .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-serif);
    font-size: 1em;
    line-height: inherit;
    letter-spacing: -0.075em;
  }

  .section-label .title span {
    display: inline;
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    color: var(--color-primary);
    font-size: var(--type-step-3);
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

  @media (max-width: 720px) {
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

    .chips {
      flex-basis: 5rem;
      min-width: 3rem;
      gap: 0.35rem;
    }

    .chips span:nth-child(n + 5) {
      display: none;
    }

    .chips span:nth-child(1) {
      width: 0.16rem;
    }

    .chips span:nth-child(2) {
      width: 0.5rem;
    }

    .chips span:nth-child(3) {
      width: 1.3rem;
    }

    .chips span:nth-child(4) {
      width: 4.4rem;
    }

    .latest-writing-heading .chips span:nth-child(1) {
      width: 4.4rem;
    }

    .latest-writing-heading .chips span:nth-child(2) {
      width: 1.3rem;
    }

    .latest-writing-heading .chips span:nth-child(3) {
      width: 0.5rem;
    }

    .latest-writing-heading .chips span:nth-child(4) {
      width: 0.16rem;
    }
  }
</style>
