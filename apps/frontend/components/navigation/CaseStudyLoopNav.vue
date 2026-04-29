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
          transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
        />

        <div class="label-slip">
          <span class="direction">Previous</span>
          <span class="title">
            <span>{{ previous.title }}</span>
          </span>
        </div>
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
          transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
        />

        <div class="label-slip">
          <span class="direction">Next</span>
          <span class="title">
            <span>{{ next.title }}</span>
          </span>
        </div>
      </a>
    </NuxtLink>
  </nav>
</template>

<style lang="scss" scoped>
  .case-study-loop-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: var(--space-8);
  }

  .link {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: clamp(18rem, 36vw, 28rem);
    overflow: hidden;
    padding: var(--space-6);
    color: var(--color-ink);
    text-decoration: none;
    background: var(--color-ink);
  }

  .media-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.62;
    transition:
      opacity 220ms var(--motion-snappy),
      transform 520ms var(--motion-snappy);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }

  .link:hover .media-frame,
  .link:focus-visible .media-frame {
    opacity: 0.78;
    transform: scale(1.03);
  }

  .media-frame :deep(.image),
  .media-frame :deep(.placeholder) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .label-slip {
    position: relative;
    z-index: 2;
    display: inline-flex;
    flex-direction: column;
    gap: var(--space-2);
    max-width: min(30rem, calc(100% - var(--space-5)));
    padding: var(--space-3) var(--space-4) var(--space-4);
    background: rgba(247, 245, 239, 0.93);
    border: 1px solid rgba(12, 17, 43, 0.1);
  }

  .direction {
    display: block;
    color: var(--color-muted);
    font-size: var(--type-step--1);
    font-style: italic;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .title {
    display: block;
    color: var(--color-ink);
    font-family: var(--font-serif);
    font-size: clamp(1.35rem, 2.5vw, 2.25rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .title span {
    display: inline;
  }

  .next .label-slip {
    margin-left: auto;
  }

  .next {
    text-align: right;
    align-items: flex-end;
  }

  @media (max-width: 720px) {
    .case-study-loop-nav {
      grid-template-columns: 1fr;
    }

    .link {
      min-height: 16rem;
      padding-inline: var(--space-4);
    }

    .next {
      align-items: flex-start;
      text-align: left;
    }

    .next .label-slip {
      margin-left: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .media-frame {
      transition: none;
    }
  }
</style>
