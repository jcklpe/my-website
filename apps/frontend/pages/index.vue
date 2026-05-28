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

  // Intro gate state. The HomeIntroScreen sits on top until its animation
  // completes and emits 'done'. The page content is always rendered underneath
  // so screen readers and crawlers see it immediately (aria-hidden on the overlay).
  const introVisible = ref(true);
  const firstCaseStudy = computed(() => caseStudies.value?.[0] ?? null);

  function onIntroDone() {
    introVisible.value = false;
  }
</script>

<template>
  <div class="home-page">
    <!-- Cinematic intro overlay — sits on top until animation completes. -->
    <HomeIntroScreen
      v-if="introVisible"
      :first-case-study="firstCaseStudy"
      @done="onIntroDone"
    />

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

  // Display font for the hero title — Cormorant Italic at large scale,
  // echoing the intro screen's identity mark.
  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    font-size: clamp(3rem, 6vw, 6.5rem);
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 300;
    line-height: 0.92;
    letter-spacing: -0.02em;
    color: var(--color-display);
  }

  .hero-subtitle {
    margin: var(--space-4) 0 0;
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
