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
    background: var(--color-primary);
    box-shadow: inset 0 12px 39px 1px rgba(0, 4, 26, 0.28);
  }

  .hero {
    align-self: start;
    padding: 0;
    color: var(--color-surface);
  }

  .eyebrow {
    width: fit-content;
    margin: 0 0 var(--space-4);
    padding: 0.1em 0.35em;
    background: var(--color-notice);
    color: var(--color-black);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .title {
    max-width: 11ch;
    margin: 0;
    width: fit-content;
    padding: 0.04em 0.2em 0.12em;
    background: var(--color-black);
    box-shadow: var(--shadow-label);
    color: var(--color-surface);
    font-family: var(--font-display);
    font-size: 5rem;
    line-height: 0.9;
    letter-spacing: 0;
    text-wrap: balance;
  }

  .body {
    align-self: center;
    width: 100%;
    max-width: 44rem;
    padding: var(--space-5);
    background: var(--color-surface);
    box-shadow: var(--shadow-soft-mid);
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
    margin: var(--space-8) var(--space-6) var(--space-9);
    padding: var(--space-6);
    background: var(--color-surface);
    box-shadow: var(--shadow-soft-mid);
    color: var(--color-ink);
  }

  .about-page-state > h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 3rem;
    line-height: 1;
    letter-spacing: 0;
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
      gap: var(--space-6);
    }

    .hero {
      padding: 0;
    }

    .body {
      align-self: start;
    }

    .title {
      font-size: 3.2rem;
    }

    .about-page-state {
      margin-inline: var(--space-4);
      padding: var(--space-4);
    }
  }
</style>
