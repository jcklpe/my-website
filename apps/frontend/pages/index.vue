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
    min-height: 90vh;
    box-sizing: border-box;
    margin-inline: calc(var(--space-6) * -1);
    padding: var(--space-8) var(--space-6) var(--space-7);
    display: grid;
    place-items: center;
    color: white;
    background: var(--color-primary);
    text-align: center;
  }

  .hero-display {
    position: relative;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-style: normal;
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
    color: white;
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    font-size: 4rem;
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 700;
    line-height: 0.97;
    letter-spacing: 0;
    color: white;
    text-transform: none;
  }

  .hero-subtitle {
    margin: var(--space-3) 0 0;
    max-width: 42rem;
    font-size: 1.125rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.6;
    color: white;
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      margin-inline: calc(var(--space-4) * -1);
      padding: var(--space-7) var(--space-4) var(--space-6);
    }

    .hero-title {
      font-size: 2.8rem;
    }
  }
</style>
