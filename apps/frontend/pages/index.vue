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
      <div class="dispatch-banner">
        <h1
          class="dispatch-title"
          aria-label="Dispatches from the Design Machine"
        >
          Dispatches from the Design Machine
        </h1>
      </div>
      <div class="hero-display">
        <p class="mega-text">{{ homePageContent?.megaText ?? 'B.L.U.F.' }}</p>
        <p class="hero-title">
          {{ homePageContent?.title ?? 'Title Text' }}
        </p>
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
    box-sizing: border-box;
    margin-inline: calc(var(--space-6) * -1);
    color: var(--color-ink);
    background: var(--color-surface);
  }

  .dispatch-banner {
    padding: var(--space-7) var(--space-6) var(--space-6);
    border-bottom: var(--border-default);
  }

  .dispatch-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.8rem, 9vw, 11rem);
    line-height: 0.92;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  .hero-display {
    position: relative;
    padding: var(--space-7) var(--space-6) var(--space-8);
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 400;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    font-family: var(--font-mono);
    font-size: clamp(1rem, 2vw, 1.6rem);
    font-style: italic;
    font-weight: 400;
    line-height: 1.4;
    letter-spacing: 0.01em;
    color: var(--color-ink);
    max-width: 46ch;
  }

  .hero-subtitle {
    margin: var(--space-4) 0 0;
    max-width: 44ch;
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-style: italic;
    font-weight: 400;
    line-height: 1.7;
    color: var(--color-ink-80);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      margin-inline: calc(var(--space-4) * -1);
    }

    .dispatch-banner {
      padding-inline: var(--space-4);
    }

    .hero-display {
      padding-inline: var(--space-4);
      padding-bottom: var(--space-7);
    }
  }
</style>
