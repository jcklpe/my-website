<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  const props = defineProps<{
    caseStudy: WordPressCaseStudy;
  }>();

  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();
  const transitionState = useFeaturedMediaTransitionState();
  const caseStudySlug = computed(() => props.caseStudy.slug);
  const caseStudyUrl = computed(() => `/case-studies/${caseStudySlug.value}`);
  const mediaTransitionKey = computed(() =>
    `case-study-${caseStudySlug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );
</script>

<template>
  <article class="case-study-card" data-transition-source>
    <NuxtLink v-slot="{ href }" :to="caseStudyUrl" custom>
      <a
        :href="href"
        class="link-box"
        @click="
          navigateWithFeaturedMediaTransition(
            $event,
            caseStudyUrl,
            mediaTransitionKey,
            caseStudy.featuredMedia,
          )
        "
      >
        <div class="label-stack">
          <h3 class="title" :data-featured-title-source="mediaTransitionKey">
            <span
              class="title-label"
              :class="{ 'is-transition-hidden': isTitleTransitioning }"
            >
              {{ caseStudy.title }}
            </span>
          </h3>

          <p v-if="caseStudy.excerpt" class="subheading">
            <span>{{ caseStudy.excerpt }}</span>
          </p>
        </div>
      </a>
    </NuxtLink>

    <FeaturedMediaFrame
      class="media-frame"
      :media="caseStudy.featuredMedia"
      label="Case Study"
      :transition-key="mediaTransitionKey"
      transition-role="source"
      transition-clip-path="polygon(0 5vw, 100% 0, 100% 100%, 0 100%)"
    />
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    width: 100%;
    position: relative;
    min-height: clamp(320px, 48vh, 580px);
    overflow: hidden;
    z-index: 1;
    padding: 0;
    display: flex;
    clip-path: polygon(0 5vw, 100% 0, 100% 100%, 0 100%);
    margin-bottom: -5vw;
    align-items: stretch;
    background: var(--color-ink);
  }

  .case-study-card::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 2;
    background:
      repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.09) 2px,
        rgba(0, 0, 0, 0.09) 3px
      ),
      linear-gradient(
        to top,
        rgba(12, 17, 43, 0.96) 0%,
        rgba(12, 17, 43, 0.62) 40%,
        rgba(12, 17, 43, 0.12) 72%,
        transparent 100%
      );
    pointer-events: none;
  }

  .link-box {
    position: absolute;
    inset: 0;
    color: white;
    text-decoration: none;
    user-select: none;
    z-index: 4;
    display: flex;
    align-items: stretch;
    width: 100%;
    max-width: 100%;
    padding: clamp(1.5rem, 4vw, 3.5rem) var(--space-6)
      clamp(1.5rem, 4vw, 2.5rem);
    box-sizing: border-box;
  }

  .link-box::before {
    content: '';
    position: absolute;
    top: clamp(1rem, 2.8vw, 2.2rem);
    left: clamp(1rem, 2.8vw, 2.2rem);
    width: 1.4rem;
    height: 1.4rem;
    border-top: 1px solid rgba(200, 124, 32, 0.5);
    border-left: 1px solid rgba(200, 124, 32, 0.5);
    pointer-events: none;
    z-index: 5;
    transition: border-color 0.35s ease;
  }

  .link-box::after {
    content: '';
    position: absolute;
    bottom: clamp(2.5rem, 5vw, 4rem);
    right: clamp(1rem, 2.8vw, 2.2rem);
    width: 1.4rem;
    height: 1.4rem;
    border-bottom: 1px solid rgba(200, 124, 32, 0.5);
    border-right: 1px solid rgba(200, 124, 32, 0.5);
    pointer-events: none;
    z-index: 5;
    transition: border-color 0.35s ease;
  }

  .link-box:hover::before,
  .link-box:hover::after,
  .link-box:focus-visible::before,
  .link-box:focus-visible::after {
    border-color: rgba(200, 124, 32, 0.95);
  }

  .label-stack {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }

  .title {
    order: 2;
    position: relative;
    color: white;
    text-align: left;
    font-size: clamp(3rem, 5.8vw, 8rem);
    text-shadow:
      0 2px 28px rgba(0, 0, 0, 0.6),
      0 0 80px rgba(0, 0, 0, 0.35);
    max-width: 100%;
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 0.88;
    letter-spacing: -0.06em;
  }

  .title-label {
    font-family: var(--font-mono);
    font-style: italic;
    color: white;
    background: none;
    box-shadow: none;
    padding: 0;
    transition: color 0.35s ease;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    order: 1;
    align-self: flex-start;
    margin: 0;
    line-height: 1;
  }

  .subheading span {
    display: inline-block;
    padding: 0;
    font-family: var(--font-mono);
    font-size: clamp(0.55rem, 0.85vw, 0.65rem);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-amber);
    background: none;
    border: none;
    backdrop-filter: none;
    box-shadow: none;
    text-shadow: 0 0 14px rgba(181, 104, 0, 0.55);
    position: static;
    left: auto;
    margin: 0;
    transition: text-shadow 0.35s ease;
  }

  .media-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 5vw, 100% 0, 100% 100%, 0 100%);
    z-index: 1;
  }

  .case-study-card :deep(.image),
  .case-study-card :deep(.placeholder) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: cover;
    transform: scale(1);
    filter: saturate(0.55) brightness(0.75);
    transition:
      transform 0.7s cubic-bezier(0.4, 0, 0.2, 1),
      filter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .link-box:hover .title-label,
  .link-box:focus-visible .title-label {
    color: white;
    text-shadow:
      0 1px 0 rgba(0, 0, 0, 0.9),
      0 0 50px rgba(181, 104, 0, 0.3);
  }

  .link-box:hover .subheading span,
  .link-box:focus-visible .subheading span {
    text-shadow: 0 0 20px rgba(181, 104, 0, 0.9);
  }

  .link-box:hover :deep(.image),
  .link-box:focus-visible :deep(.image) {
    transform: scale(1.04);
    filter: saturate(0.8) brightness(0.9);
  }

  @media (max-width: 768px) {
    .title {
      font-size: clamp(2.2rem, 8vw, 4.5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading span,
    .link-box::before,
    .link-box::after,
    .case-study-card :deep(.image) {
      transition: none;
    }
  }
</style>
