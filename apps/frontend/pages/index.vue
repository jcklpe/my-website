<script setup lang="ts">
  const { getHomeCaseStudies, getHomeContent, getHomePosts } =
    useHomeSurfacePrefetch();

  const { data: posts, error } = await useAsyncData('homepage-posts', () =>
    getHomePosts(),
  );

  const { data: caseStudies, error: caseStudiesError } = await useAsyncData(
    'homepage-case-studies',
    () => getHomeCaseStudies(),
  );

  const { data: homePageContent } = await useAsyncData('homepage-content', () =>
    getHomeContent(),
  );

  useSiteSeoMeta({
    title: 'Home',
    description: () =>
      homePageContent.value?.seoDescription ??
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  });
</script>

<template>
  <div class="home-page">
    <section class="hero-region" aria-label="Site hero">
      <h1 class="hero-text" data-text="Design X Code">
        Design <span class="accent-x">X</span> Code
      </h1>
    </section>

    <HomeVitalInfo
      :tagline="
        homePageContent?.aboutTagline ??
        'This is the website of Aslan French, design technologist and researcher.'
      "
      :quick-links="homePageContent?.quickLinks ?? []"
    />

    <HomeSelectedWorkSection
      :case-studies="caseStudies"
      :error="Boolean(caseStudiesError)"
    />

    <HomeEmployerTestimonials
      :testimonials="homePageContent?.employerTestimonials ?? []"
    />

    <HomeSideProjectsLink />

    <HomeLatestWritingSection :posts="posts" :error="Boolean(error)" />
  </div>
</template>

<style lang="scss" scoped>
  .home-page {
    // No padding-inline — hero and Selected Work sections are full-bleed.
    // Inner sections manage their own padding.
  }

  // ── Glitch hero ──────────────────────────────────────────────────────────────
  .hero-region {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 100vh;
    background: #000;
    overflow: hidden;
  }

  .hero-text {
    position: relative;
    margin: 0;
    padding: 0 6vw;
    font-family: var(--font-display);
    font-size: clamp(3.5rem, 10vmax, 11rem);
    font-weight: normal;
    font-style: normal;
    line-height: 0.95;
    color: #fff;
    text-transform: none;
    letter-spacing: 0.02em;
    user-select: none;
  }

  .accent-x {
    color: var(--color-primary);
  }

  // Glitch layers — pseudo-elements show clipped color-shifted copies.
  // Gated on prefers-reduced-motion: no-preference.
  @media (prefers-reduced-motion: no-preference) {
    .hero-text::before,
    .hero-text::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 6vw;
      width: calc(100% - 12vw);
      font-family: var(--font-display);
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      color: #fff;
      pointer-events: none;
    }

    .hero-text::before {
      animation: glitch-1 8s steps(1) 1 both;
      color: #0ff;
      mix-blend-mode: screen;
    }

    .hero-text::after {
      animation: glitch-2 8s steps(1) 0.2s 1 both;
      color: var(--color-primary);
      mix-blend-mode: screen;
    }

    @keyframes glitch-1 {
      0%,
      78%,
      100% {
        clip-path: none;
        transform: none;
      }

      79% {
        clip-path: polygon(0 12%, 100% 12%, 100% 28%, 0 28%);
        transform: translateX(8px);
      }

      80% {
        clip-path: polygon(0 52%, 100% 52%, 100% 58%, 0 58%);
        transform: translateX(-6px);
      }

      81% {
        clip-path: polygon(0 70%, 100% 70%, 100% 88%, 0 88%);
        transform: translateX(10px);
      }

      82% {
        clip-path: polygon(0 5%, 100% 5%, 100% 15%, 0 15%);
        transform: translateX(-4px);
      }

      83%,
      99% {
        clip-path: none;
        transform: none;
      }
    }

    @keyframes glitch-2 {
      0%,
      80%,
      100% {
        clip-path: none;
        transform: none;
      }

      81% {
        clip-path: polygon(0 0, 100% 0, 100% 38%, 0 38%);
        transform: translateX(-8px);
      }

      82% {
        clip-path: polygon(0 62%, 100% 62%, 100% 100%, 0 100%);
        transform: translateX(6px);
      }

      83% {
        clip-path: polygon(0 42%, 100% 42%, 100% 54%, 0 54%);
        transform: translateX(12px);
      }

      84%,
      99% {
        clip-path: none;
        transform: none;
      }
    }
  }

  @include breakpoint(phone) {
    .hero-text {
      padding: 0 var(--space-5);
    }

    .hero-text::before,
    .hero-text::after {
      left: var(--space-5);
      width: calc(100% - (var(--space-5) * 2));
    }
  }
</style>
