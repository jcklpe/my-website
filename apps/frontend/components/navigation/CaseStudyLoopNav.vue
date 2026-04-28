<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  defineProps<{
    previous: WordPressCaseStudy;
    next: WordPressCaseStudy;
  }>();

  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();

  function caseStudyUrl(caseStudy: WordPressCaseStudy): string {
    return `/case-studies/${caseStudy.slug}`;
  }

  function mediaTransitionKey(caseStudy: WordPressCaseStudy): string {
    return `case-study-${caseStudy.slug}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  }
</script>

<template>
  <nav class="case-study-loop-nav" aria-label="Case study navigation">
    <NuxtLink v-slot="{ href }" :to="caseStudyUrl(previous)" custom>
      <a
        :href="href"
        class="link previous"
        @click="
          navigateWithFeaturedMediaTransition(
            $event,
            caseStudyUrl(previous),
            mediaTransitionKey(previous),
            previous.featuredMedia,
          )
        "
      >
        <FeaturedMediaFrame
          class="media-frame"
          :media="previous.featuredMedia"
          label="Previous"
          :transition-key="mediaTransitionKey(previous)"
          transition-role="source"
          transition-clip-path="polygon(0 0, 100% 5vw, 100% 100%, 0 100%)"
        />

        <span class="direction">Previous</span>
        <span
          class="title"
          :data-featured-title-source="mediaTransitionKey(previous)"
        >
          <span>{{ previous.title }}</span>
        </span>
      </a>
    </NuxtLink>

    <NuxtLink v-slot="{ href }" :to="caseStudyUrl(next)" custom>
      <a
        :href="href"
        class="link next"
        @click="
          navigateWithFeaturedMediaTransition(
            $event,
            caseStudyUrl(next),
            mediaTransitionKey(next),
            next.featuredMedia,
          )
        "
      >
        <FeaturedMediaFrame
          class="media-frame"
          :media="next.featuredMedia"
          label="Next"
          :transition-key="mediaTransitionKey(next)"
          transition-role="source"
          transition-clip-path="polygon(0 5vw, 100% 0, 100% 100%, 0 100%)"
        />

        <span class="direction">Next</span>
        <span class="title" :data-featured-title-source="mediaTransitionKey(next)">
          <span>{{ next.title }}</span>
        </span>
      </a>
    </NuxtLink>
  </nav>
</template>

<style lang="scss" scoped>
  .case-study-loop-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    margin-top: var(--space-8);
    background: var(--color-ink);
  }

  .link {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: clamp(18rem, 36vw, 30rem);
    overflow: hidden;
    padding: var(--space-6);
    color: white;
    text-decoration: none;
  }

  .previous {
    clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%);
  }

  .next {
    clip-path: polygon(0 5vw, 100% 0, 100% 100%, 0 100%);
  }

  .media-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.68;
    transition:
      opacity 220ms var(--motion-snappy),
      transform 520ms var(--motion-snappy);
  }

  .link:hover .media-frame,
  .link:focus-visible .media-frame {
    opacity: 0.86;
    transform: scale(1.035);
  }

  .media-frame :deep(.image),
  .media-frame :deep(.placeholder) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .direction,
  .title {
    position: relative;
    z-index: 2;
  }

  .direction {
    width: fit-content;
    margin-bottom: var(--space-4);
    background: var(--color-ink);
    box-shadow:
      0.45em 0 0 var(--color-ink),
      -0.45em 0 0 var(--color-ink);
    font-size: var(--type-step--1);
    font-style: italic;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .title {
    max-width: 16ch;
    color: white;
    font-family: var(--font-serif);
    font-size: clamp(2rem, 4vw, 4.5rem);
    line-height: 0.95;
    letter-spacing: -0.065em;
    text-wrap: balance;
  }

  .title span {
    display: inline;
    background: var(--color-ink);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    box-shadow:
      -0.18em 0 0 var(--color-ink),
      0.16em 0 0 var(--color-ink);
  }

  .next {
    align-items: flex-end;
    text-align: right;
  }

  @media (max-width: 720px) {
    .case-study-loop-nav {
      grid-template-columns: 1fr;
    }

    .link {
      min-height: 17rem;
      padding-inline: var(--space-4);
    }

    .previous,
    .next {
      clip-path: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .media-frame {
      transition: none;
    }
  }
</style>
