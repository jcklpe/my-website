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
    min-height: 50vh;
    box-sizing: border-box;
    padding: var(--space-8) 0 var(--space-7);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    background: var(--color-surface);
  }

  .hero-display {
    position: relative;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-style: italic;
    font-size: var(--type-small);
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 500;
    line-height: 0.97;
    letter-spacing: -0.04em;
    color: var(--color-ink);
    text-transform: none;
  }

  .hero-subtitle {
    margin: var(--space-3) 0 0;
    font-size: clamp(0.875rem, 1.2vw, 1.05rem);
    font-style: italic;
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      padding: var(--space-7) 0 var(--space-6);
    }
  }
</style>
