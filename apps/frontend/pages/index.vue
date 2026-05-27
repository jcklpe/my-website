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

  // Desert Jackalope port: tall solid-blue hero, description centered in white.
  .hero-region {
    min-height: 88vh;
    box-sizing: border-box;
    margin-inline: calc(var(--space-6) * -1);
    padding: var(--space-8) var(--space-6);
    display: grid;
    place-content: center;
    text-align: center;
    color: #fff;
    background: var(--color-primary);
  }

  .hero-display {
    position: relative;
    max-width: 22ch;
  }

  .mega-text {
    margin: 0 0 var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.72);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: clamp(2.6rem, 7vw, 4.5rem);
    font-family: var(--font-mono);
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: -0.02em;
    color: #fff;
    text-transform: none;
  }

  .hero-subtitle {
    margin: var(--space-5) auto 0;
    max-width: 40ch;
    font-size: clamp(0.95rem, 1.3vw, 1.15rem);
    font-weight: 400;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.82);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      min-height: 80vh;
      margin-inline: calc(var(--space-4) * -1);
      padding: var(--space-7) var(--space-4);
    }
  }
</style>
