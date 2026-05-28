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

  // Full-bleed navy slab hero — the bold editorial opening.
  .hero-region {
    min-height: 64vh;
    box-sizing: border-box;
    margin-inline: calc(var(--space-6) * -1);
    padding: var(--space-9) var(--space-6) var(--space-8);
    display: grid;
    align-content: end;
    color: var(--color-on-slab);
    background: var(--color-slab-navy);
  }

  .hero-display {
    position: relative;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 400;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--color-on-slab-muted);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-4) 0 0;
    max-width: 18ch;
    font-family: var(--font-display);
    font-size: clamp(2.6rem, 7vw, 6rem);
    font-weight: 600;
    line-height: 0.95;
    letter-spacing: -0.01em;
    text-transform: uppercase;
    color: var(--color-on-slab);
  }

  .hero-subtitle {
    margin: var(--space-5) 0 0;
    max-width: 46ch;
    font-size: clamp(1rem, 1.2vw, 1.2rem);
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-on-slab-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      min-height: 58vh;
      margin-inline: calc(var(--space-4) * -1);
      padding: var(--space-8) var(--space-4) var(--space-7);
    }
  }
</style>
