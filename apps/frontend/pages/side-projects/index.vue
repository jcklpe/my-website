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
    color: var(--color-ink);
  }

  .section-heading {
    max-width: var(--article-column);
    margin: 0 auto var(--space-6);
    padding-inline: var(--article-padding-inline);
  }

  .kicker {
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    font-size: var(--type-base);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 5rem;
    font-weight: 600;
    line-height: 0.92;
    letter-spacing: 0;
  }

  .body {
    width: 100%;
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
    padding: var(--space-8) 0 var(--space-9);
    color: var(--color-ink);
  }

  .side-projects-page-state > h1 {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 4rem;
    line-height: 1;
    letter-spacing: 0;
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    color: var(--color-primary-heavy);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .excerpt {
    margin: var(--space-4) 0 0;
    color: var(--color-muted);
    font-size: var(--type-base);
    line-height: 1.55;
  }

  @include breakpoint(phone) {
    .side-projects-page {
      padding-inline: var(--space-4);
    }

    .title {
      font-size: 3.4rem;
    }
  }
</style>
