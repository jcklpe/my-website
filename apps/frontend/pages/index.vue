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
  }

  .hero-region {
    // Break out of .home-page padding to go full-bleed blue.
    margin-inline: calc(var(--space-6) * -1);
    min-height: 90vh;
    box-sizing: border-box;
    padding: var(--space-8) var(--space-6);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    background: var(--color-primary);
  }

  .hero-display {
    position: relative;
  }

  .mega-text {
    margin: 0 0 var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: clamp(2.8rem, 6vw, 4rem);
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: white;
    text-transform: none;
  }

  .hero-subtitle {
    margin: var(--space-4) 0 0;
    max-width: 38rem;
    font-size: clamp(0.875rem, 1.2vw, 1.05rem);
    font-weight: 400;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      margin-inline: calc(var(--space-4) * -1);
      min-height: 80vh;
      padding: var(--space-7) var(--space-4);
    }

    .hero-title {
      font-size: 2.8rem;
    }
  }
</style>
