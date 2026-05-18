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

      <aside class="hero-diagram" aria-hidden="true">
        <p class="diagram-label">Node map</p>
        <svg
          class="diagram-svg"
          viewBox="0 0 200 160"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <!-- Connection lines -->
          <line x1="100" y1="80" x2="40" y2="30" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
          <line x1="100" y1="80" x2="168" y2="24" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
          <line x1="100" y1="80" x2="175" y2="100" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
          <line x1="100" y1="80" x2="130" y2="148" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
          <line x1="100" y1="80" x2="30" y2="120" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
          <line x1="40" y1="30" x2="168" y2="24" stroke="currentColor" stroke-width="0.8" opacity="0.12" />
          <line x1="168" y1="24" x2="175" y2="100" stroke="currentColor" stroke-width="0.8" opacity="0.12" />
          <line x1="30" y1="120" x2="130" y2="148" stroke="currentColor" stroke-width="0.8" opacity="0.12" />
          <!-- Satellite nodes -->
          <circle cx="40" cy="30" r="3.5" fill="currentColor" opacity="0.35" />
          <circle cx="168" cy="24" r="3.5" fill="currentColor" opacity="0.35" />
          <circle cx="175" cy="100" r="3.5" fill="currentColor" opacity="0.35" />
          <circle cx="130" cy="148" r="3.5" fill="currentColor" opacity="0.35" />
          <circle cx="30" cy="120" r="3.5" fill="currentColor" opacity="0.35" />
          <!-- Central node — cobalt accent -->
          <circle cx="100" cy="80" r="6" fill="#2657eb" opacity="0.8" />
          <circle cx="100" cy="80" r="10" stroke="#2657eb" stroke-width="1" opacity="0.25" fill="none" />
        </svg>
        <dl class="diagram-stats">
          <div class="stat">
            <dt>Systems</dt>
            <dd>07</dd>
          </div>
          <div class="stat">
            <dt>Active</dt>
            <dd class="stat-highlight">04</dd>
          </div>
        </dl>
      </aside>
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
    grid-template-columns: 1fr minmax(0, 18rem);
    align-items: end;
    gap: var(--space-6);
    color: var(--color-ink);
  }

  .hero-display {
    position: relative;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-style: normal;
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    font-size: clamp(2.4rem, 5vw, 4.5rem);
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 400;
    line-height: 1.02;
    letter-spacing: -0.01em;
    color: var(--color-ink);
  }

  .hero-subtitle {
    margin: var(--space-4) 0 0;
    font-size: clamp(0.875rem, 1.2vw, 1.05rem);
    font-style: normal;
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-muted);
    max-width: 36rem;
  }

  // Decorative node-map panel
  .hero-diagram {
    align-self: end;
    border: 1px solid var(--color-ink);
    border-radius: 10px;
    padding: var(--space-4);
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .diagram-label {
    margin: 0 0 var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .diagram-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .diagram-stats {
    display: flex;
    gap: var(--space-5);
    margin: var(--space-3) 0 0;
    padding-top: var(--space-3);
    border-top: 1px solid rgba(12, 17, 43, 0.1);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.2em;

    dt {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-muted);
    }

    dd {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-ink);
    }
  }

  .stat-highlight {
    color: var(--color-primary);
  }

  @include breakpoint(tablet-down) {
    .hero-region {
      grid-template-columns: 1fr;
    }

    .hero-diagram {
      display: none;
    }
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
