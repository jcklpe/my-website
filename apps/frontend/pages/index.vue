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
      <div class="hero-ornament" aria-hidden="true">
        <JackalopeGlitch />
      </div>
      <div class="hero-display">
        <p class="mega-text">{{ homePageContent?.megaText ?? 'B.L.U.F.' }}</p>
        <h1 class="hero-title">
          <span class="marker">{{ homePageContent?.title ?? 'Title Text' }}</span>
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
    min-height: 74vh;
    box-sizing: border-box;
    padding: var(--space-9) 0 var(--space-8);
    display: grid;
    align-content: center;
    overflow: hidden;
    color: var(--color-ink);
    background:
      radial-gradient(
        90% 70% at 50% 30%,
        rgba(38, 87, 235, 0.22) 0%,
        transparent 60%
      ),
      var(--color-surface-warm);
  }

  // Generative glitch field — fills the hero behind the title card.
  .hero-ornament {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0.85;
    pointer-events: none;
    mask-image: radial-gradient(120% 100% at 50% 50%, #000 55%, transparent 100%);
    -webkit-mask-image: radial-gradient(
      120% 100% at 50% 50%,
      #000 55%,
      transparent 100%
    );
  }

  // The rotated brush title card floats over the glitch (original hero.scss).
  .hero-display {
    position: relative;
    z-index: 1;
    justify-self: center;
    max-width: 92vw;
    text-align: center;
    transform: rotate(-4deg);
  }

  .mega-text {
    margin: 0 0 var(--space-3);
    color: var(--color-cobalt);
    @include specimen-label;

    letter-spacing: 0.32em;
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(3rem, 9vw, 7rem);
    line-height: 1.5;
    letter-spacing: 0.01em;
    text-transform: uppercase;

    .marker {
      @include marker-label;
    }
  }

  .hero-subtitle {
    max-width: 46ch;
    margin: var(--space-6) auto 0;
    font-size: clamp(1rem, 1.4vw, 1.2rem);
    font-weight: 300;
    line-height: 1.6;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      min-height: 64vh;
      padding: var(--space-7) 0 var(--space-6);
    }

    .hero-display {
      transform: rotate(-3deg);
    }
  }
</style>
