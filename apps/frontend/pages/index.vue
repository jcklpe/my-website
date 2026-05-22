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
      <div class="hero-bloom" aria-hidden="true">
        <HarmonographOrnament :seed="7" :curves="3" />
      </div>
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

  // The hero is the one dark cosmic-jewel set-piece at the top of the site:
  // dream-organism linework blooming behind iridescent display type.
  .hero-region {
    --color-focus: var(--color-iris-orchid);

    position: relative;
    min-height: 64vh;
    box-sizing: border-box;
    margin-inline: calc(var(--space-6) * -1);
    padding: var(--space-9) var(--space-6) var(--space-8);
    display: grid;
    align-content: end;
    overflow: hidden;
    color: var(--color-cosmic-ink);
    background:
      radial-gradient(
        120% 90% at 78% 18%,
        rgba(111, 139, 224, 0.22),
        transparent 60%
      ),
      radial-gradient(
        90% 80% at 12% 92%,
        rgba(199, 125, 208, 0.18),
        transparent 55%
      ),
      var(--color-cosmic);
  }

  .hero-bloom {
    position: absolute;
    top: 50%;
    right: clamp(-8rem, -2vw, 0rem);
    width: clamp(22rem, 48vw, 44rem);
    aspect-ratio: 1;
    translate: 0 -52%;
    opacity: 0.5;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .hero-display {
    position: relative;
    z-index: 1;
  }

  .mega-text {
    margin: 0;
    color: var(--color-gold);
    @include specimen-label;
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-4) 0 0;
    max-width: 18ch;
    font-family: var(--font-display);
    font-variation-settings: var(--type-heading-variation-display);
    font-size: clamp(2.6rem, 6.5vw, 5rem);
    font-weight: 460;
    line-height: 0.98;
    letter-spacing: -0.02em;
    text-wrap: balance;
    @include iris-text(var(--color-cosmic-ink));
    @include iris-text-drift;
  }

  .hero-subtitle {
    max-width: 42ch;
    margin: var(--space-5) 0 0;
    font-size: clamp(0.95rem, 1.2vw, 1.15rem);
    font-weight: 400;
    line-height: 1.65;
    color: var(--color-cosmic-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      margin-inline: calc(var(--space-4) * -1);
      padding: var(--space-8) var(--space-4) var(--space-7);
    }

    .hero-bloom {
      width: 26rem;
      opacity: 0.4;
    }
  }
</style>
