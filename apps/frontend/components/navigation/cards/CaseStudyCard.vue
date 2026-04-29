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
        :class="{ 'is-transition-hidden': isTitleTransitioning }"
        :data-featured-slip-source="mediaTransitionKey"
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
      transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
    />
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    width: 100%;
    position: relative;
    min-height: clamp(320px, 46vh, 560px);
    overflow: hidden;
    z-index: 1;
    padding: 0;
    display: flex;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    margin-bottom: 0;
    align-items: flex-end;
    background: var(--color-ink);
  }

  .link-box {
    position: absolute;
    bottom: var(--space-6);
    left: var(--space-6);
    z-index: 4;
    max-width: min(54rem, calc(100% - var(--space-7)));
    padding: var(--space-4) var(--space-5) var(--space-5);
    background: rgba(247, 245, 239, 0.93);
    border: 1px solid rgba(12, 17, 43, 0.1);
    color: var(--color-ink);
    text-decoration: none;
    user-select: none;
    transition: opacity 160ms ease;
  }

  .label-stack {
    position: relative;
    height: 100%;
    width: 100%;
    flex-direction: column;
    z-index: 4;
  }

  .title {
    position: relative;
    color: var(--color-ink);
    text-align: left;
    font-size: clamp(1.35rem, 2.5vw, 2.25rem);
    max-width: 38rem;
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 1.05;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .title-label {
    padding: 0;
    font-family: var(--font-serif);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    margin-top: var(--space-3);
    margin-left: 0;
    margin-right: 0;
    line-height: 1.4;
  }

  .subheading span {
    display: inline;
    font-size: clamp(0.8rem, 1.2vw, 0.95rem);
    font-family: var(--font-sans);
    color: var(--color-muted);
    font-style: italic;
  }

  .media-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }

  .case-study-card :deep(.image),
  .case-study-card :deep(.placeholder) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: cover;
    transform: translate(0, 0);
    transition:
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      filter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 768px) {
    .title {
      margin-left: 20px;
      padding: 40px 0;
    }

    .title-label {
      word-wrap: break-word;
    }

    .subheading span {
      line-height: 3;
      margin-left: 70px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading span,
    .case-study-card :deep(.image) {
      transition: none;
    }
  }
</style>
