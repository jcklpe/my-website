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
        <span class="hero-rule" aria-hidden="true" />
        <h1 class="hero-title">
          {{ homePageContent?.title ?? 'Title Text' }}
        </h1>
        <p class="hero-subtitle">
          {{ homePageContent?.subtitle ?? 'Subtitle text' }}
        </p>
      </div>
      <span class="hero-circle" aria-hidden="true" />
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
  }

  .hero-region {
    position: relative;
    min-height: 72vh;
    box-sizing: border-box;
    padding: var(--space-10) 0 var(--space-8);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    overflow: hidden;
  }

  // Decorative sun-circle — large ghost outline anchoring the sky above the title.
  .hero-circle {
    position: absolute;
    top: 8%;
    right: -8vw;
    width: clamp(14rem, 32vw, 38rem);
    height: clamp(14rem, 32vw, 38rem);
    border-radius: 50%;
    border: 1.5px solid rgba(184, 76, 54, 0.18);
    pointer-events: none;
  }

  .hero-display {
    position: relative;
    z-index: 1;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-sans);
    font-style: normal;
    font-size: var(--type-small);
    font-weight: 400;
    letter-spacing: 0.42em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  // Thin terracotta rule between kicker and title
  .hero-rule {
    display: block;
    width: 2rem;
    height: 1.5px;
    margin: var(--space-4) 0;
    background: var(--color-accent);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: clamp(3.5rem, 8vw, 8rem);
    font-family: var(--font-display);
    font-style: normal;
    font-weight: 500;
    line-height: 0.92;
    letter-spacing: 0.015em;
    color: var(--color-ink);
    text-wrap: balance;
  }

  .hero-subtitle {
    margin: var(--space-5) 0 0;
    max-width: 42rem;
    font-size: clamp(0.875rem, 1.2vw, 1.05rem);
    font-style: italic;
    font-weight: 300;
    line-height: 1.75;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      min-height: 60vh;
      padding: var(--space-9) 0 var(--space-7);
    }

    .hero-circle {
      top: 4%;
      right: -20vw;
      width: 60vw;
      height: 60vw;
    }
  }
</style>
