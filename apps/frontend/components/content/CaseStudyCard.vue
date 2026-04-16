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
  <article class="case-study-section" data-transition-source>
    <NuxtLink v-slot="{ href }" :to="caseStudyUrl" custom>
      <a
        :href="href"
        class="case-study-box"
        @click="
          navigateWithFeaturedMediaTransition(
            $event,
            caseStudyUrl,
            mediaTransitionKey,
            caseStudy.featuredMedia,
          )
        "
      >
        <div class="title-card-flex">
          <h3
            class="case-study-title"
            :data-featured-title-source="mediaTransitionKey"
          >
            <span
              class="title"
              :class="{ 'title--transition-hidden': isTitleTransitioning }"
            >
              {{ caseStudy.title }}
            </span>
          </h3>

          <p v-if="caseStudy.excerpt" class="case-study-subheading">
            <span>{{ caseStudy.excerpt }}</span>
          </p>
        </div>
      </a>
    </NuxtLink>

    <FeaturedMediaFrame
      class="case-study-media-frame"
      :media="caseStudy.featuredMedia"
      label="Case Study"
      :transition-key="mediaTransitionKey"
      transition-role="source"
      transition-clip-path="polygon(0 5vw, 100% 0, 100% 100%, 0 100%)"
    />
  </article>
</template>

<style lang="scss" scoped>
  .case-study-section {
    width: 100%;
    position: relative;
    min-height: clamp(320px, 46vh, 560px);
    overflow: hidden;
    z-index: 1;
    padding: 0;
    display: flex;
    clip-path: polygon(0 5vw, 100% 0, 100% 100%, 0 100%);
    margin-bottom: -5vw;
    align-items: center;
    background: #002771;
    box-shadow: rgba(0, 0, 0, 0.85) 1px 7vw 100px inset;
  }

  .case-study-box {
    color: white;
    text-decoration: none;
    user-select: none;
    z-index: 4;
    position: relative;
    top: -24px;
    display: flex;
    width: fit-content;
    max-width: min(76rem, calc(100% - 40px));
    padding: 32px 100px 20px 40px;
  }

  .title-card-flex {
    position: relative;
    height: 100%;
    width: 100%;
    flex-direction: column;
    z-index: 4;
  }

  .case-study-title {
    position: relative;
    color: white;
    text-align: left;
    font-size: clamp(1.9rem, 3.5vw, 4rem);
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.35);
    max-width: min(76rem, 90vw);
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 0.95;
    letter-spacing: -0.055em;
  }

  .case-study-title .title {
    transition-delay: 0s;
    transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: black;
    box-shadow:
      0.3em 0 0 black,
      -5em 0 0 black,
      1em 5px 0 var(--color-primary),
      0 5px 0 var(--color-primary),
      5px 14px 10px rgba(0, 0, 0, 0.15),
      12px 24px 2px rgba(0, 0, 0, 0.1),
      18px 34px 30px rgba(0, 0, 0, 0.1);
    padding: 0;
    font-family: var(--font-serif);
  }

  .case-study-title .title--transition-hidden {
    opacity: 0;
  }

  .case-study-subheading {
    margin-top: 52px;
    margin-left: 10px;
    margin-right: 50px;
    line-height: 1.5;
  }

  .case-study-subheading span {
    display: inline;
    position: relative;
    left: 20px;
    padding: 10px 14px;
    margin-left: clamp(40px, 8vw, 100px);
    font-size: clamp(0.8rem, 1.4vw, 1.5rem);
    font-family: var(--font-sans);
    color: white;
    text-align: left;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.35);
    z-index: 4;
    user-select: none;
    text-decoration: none;
    background-color: black;
    box-shadow:
      -0.5em 0 0 black,
      3em 0 0 black,
      5px 14px 10px rgba(0, 0, 0, 0.15),
      12px 24px 2px rgba(0, 0, 0, 0.1),
      18px 34px 30px rgba(0, 0, 0, 0.1);
    transition-delay: 10s;
    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .case-study-media-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 5vw, 100% 0, 100% 100%, 0 100%);
  }

  .case-study-section :deep(.featured-media-frame__image),
  .case-study-section :deep(.featured-media-frame__placeholder) {
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

  .case-study-box:hover .case-study-title .title,
  .case-study-box:focus-visible .case-study-title .title {
    box-shadow:
      3em 0 0 black,
      -0.3em 0 0 black;
    transition-delay: 0s;
    transition: box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .case-study-box:hover .case-study-subheading span,
  .case-study-box:focus-visible .case-study-subheading span {
    display: inline;
    transition-delay: 10s;
    transition: box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      -5em 0 0 black,
      1em 0 0 black;
  }

  @media (max-width: 768px) {
    .case-study-title {
      margin-left: 20px;
      padding: 40px 0;
    }

    .case-study-title .title {
      word-wrap: break-word;
    }

    .case-study-subheading span {
      line-height: 3;
      margin-left: 70px;
    }

    .case-study-box:hover .case-study-title .title,
    .case-study-box:focus-visible .case-study-title .title {
      box-shadow:
        0.3em 0 0 black,
        -5em 0 0 black,
        1em 5px 0 var(--color-primary),
        0 5px 0 var(--color-primary),
        5px 14px 10px rgba(0, 0, 0, 0.15),
        12px 24px 2px rgba(0, 0, 0, 0.1),
        18px 34px 30px rgba(0, 0, 0, 0.1);
    }

    .case-study-box:hover .case-study-subheading span,
    .case-study-box:focus-visible .case-study-subheading span {
      box-shadow:
        -0.5em 0 0 black,
        3em 0 0 black,
        5px 14px 10px rgba(0, 0, 0, 0.15),
        12px 24px 2px rgba(0, 0, 0, 0.1),
        18px 34px 30px rgba(0, 0, 0, 0.1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .case-study-title .title,
    .case-study-subheading span,
    .case-study-section :deep(.featured-media-frame__image) {
      transition: none;
    }
  }
</style>
