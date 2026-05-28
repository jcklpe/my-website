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
        <div class="hero-kicker-row">
          <p class="mega-text">
            {{ homePageContent?.megaText ?? 'B.L.U.F.' }}
          </p>
          <p class="system-label">Independent archive</p>
        </div>
        <h1 class="hero-title">
          {{ homePageContent?.title ?? 'Title Text' }}
        </h1>
        <p class="hero-subtitle">
          {{ homePageContent?.subtitle ?? 'Subtitle text' }}
        </p>

        <nav class="hero-index" aria-label="Home index">
          <a href="#selected-work"><span>01</span>Selected work</a>
          <a href="#latest-writing"><span>02</span>Latest writing</a>
          <NuxtLink to="/side-projects"><span>03</span>Side projects</NuxtLink>
          <NuxtLink to="/about"><span>04</span>About</NuxtLink>
        </nav>
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
    padding: var(--space-5) var(--space-6) 0;
    overflow: hidden;
    background: var(--color-stage);
    color: var(--color-stage-ink);
  }

  .hero-region {
    position: relative;
    min-height: min(74vh, 48rem);
    box-sizing: border-box;
    padding: var(--space-8) var(--space-6) var(--space-6);
    display: grid;
    align-content: end;
    color: var(--color-stage-ink);
    background:
      linear-gradient(135deg, rgba(224, 8, 18, 0.14), transparent 26rem),
      linear-gradient(
        180deg,
        var(--color-stage-elevated) 0%,
        var(--color-stage) 70%
      );
    border: 1px solid var(--color-stage-rule);
    box-shadow: inset 0 0 0 1px rgba(247, 239, 227, 0.04);
    isolation: isolate;
  }

  .hero-region::before {
    content: '';
    position: absolute;
    inset: var(--space-4) auto var(--space-4) var(--space-4);
    width: 0.35rem;
    background: var(--color-primary);
    z-index: 0;
  }

  .hero-region::after {
    content: '';
    position: absolute;
    inset: auto var(--space-5) var(--space-5) auto;
    width: min(42vw, 28rem);
    height: min(42vw, 28rem);
    border: 1px solid var(--color-stage-rule);
    opacity: 0.72;
    z-index: 0;
  }

  .hero-display {
    position: relative;
    z-index: 1;
    max-width: 68rem;
  }

  .hero-kicker-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-stage-rule);
    padding-bottom: var(--space-3);
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .system-label {
    margin: 0;
    color: var(--color-stage-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .hero-title {
    position: relative;
    z-index: 1;
    max-width: 12ch;
    margin: var(--space-5) 0 0;
    font-size: 6.5rem;
    font-family: var(--font-mono);
    font-weight: 600;
    line-height: 0.88;
    color: var(--color-stage-ink);
    text-transform: uppercase;
    text-wrap: balance;
  }

  .hero-subtitle {
    margin: var(--space-3) 0 0;
    max-width: 42rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-stage-muted);
  }

  .hero-index {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    margin-top: var(--space-7);
    background: var(--color-stage-rule);
    border: 1px solid var(--color-stage-rule);
  }

  .hero-index a {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    min-height: 4.25rem;
    padding: var(--space-3);
    background: var(--color-stage);
    color: var(--color-stage-ink);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.08em;
    text-decoration: none;
    text-transform: uppercase;
    transition:
      background 200ms var(--motion-snappy),
      color 200ms var(--motion-snappy);
  }

  .hero-index span {
    color: var(--color-primary);
  }

  .hero-index a:hover,
  .hero-index a:focus-visible {
    background: var(--color-primary);
    color: white;
  }

  .hero-index a:hover span,
  .hero-index a:focus-visible span {
    color: white;
  }

  @include breakpoint(phone) {
    .home-page {
      padding: var(--space-3) var(--space-4) 0;
    }

    .hero-region {
      min-height: 68vh;
      padding: var(--space-7) var(--space-4) var(--space-5);
    }

    .hero-title {
      font-size: 3.35rem;
    }

    .hero-region::before {
      inset: var(--space-3) auto var(--space-3) var(--space-3);
      width: 0.25rem;
    }

    .hero-region::after {
      display: none;
    }

    .hero-index {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-index a {
      transition: none;
    }
  }
</style>
