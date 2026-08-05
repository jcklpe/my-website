<script setup lang="ts">
  import { extractAttribute, extractFirstImage } from '~/utils/block-html';

  declare module 'vue-router' {
    interface RouteMeta {
      hideSiteNav?: boolean;
    }
  }

  definePageMeta({ hideSiteNav: true });

  // Single source of truth: the Now text and the portrait both live on the
  // About page. /now reads that page and mirrors them.
  const {
    data: aboutPage,
    error,
    status,
  } = await useAsyncData('now-page-source', () =>
    queryWordPressPageByUri('/about'),
  );

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );

  const nowContent = computed(() => aboutPage.value?.nowContent ?? '');
  const hasContent = computed(() => Boolean(nowContent.value.trim()));

  // Portrait is the first image block in the About body content.
  const portrait = computed(() => {
    const imageBlock = (aboutPage.value?.blocks ?? []).find(
      (block) => block.name === 'core/image',
    );
    const image = extractFirstImage(imageBlock?.renderedHtml);
    if (!image?.src) return null;

    return {
      src: image.src,
      alt: image.alt,
      srcset: extractAttribute(image.attributes, 'srcset') || undefined,
      sizes: extractAttribute(image.attributes, 'sizes') || undefined,
    };
  });

  useSiteSeoMeta({
    title: () => 'Now',
    description: () =>
      'What Aslan French is focused on right now — a short, current statement of work and direction.',
  });
</script>

<template>
  <article class="now-page">
    <h1 class="title">What I'm doing now</h1>

    <figure v-if="portrait" class="portrait">
      <img
        :src="portrait.src"
        :srcset="portrait.srcset"
        :sizes="portrait.sizes"
        :alt="portrait.alt"
        loading="lazy"
        decoding="async"
      />
    </figure>

    <div v-if="hasContent" class="body" v-html="nowContent" />
    <p v-else-if="isLoading" class="body empty">Loading…</p>
    <p v-else-if="error" class="body empty">
      The Now statement could not be loaded right now.
    </p>
    <p v-else class="body empty">
      A Now statement is ready to be authored in WordPress.
    </p>

    <p class="elaborate">
      <NuxtLink to="/about" class="about-link">
        More about me
        <span class="arrow-slot" aria-hidden="true">
          <span class="arrow">→</span>
        </span>
      </NuxtLink>
    </p>
  </article>
</template>

<style lang="scss" scoped>
  .now-page {
    max-width: 48rem;
    min-height: 70vh;
    padding: var(--space-8) var(--space-6) var(--space-7);
  }

  .title {
    margin: 0 0 var(--space-7);
    font-family: var(--font-mono);
    font-size: clamp(2.5rem, 6vw, 5rem);
    line-height: 0.95;
    letter-spacing: -0.05em;
  }

  .portrait {
    float: right;
    width: min(40%, 16rem);
    margin: 0 0 var(--space-5) var(--space-6);

    img {
      display: block;
      width: 100%;
      height: auto;
      border: var(--border-window);
      box-shadow: var(--shadow-hard-low);
    }
  }

  .body {
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

  .empty {
    margin: 0;
    color: var(--color-muted);
  }

  .elaborate {
    clear: both;
    margin: var(--space-7) 0 0;
  }

  .about-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    font-size: var(--type-large);
    font-style: italic;
    @include rich-link;
  }

  .about-link:hover,
  .about-link:focus-visible {
    @include rich-link-hover;
  }

  @include arrow-cta-slit('.about-link');



  @include breakpoint(phone) {
    .now-page {
      padding-inline: var(--space-4);
    }

    .portrait {
      float: none;
      width: min(60%, 14rem);
      margin: 0 0 var(--space-5);
    }
  }
</style>
