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
    width: min(100%, 18rem);
    height: 0.35rem;
    margin-bottom: var(--space-7);
    background: var(--color-ink);
    box-shadow: 4rem 0 0 var(--color-primary);
  }

  .case-studies {
    margin-inline: calc(var(--space-6) * -1);
  }

  .case-studies::before,
  .case-studies .selected-work-heading {
    margin-inline: var(--space-6);
  }

  .case-studies::before {
    width: min(30rem, calc(100% - var(--space-6) * 2));
    margin-left: auto;
    background: var(--color-ink);
    box-shadow:
      -2.2rem 0 0 var(--color-ink),
      -5.4rem 0 0 var(--color-ink),
      -6.2rem 0 0 var(--color-paper-warm),
      -8.6rem 0 0 var(--color-ink),
      -13.2rem 0 0 var(--color-ink);
  }

  .selected-work-heading {
    text-align: right;
  }

  .writing {
    margin-inline: calc(var(--space-6) * -1);
  }

  .writing::before,
  .writing .latest-writing-heading {
    margin-inline: var(--space-6);
  }

  .writing::before {
    width: min(30rem, calc(100% - var(--space-6) * 2));
    background: var(--color-ink);
    box-shadow:
      2.2rem 0 0 var(--color-ink),
      5.4rem 0 0 var(--color-ink),
      6.2rem 0 0 var(--color-paper-warm),
      8.6rem 0 0 var(--color-ink),
      13.2rem 0 0 var(--color-ink);
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
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0;
    width: 100%;
    font-size: clamp(4rem, 10vw, 8.75rem);
    line-height: 0.9;
  }

  .latest-writing-heading .label-rail {
    justify-content: flex-start;
  }

  .chips {
    flex: 1 1 19rem;
    align-self: flex-start;
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
    gap: clamp(0.35rem, 1.1vw, 1rem);
    min-width: 5rem;
    height: 1.29em;
    transform: translateY(-0.2em);
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
    color: white;
    font-family: var(--font-serif);
    font-size: 1em;
    line-height: inherit;
    letter-spacing: -0.075em;
  }

  .section-label .title span {
    display: inline;
    background: var(--color-ink);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    box-shadow:
      -0.18em 0 0 var(--color-ink),
      0.12em 0 0 var(--color-ink);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    color: var(--color-ink);
    font-size: var(--type-step-1);
    font-style: italic;
    text-decoration-color: var(--color-primary);
    text-decoration-thickness: 0.16em;
    text-underline-offset: 0.18em;
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
