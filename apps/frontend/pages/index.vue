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
      <span class="hero-watermark" aria-hidden="true">{{
        homePageContent?.megaText ?? 'B.L.U.F.'
      }}</span>
      <div class="hero-display">
        <p class="hero-eyebrow">{{
          homePageContent?.megaText ?? 'B.L.U.F.'
        }}</p>
        <h1 class="hero-title">
          {{ homePageContent?.title ?? 'Bottom Line Up Front' }}
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

  // Hero is a framed panel — periwinkle paper-grid texture, thin ink border,
  // low printed shadow. The watermark is a script-set B.L.U.F. that sits
  // behind everything at low opacity.
  .hero-region {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    margin-top: var(--space-6);
    min-height: 56vh;
    padding: var(--space-8) var(--space-7) var(--space-7);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    background: var(--texture-paper-grid);
    background-size: var(--texture-paper-grid-size);
    border: var(--border-window);
    box-shadow: var(--shadow-hard-low);
  }

  // The script watermark. Massive Italianno (Edwardian-feel) glyph behind
  // everything at low opacity. Positioned absolutely so it can break out of
  // the text flow.
  .hero-watermark {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-script);
    font-size: clamp(8rem, 22vw, 22rem);
    line-height: 0.85;
    color: var(--color-primary);
    opacity: 0.16;
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    letter-spacing: -0.02em;
  }

  .hero-display {
    position: relative;
    z-index: 1;
    display: grid;
    gap: var(--space-3);
  }

  // The IBM Plex Mono Italic kicker — small mono italic label above the
  // display title. Reads as the kicker/eyebrow.
  .hero-eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-style: italic;
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  // The display title — Bodoni Moda 700, normal style, generous size. This is
  // the visual front door of the page.
  .hero-title {
    margin: 0;
    font-family: var(--font-display-serif);
    font-style: normal;
    font-weight: 700;
    font-size: clamp(2.75rem, 6.5vw, 5.5rem);
    line-height: 0.96;
    letter-spacing: -0.02em;
    color: var(--color-ink);
    text-transform: none;
  }

  .hero-subtitle {
    margin: var(--space-3) 0 0;
    max-width: 42ch;
    font-family: var(--font-sans);
    font-size: clamp(0.95rem, 1.2vw, 1.1rem);
    font-style: normal;
    font-weight: 400;
    line-height: 1.55;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      margin-top: var(--space-4);
      padding: var(--space-6) var(--space-5) var(--space-5);
      min-height: 44vh;
    }

    .hero-watermark {
      font-size: clamp(6rem, 32vw, 14rem);
    }
  }
</style>
