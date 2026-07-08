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
  const nowContent = computed(() => aboutPage.value?.nowContent ?? '');
  const hasNowContent = computed(() => Boolean(nowContent.value.trim()));
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

    <div class="body-column">
      <BlockRenderer
        v-if="aboutBlocks.length"
        class="body"
        :blocks="aboutBlocks"
      />
      <p v-else class="body empty">
        About content is ready to be authored in WordPress.
      </p>

      <section v-if="hasNowContent" id="now" class="now-section">
        <h2 class="now-heading">Now</h2>
        <div class="now-body" v-html="nowContent" />
      </section>
    </div>
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
  }

  .hero {
    align-self: start;
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    color: var(--color-primary-heavy);
    font-size: var(--type-small);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .title {
    max-width: 11ch;
    margin: 0;
    font-family: var(--font-mono);
    font-size: clamp(3.5rem, 8vw, 8rem);
    line-height: 1;
    letter-spacing: -0.07em;
  }

  .body-column {
    align-self: center;
    width: 100%;
    max-width: 42rem;
  }

  // BlockRenderer's root carries .content-flow, which sets overflow-x: clip as a
  // guard against 100vw full-bleed blocks elsewhere. The About page has no such
  // blocks and deliberately lets the portrait dip into the right gutter, so that
  // clip would cut the image off. Allow it to overflow visibly here. (The dip is
  // clamped to stay within the column-2 gutter, so this never causes h-scroll.)
  .body {
    overflow: visible;
  }

  .empty {
    margin: 0;
    color: var(--color-muted);
    font-size: var(--type-base);
    line-height: 1.55;
  }

  // Match the content-flow content column so the Now section's left edge is flush
  // with the About body paragraphs above it (which are inset by the grid's outer
  // track). Same measure + centering = same inset at every width.
  .now-section {
    max-width: var(--article-grid-content);
    margin-inline: auto;
    margin-top: -70px;
  }

  .now-heading {
    @include heading-h2-block;
    // heading-h2-block caps width at --article-column-heading and centers it;
    // here we want it flush-left and full-width so it aligns with the Now
    // paragraphs and the rule spans the column.
    width: 100%;
    max-width: none;
    justify-self: start;
  }

  // Floated images in the About body should NOT carry the cream photo-mat or the
  // article/post breakout offset — here that reads as a weird off-center crop.
  // Drop the mat (background/padding) and the breakout margins; the image keeps
  // its own window border and sits in the body column with a simple gap.
  // The .is-resized selectors out-specify the resized-float recipe (0,3,1).
  .body :deep(figure.alignright),
  .body :deep(figure.alignright.is-resized),
  .body :deep(figure.alignleft),
  .body :deep(figure.alignleft.is-resized) {
    padding: 0;
    margin-block: 0 var(--space-5);
    background: transparent;
  }

  // Text-side breathing room (well above the 25px floor). alignright wraps text
  // on its left; alignleft on its right.
  .body :deep(figure.alignright),
  .body :deep(figure.alignright.is-resized) {
    margin-left: var(--space-6);
  }

  .body :deep(figure.alignleft),
  .body :deep(figure.alignleft.is-resized) {
    margin-right: var(--space-6);
  }

  // Push the portrait out into the empty right gutter so it stops squeezing the
  // wrapped text. The dip is a fluid, self-limiting value: 0 until ~1380px (no
  // gutter yet), then it grows with viewport width up to a ~-13rem cap — so it
  // scales across mid-size laptops through large displays and can never push the
  // image off-screen (which was the earlier cutoff we fixed). Only alignright
  // dips; there is no empty gutter on the left (the hero title lives there).
  .body :deep(figure.alignright),
  .body :deep(figure.alignright.is-resized) {
    margin-right: clamp(-13rem, calc((1380px - 100vw) * 0.4), 0px);
  }

  .now-body {
    color: var(--type-body-color);
    font-family: var(--font-sans);
    font-size: var(--type-body-size);
    line-height: var(--type-body-line-height);

    :deep(p) {
      margin: 0 0 var(--space-5);
    }

    :deep(p:last-child) {
      margin-bottom: 0;
    }

    @include paragraph-deep-links;
  }

  .about-page-state {
    max-width: 44rem;
    min-height: 55vh;
    padding: var(--space-8) var(--space-6) var(--space-9);
    color: var(--color-ink);
  }

  .about-page-state > h1 {
    margin: 0;
    font-family: var(--font-mono);
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1;
    letter-spacing: -0.05em;
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
  }
</style>
