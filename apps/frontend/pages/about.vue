<script setup lang="ts">
  import type { WordPressPage } from '~/types/wordpress';

  const {
    data: aboutPage,
    error,
    status,
  } = await useAsyncData<WordPressPage | null>('about-page', () =>
    queryWordPressPageByUri('/about'),
  );

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );
  const aboutBlocks = computed(() => aboutPage.value?.blocks ?? []);
  const displayHeading = computed(
    () => aboutPage.value?.displayHeading || aboutPage.value?.title || 'About',
  );
  const seoDescription = computed(
    () =>
      aboutPage.value?.seoDescription ||
      'About Aslan French, a design technologist and researcher working across frontend systems, publishing, and experimental interfaces.',
  );

  useSiteSeoMeta({
    title: () => aboutPage.value?.title || 'About',
    description: () => seoDescription.value,
  });
</script>

<template>
  <article v-if="aboutPage" class="about-page">
    <header class="hero">
      <p class="eyebrow">About</p>
      <h1 class="title">
        {{ displayHeading }}
      </h1>
    </header>

    <BlockRenderer
      v-if="aboutBlocks.length"
      class="body"
      :blocks="aboutBlocks"
    />
    <p v-else class="body empty">
      About content is ready to be authored in WordPress.
    </p>
  </article>

  <section v-else class="about-page-state" aria-live="polite">
    <p class="eyebrow">
      {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
    </p>
    <h1>
      {{
        isLoading
          ? 'Loading about page...'
          : error
            ? 'Unable to load about page.'
            : 'About page not found.'
      }}
    </h1>
    <p class="excerpt">
      {{
        isLoading
          ? 'Fetching the About page from WordPress.'
          : error
            ? 'The CMS request failed. Try refreshing, or check whether WordPress is running.'
            : 'No published WordPress page exists at /about.'
      }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
  .about-page {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(20rem, 1.05fr);
    gap: var(--space-6);
    min-height: 70vh;
    padding: var(--space-8) var(--space-6) var(--space-7);
    background: var(--color-paper);
    color: var(--color-ink);
  }

  .hero {
    align-self: start;
    position: sticky;
    top: var(--space-6);
    display: grid;
    gap: var(--space-4);
    padding-bottom: var(--space-5);
    border-bottom: 2px solid var(--color-ink);
  }

  .eyebrow {
    width: fit-content;
    margin: 0;
    padding: 0.35rem 0.55rem;
    border: 2px solid var(--color-ink);
    background: var(--color-primary-heavy);
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
    max-width: 7ch;
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: clamp(5rem, 16vw, 12rem);
    font-weight: 400;
    line-height: 0.8;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .body {
    align-self: center;
    width: 100%;
    max-width: 44rem;
    padding: var(--space-5);
    border: 2px solid var(--color-ink);
    background: var(--color-surface);
    box-shadow: 0.75rem 0.75rem 0 var(--color-ink);
  }

  .empty {
    margin: 0;
    color: var(--color-muted);
    font-size: var(--type-base);
    line-height: 1.55;
  }

  .about-page-state {
    max-width: 44rem;
    min-height: 55vh;
    margin: 0 auto;
    padding: var(--space-8) var(--space-5) var(--space-9);
    color: var(--color-ink);
    background: var(--color-paper);
  }

  .about-page-state > h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .excerpt {
    margin: var(--space-4) 0 0;
    color: var(--color-muted);
    font-size: var(--type-base);
    line-height: 1.55;
  }

  @include breakpoint(phone) {
    .about-page {
      grid-template-columns: 1fr;
      padding-inline: var(--space-4);
    }

    .hero {
      position: static;
    }

    .body {
      align-self: start;
      padding: var(--space-4);
      box-shadow: 0.45rem 0.45rem 0 var(--color-ink);
    }
  }
</style>
