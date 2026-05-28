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
    grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.1fr);
    gap: var(--space-7);
    min-height: 70vh;
    padding: var(--space-8) var(--space-6) var(--space-7);
    background: var(--color-stage);
    color: var(--color-stage-ink);
  }

  .hero {
    align-self: start;
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .title {
    max-width: 11ch;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 6.5rem;
    line-height: 0.9;
    text-transform: uppercase;
  }

  .body {
    align-self: center;
    width: 100%;
    max-width: 44rem;
    padding: var(--space-6) 0;
    background: var(--color-surface);
    color: var(--color-ink);
    box-shadow: 0 28px 90px rgba(0, 0, 0, 0.32);
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
    padding: var(--space-8) var(--space-6) var(--space-9);
    color: var(--color-stage-ink);
    background: var(--color-stage);
  }

  .about-page-state > h1 {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 3.4rem;
    line-height: 1;
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

    .body {
      align-self: start;
    }

    .title {
      font-size: 3.35rem;
    }
  }
</style>
