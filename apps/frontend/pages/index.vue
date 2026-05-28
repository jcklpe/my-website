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
    min-height: 100svh;
    box-sizing: border-box;
    padding: var(--space-8) 0 var(--space-8);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    background: var(--color-surface);
    margin-inline: calc(var(--space-6) * -1);
    padding-inline: var(--space-6);
  }

  .hero-display {
    position: relative;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-display);
    font-style: normal;
    font-weight: 400;
    font-size: clamp(14vw, 18vw, 22rem);
    line-height: 0.88;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-4) 0 0;
    font-size: clamp(1.4rem, 3.5vw, 3rem);
    font-family: var(--font-condensed);
    font-style: normal;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  .hero-subtitle {
    margin: var(--space-3) 0 0;
    font-size: clamp(0.875rem, 1.2vw, 1.05rem);
    font-style: normal;
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      padding: var(--space-7) var(--space-4) var(--space-7);
      margin-inline: calc(var(--space-4) * -1);
    }

    .mega-text {
      font-size: clamp(18vw, 22vw, 14rem);
    }
  }
</style>
