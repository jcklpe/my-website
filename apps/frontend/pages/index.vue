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
    padding-inline: var(--space-6);
    background: var(--texture-paper-grid);
  }

  .hero-region {
    position: relative;
    min-height: 62vh;
    box-sizing: border-box;
    padding: var(--space-9) 0 var(--space-8);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    overflow: hidden;
  }

  .hero-region::before {
    content: '';
    position: absolute;
    right: min(4vw, var(--space-7));
    bottom: var(--space-8);
    width: 15rem;
    aspect-ratio: 1;
    border: 1px solid rgba(168, 95, 43, 0.42);
    border-radius: 999px;
    background:
      radial-gradient(circle at 50% 50%, transparent 0 35%, rgba(168, 95, 43, 0.16) 36% 37%, transparent 38%),
      repeating-conic-gradient(from 0deg, rgba(168, 95, 43, 0.42) 0deg 2deg, transparent 2deg 12deg);
    opacity: 0.48;
  }

  .hero-region::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: var(--space-6);
    left: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(168, 95, 43, 0.46),
      transparent
    );
  }

  .hero-display {
    position: relative;
    z-index: 1;
    max-width: 54rem;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
    color: var(--color-primary-heavy);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    font-size: 5rem;
    font-family: var(--font-serif);
    font-weight: 500;
    line-height: 0.98;
    letter-spacing: 0;
    color: var(--color-ink);
    text-transform: none;
    text-wrap: balance;
  }

  .hero-subtitle {
    max-width: 38rem;
    margin: var(--space-4) 0 0;
    font-size: 1.1rem;
    font-weight: 400;
    line-height: 1.65;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      min-height: 58vh;
      padding: var(--space-8) 0 var(--space-7);
    }

    .hero-region::before {
      right: -4rem;
      bottom: var(--space-7);
      width: 12rem;
    }

    .hero-title {
      font-size: 3.2rem;
    }
  }
</style>
