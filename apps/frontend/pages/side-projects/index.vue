<script setup lang="ts">
  import type { WordPressPage } from '~/types/wordpress';

  const {
    data: page,
    error,
    status,
  } = await useAsyncData<WordPressPage | null>('side-projects-page', () =>
    queryWordPressPageByUri('/side-projects'),
  );

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );
  const pageBlocks = computed(() => page.value?.blocks ?? []);
  const seoDescription = computed(
    () =>
      page.value?.seoDescription ||
      'Experiments, prototypes, and smaller builds.',
  );

  useSiteSeoMeta({
    title: 'Side Projects',
    description: () => seoDescription.value,
  });
</script>

<template>
  <article v-if="page" class="side-projects-page">
    <header class="section-heading">
      <p class="kicker">Filed under</p>
      <h1 class="title">Side Projects</h1>
    </header>

    <BlockRenderer v-if="pageBlocks.length" class="body" :blocks="pageBlocks" />
    <p v-else class="body empty">
      Side projects content is ready to be authored in WordPress.
    </p>
  </article>

  <section v-else class="side-projects-page-state" aria-live="polite">
    <p class="eyebrow">
      {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
    </p>
    <h1>
      {{
        isLoading
          ? 'Loading side projects...'
          : error
            ? 'Unable to load side projects page.'
            : 'Side projects page not found.'
      }}
    </h1>
    <p class="excerpt">
      {{
        isLoading
          ? 'Fetching the Side Projects page from WordPress.'
          : error
            ? 'The CMS request failed. Try refreshing, or check whether WordPress is running.'
            : 'No published WordPress page exists at /side-projects.'
      }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
  .side-projects-page {
    min-height: 55vh;
    padding: var(--space-8) 0 var(--space-9);
    background: var(--color-paper);
    color: var(--color-ink);
  }

  .section-heading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-5);
    align-items: end;
    max-width: min(74rem, calc(100% - var(--space-6)));
    margin: 0 auto var(--space-6);
    padding: 0 0 var(--space-5);
    border-bottom: 2px solid var(--color-ink);
  }

  .kicker {
    grid-column: 1 / -1;
    width: fit-content;
    margin: 0;
    padding: 0.35rem 0.55rem;
    border: 2px solid var(--color-ink);
    background: var(--color-signal-blue);
    color: var(--color-paper);
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
    box-shadow: 0.25rem 0.25rem 0 var(--color-ink);
  }

  .title {
    max-width: 10ch;
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(5rem, 15vw, 13rem);
    font-weight: 400;
    line-height: 0.82;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .body {
    width: 100%;
    padding-top: var(--space-2);
  }

  .empty {
    max-width: var(--article-column);
    margin: 0 auto;
    padding-inline: var(--article-padding-inline);
    color: var(--color-muted);
    font-size: var(--type-base);
    line-height: 1.55;
  }

  .side-projects-page-state {
    max-width: 44rem;
    min-height: 55vh;
    margin: 0 auto;
    padding: var(--space-8) var(--space-5) var(--space-9);
    color: var(--color-ink);
    background: var(--color-paper);
  }

  .side-projects-page-state > h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    color: var(--color-primary-heavy);
    font-size: var(--type-small);
    font-family: var(--font-sans);
    font-style: normal;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .excerpt {
    margin: var(--space-4) 0 0;
    color: var(--color-muted);
    font-size: var(--type-base);
    line-height: 1.55;
  }

  @include breakpoint(tablet-down) {
    .section-heading {
      grid-template-columns: 1fr;
    }
  }

  @include breakpoint(phone) {
    .section-heading {
      max-width: calc(100% - var(--space-5));
    }

    .title {
      font-size: clamp(4.25rem, 23vw, 7.5rem);
    }
  }
</style>
