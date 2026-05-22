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
    position: relative;
    overflow: hidden;
    padding-inline: var(--space-6);
  }

  .hero-region {
    position: relative;
    min-height: 58vh;
    box-sizing: border-box;
    padding: var(--space-8) 0 var(--space-8);
    display: grid;
    align-content: end;
    color: var(--color-ink);
  }

  .hero-region::before {
    position: absolute;
    top: var(--space-7);
    right: clamp(0rem, 7vw, 7rem);
    width: clamp(9rem, 22vw, 18rem);
    aspect-ratio: 1;
    border: 1px solid var(--color-primary-tint);
    border-radius: 50%;
    background:
      linear-gradient(var(--color-primary-tint), var(--color-primary-tint)) 50%
        0 / 1px 100% no-repeat,
      linear-gradient(
          90deg,
          var(--color-primary-tint),
          var(--color-primary-tint)
        )
        0 50% / 100% 1px no-repeat,
      repeating-radial-gradient(
        circle,
        transparent 0 42%,
        var(--color-primary-tint) 42% 43%,
        transparent 43% 58%
      );
    content: '';
    pointer-events: none;
  }

  .hero-region::after {
    position: absolute;
    right: calc(var(--space-6) * -1);
    bottom: var(--space-6);
    width: min(42rem, 58vw);
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-gold),
      transparent
    );
    content: '';
    pointer-events: none;
  }

  .hero-display {
    position: relative;
    max-width: 68rem;
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-slip-border);
  }

  .hero-display::before {
    position: absolute;
    top: calc(var(--space-1) * -1);
    left: min(54vw, 34rem);
    width: 0.65rem;
    height: 0.65rem;
    border: 1px solid var(--color-coral);
    border-radius: 50%;
    background: var(--color-surface);
    content: '';
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
    max-width: 13ch;
    font-size: clamp(3.75rem, 10vw, 9rem);
    font-family: var(--font-display);
    font-weight: 600;
    line-height: 0.82;
    letter-spacing: 0;
    color: var(--color-ink);
    text-transform: none;
  }

  .hero-subtitle {
    max-width: 38rem;
    margin: var(--space-5) 0 0;
    font-size: var(--type-large);
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-ink-80);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      padding: var(--space-7) 0 var(--space-6);
    }

    .hero-region::before {
      top: var(--space-5);
      right: calc(var(--space-4) * -1);
      opacity: 0.62;
    }

    .hero-title {
      font-size: clamp(3rem, 18vw, 5.6rem);
    }
  }
</style>
