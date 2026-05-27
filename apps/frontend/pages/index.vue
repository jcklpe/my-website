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
    <section class="hero-region">
      <div class="hero-display">
        <p class="mega-text">{{ homePageContent?.megaText ?? 'B.L.U.F.' }}</p>
        <h1 class="hero-title">
          {{ homePageContent?.title ?? 'Title Text' }}
        </h1>
        <p class="hero-subtitle">
          {{ homePageContent?.subtitle ?? 'Subtitle text' }}
        </p>
      </div>
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
    padding-inline: 0;
    overflow: hidden;
    background: var(--color-black);
  }

  .hero-region {
    position: relative;
    min-height: 62vh;
    box-sizing: border-box;
    padding: var(--space-9) var(--space-6) var(--space-7);
    display: grid;
    align-content: center;
    overflow: hidden;
    color: var(--color-surface);
    background: var(--texture-poster-dark);
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 5vw), 0 100%);
    margin-bottom: -5vw;
  }

  .hero-region::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(110deg, transparent 0 42%, rgba(38, 87, 235, 0.52) 42% 43%, transparent 43% 100%),
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 5rem);
    background-size:
      auto,
      100% 100%;
  }

  .hero-region::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 34%;
    pointer-events: none;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.7), transparent);
  }

  .hero-display {
    position: relative;
    z-index: 1;
    max-width: min(72rem, 94vw);
    transform: rotate(-3deg);
  }

  .mega-text {
    margin: 0;
    width: fit-content;
    padding: 0.1em 0.35em;
    background: var(--color-notice);
    color: var(--color-black);
    font-family: var(--font-sans);
    font-size: var(--type-base);
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
    box-shadow:
      2.5em 0 0 var(--color-notice),
      -0.5em 0 0 var(--color-notice);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    width: fit-content;
    margin: var(--space-5) 0 0;
    max-width: min(12ch, 100%);
    padding: 0.06em 0.18em 0.16em;
    background: var(--color-black);
    box-shadow: var(--shadow-label);
    font-size: clamp(3.1rem, 10vw, 7rem);
    font-family: var(--font-display);
    font-style: normal;
    font-weight: 400;
    line-height: 0.9;
    letter-spacing: 0;
    color: var(--color-surface);
    text-transform: none;
    text-wrap: balance;
    text-shadow:
      0 2px 0 rgba(255, 255, 255, 0.42),
      0 14px 10px rgba(0, 0, 0, 0.18),
      0 24px 2px rgba(0, 0, 0, 0.12);
  }

  .hero-subtitle {
    width: fit-content;
    margin: var(--space-4) 0 0 var(--space-6);
    max-width: min(44rem, calc(100% - var(--space-6)));
    padding: 0.35em 0.65em;
    background: var(--color-black);
    box-shadow:
      3em 0 0 var(--color-black),
      -0.5em 0 0 var(--color-black),
      0 4px 0 var(--color-primary);
    font-family: var(--font-lite);
    font-size: 1.2rem;
    font-style: normal;
    line-height: 1.45;
    color: var(--color-surface);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: 0;
    }

    .hero-region {
      min-height: 62vh;
      padding: var(--space-8) var(--space-4) var(--space-7);
    }

    .hero-title {
      font-size: 3.2rem;
    }

    .hero-subtitle {
      margin-left: var(--space-3);
    }
  }
</style>
