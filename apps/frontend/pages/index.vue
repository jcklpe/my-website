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

  // Hero composition is hardcoded to "Bottom Line / Up Front" because the
  // three pieces each get a different typographic voice (Bodoni Z37 for the
  // UP FRONT serif anchor, Edwardian Script ITC for the script "Bottom" and
  // "Line", IBM Plex Mono Italic for the B.L.U.F. corner badge). The CMS
  // `title`, `megaText`, and `subtitle` fields are intentionally not driving
  // the hero rendering — the typography is the design.
</script>

<template>
  <div class="home-page">
    <section class="hero-region">
      <div class="hero-display">
        <span class="hero-badge">
          <span class="hero-kicker">B.L.U.F.</span>
          <span class="hero-star" aria-hidden="true">✦</span>
        </span>

        <h1 class="hero-title">
          <span class="title-script title-script-1">Bottom</span>
          <span class="title-script title-script-2">Line</span>
          <span class="title-serif">Up Front</span>
        </h1>
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

  // Hero is a framed panel — periwinkle paper-grid texture, ink-window border,
  // low printed shadow. Composition modeled on the Signal Garden reference:
  // a script phrase ("Bottom Line") breaks across two lines with a diagonal
  // stagger, a Bodoni serif "Up Front" anchors below it, and a small
  // mono-italic badge with a star ornament sits in the upper-right corner.
  .hero-region {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    margin-top: var(--space-6);
    min-height: 60vh;
    padding: var(--space-7);
    color: var(--color-ink);
    background: var(--texture-paper-grid);
    background-size: var(--texture-paper-grid-size);
    border: var(--border-window);
    box-shadow: var(--shadow-hard-low);
  }

  // Composition — the three pieces are absolutely positioned so they cluster
  // and overlap as a single graphic unit (rather than spreading to opposite
  // edges of a grid). "Bottom" sits upper-right, "Line" sits center-left and
  // pulls up so its L-flourish overlaps Bottom's descenders, and "Up Front"
  // tucks into the negative space lower-right. Positioning lives in
  // top/left/right so `transform` is free to carry the script rotation.
  .hero-display {
    position: relative;
    z-index: 1;
    min-height: clamp(22rem, 52vh, 40rem);
  }

  .hero-badge {
    position: absolute;
    top: 0;
    right: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-primary);
    border-radius: 999px;
    color: var(--color-primary);
  }

  .hero-kicker {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: italic;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: inherit;
  }

  .hero-star {
    font-size: 1rem;
    line-height: 1;
    color: var(--color-primary);
  }

  .hero-title {
    display: contents;
    margin: 0;
    color: var(--color-ink);
  }

  // Script — Edwardian Script ITC at display size, periwinkle. nowrap keeps
  // each word on one line; the subtle rotation gives the pair a hand-set,
  // slightly-tilted baseline.
  .title-script {
    position: absolute;
    margin: 0;
    font-family: var(--font-script);
    font-style: normal;
    font-weight: 400;
    font-size: clamp(4.5rem, 13vw, 12rem);
    line-height: 0.8;
    letter-spacing: -0.01em;
    color: var(--color-primary);
    text-transform: none;
    white-space: nowrap;
    pointer-events: none;
    transform-origin: center;
  }

  .title-script-1 {
    top: 100px;
    left: 220px;
    transform: rotate(-3deg);
  }

  .title-script-2 {
    top: 190px;
    left: 55px;
    transform: rotate(-3deg);
  }

  // Up Front — Bodoni Z37 ALL CAPS, tucked lower-right into the negative
  // space beneath "Bottom" and to the right of "Line".
  .title-serif {
    position: absolute;
    top: 230px;
    left: 370px;
    margin: 0;
    font-family: var(--font-display-serif);
    font-style: normal;
    font-weight: 700;
    font-size: clamp(2.25rem, 6vw, 5rem);
    line-height: 0.96;
    letter-spacing: -0.005em;
    color: var(--color-ink);
    text-transform: uppercase;
    white-space: nowrap;
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      margin-top: var(--space-4);
      padding: var(--space-5);
      min-height: auto;
    }

    // Drop the absolute composition on small screens — stack the pieces in
    // normal flow so nothing clips off the panel edges.
    .hero-display {
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-1);
    }

    .hero-badge,
    .title-script-1,
    .title-script-2,
    .title-serif {
      position: static;
      transform: none;
    }

    .hero-badge {
      align-self: flex-end;
      margin-bottom: var(--space-5);
    }

    .title-script {
      font-size: clamp(3.5rem, 24vw, 7rem);
    }

    .title-script-2 {
      margin-inline-start: var(--space-6);
      margin-block-start: calc(var(--space-4) * -1);
    }

    .title-serif {
      margin-top: var(--space-3);
      font-size: clamp(1.75rem, 11vw, 3.5rem);
    }
  }
</style>
