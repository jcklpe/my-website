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
    <section class="hero-region has-halftone">
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
    <hr class="op-divider" aria-hidden="true" />

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
      class="skin-marigold has-halftone"
      :testimonials="homePageContent?.employerTestimonials ?? []"
    />

    <HomeSideProjectsLink class="skin-neon" />

    <HomeLatestWritingSection
      class="skin-flame"
      :posts="posts"
      :error="Boolean(error)"
    />
  </div>
</template>

<style lang="scss" scoped>
  .home-page {
    padding-inline: var(--space-6);
  }

  .hero-region {
    position: relative;
    min-height: 64vh;
    box-sizing: border-box;
    padding: var(--space-9) 0 var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
    padding-inline: var(--space-6);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    background-color: var(--color-surface);
  }

  .hero-display {
    position: relative;
  }

  .mega-text {
    display: inline-block;
    margin: 0 0 var(--space-4);
    padding: 0.35em 0.7em;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--accent-ink);
    background: var(--accent);
    border: 2px solid var(--color-ink);
    box-shadow: var(--shadow-hard-sm);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: clamp(2.8rem, 9vw, 7rem);
    font-family: var(--font-display);
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: -0.045em;
    text-transform: uppercase;
    color: var(--color-ink);
    text-wrap: balance;
  }

  .hero-subtitle {
    max-width: 42ch;
    margin: var(--space-5) 0 0;
    font-size: clamp(1rem, 1.4vw, 1.25rem);
    font-weight: 500;
    line-height: 1.5;
    color: var(--color-ink-80);
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
