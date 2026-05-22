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
      <OrganicRadial
        class="hero-ornament"
        :lines="24"
        :size="600"
        :opacity="0.06"
        color="var(--color-ink)"
      />
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
    position: relative;
    min-height: 60vh;
    box-sizing: border-box;
    padding: var(--space-8) 0 var(--space-7);
    display: grid;
    align-content: end;
    overflow: hidden;
    color: var(--color-ink);
    background: var(--color-surface);
  }

  .hero-ornament {
    position: absolute;
    top: 50%;
    right: -8%;
    transform: translateY(-50%);
    pointer-events: none;
    user-select: none;
  }

  .hero-display {
    position: relative;
    z-index: 1;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-style: normal;
    font-size: var(--type-small);
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--color-accent-teal);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    font-size: clamp(3rem, 8vw, 7rem);
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 400;
    line-height: 0.96;
    letter-spacing: -0.01em;
    color: var(--color-ink);
  }

  .hero-subtitle {
    margin: var(--space-4) 0 0;
    font-family: var(--font-sans);
    font-size: clamp(1rem, 1.4vw, 1.2rem);
    font-style: italic;
    font-weight: 400;
    line-height: 1.65;
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
