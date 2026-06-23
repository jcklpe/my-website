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

  // Featured-media transition choreography for the home surface: the elements
  // around the clicked card assemble out (forward) and back in (reverse). See
  // useHomeTransitionChoreography + useFeaturedMediaTransition.
  const transitionState = useFeaturedMediaTransitionState();
  const { animateSurroundings } = useHomeTransitionChoreography();

  watch(
    () => transitionState.value.active,
    (isActive, wasActive) => {
      // Forward departure: a transition started while home is mounted → the
      // surroundings assemble out around the card lifting off. (Arrival has
      // `active` true already at mount, so this only catches departures.)
      if (isActive && !wasActive && transitionState.value.key) {
        animateSurroundings('out');
      }
    },
  );

  watch(
    () => transitionState.value.surroundingsCue,
    (cue) => {
      // Reverse arrival: the composable cues this once the destination card has
      // been scrolled into view, so the surroundings assemble in around the
      // card where it actually lands (not where it sat below the fold at mount).
      if (cue && transitionState.value.active && transitionState.value.key) {
        animateSurroundings('in');
      }
    },
  );
</script>

<template>
  <div class="home-page">
    <section class="hero-region" aria-labelledby="home-hero-title">
      <div class="hero-display">
        <span class="hero-badge">
          <span class="hero-kicker">B.L.U.F.</span>
          <span class="hero-star" aria-hidden="true">✦</span>
        </span>

        <h1 id="home-hero-title" class="hero-title">
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
      :testimonials-texture="homePageContent?.testimonialsTexture ?? 'dots'"
    />

    <HomeSideProjectsLink />

    <HomeLatestWritingSection :posts="posts" :error="Boolean(error)" />
  </div>
</template>

<style lang="scss" scoped>
  .home-page {
    padding-inline: var(--space-6);
    background: var(--texture-paper-grid);
    background-size: var(--texture-paper-grid-size);
  }

  // Framed panel — pale-blue blueprint-field gradient, ink window border, low
  // printed shadow. Full-width by design (no width cap).
  .hero-region {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    margin: var(--space-6) 0 0;
    padding: var(--space-7);
    color: var(--color-ink);
    background: var(--texture-blueprint-field);
    background-size: var(--texture-blueprint-field-size);
    border: var(--border-window);
    box-shadow: var(--shadow-hard-low);
  }

  // Target / radar diagram — sits in the upper-right negative space as a biggish
  // blueprint annotation behind the wordmark (z-index 0; the stage is z-index 1),
  // adding texture beneath the type. Two layers: a dotted-ring crosshatch disc
  // and a thin crosshair circle, each lightly rotated.
  .hero-region::before,
  .hero-region::after {
    content: '';
    position: absolute;
    top: var(--space-5);
    right: var(--space-6);
    z-index: 0;
    width: min(42vw, 30rem);
    aspect-ratio: 1;
    pointer-events: none;
  }

  .hero-region::before {
    border: 1px solid var(--color-primary);
    background:
      radial-gradient(
        circle,
        transparent 0 18%,
        var(--color-primary) 18.4% 19%,
        transparent 19.4%
      ),
      repeating-radial-gradient(
        circle,
        transparent 0 13%,
        var(--color-signal-soft) 13.2% 13.7%,
        transparent 14% 22%
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0 1.2rem,
        var(--color-signal-soft) 1.25rem 1.32rem,
        transparent 1.38rem 2.4rem
      ),
      repeating-linear-gradient(
        90deg,
        transparent 0 1.2rem,
        var(--color-signal-soft) 1.25rem 1.32rem,
        transparent 1.38rem 2.4rem
      );
    opacity: 0.5;
    transform: rotate(-8deg);
  }

  .hero-region::after {
    border-radius: 50%;
    background:
      linear-gradient(var(--color-primary), var(--color-primary)) 50% 0 / 1px
        100% no-repeat,
      linear-gradient(90deg, var(--color-primary), var(--color-primary)) 0 50% /
        100% 1px no-repeat;
    opacity: 0.45;
    transform: rotate(14deg);
  }

  // Composition — the three pieces are absolutely positioned so they cluster
  // and overlap as a single graphic unit: "Bottom" upper-right, "Line" pulled
  // up so its L-flourish overlaps Bottom's descenders, "Up Front" tucked into
  // the negative space lower-right. Positions here are the reference pixels
  // (Phase 1 port); Phase 2 converts the locked composition to cqw so the whole
  // unit scales with the hero container. See docs/hero-typography.todo.md.
  .hero-display {
    // Approach C: the wordmark is laid out against a reference design canvas (in
    // px) and every position + font-size is expressed in cqw against that canvas,
    // so the whole composition scales as one locked unit with the container.
    // --hero-canvas-w is the master size knob: SMALLER width = BIGGER wordmark
    // (fills more of the container). --hero-canvas-h sets the stage aspect/height.
    --hero-canvas-w: 740;
    // Box height in design-canvas units. The wordmark is absolutely positioned
    // (it adds no height of its own), so this value alone sets the box height —
    // it must sit just past the lowest descender ("Line" swash). Lower = shorter
    // box / less bottom whitespace; too low clips the swash against overflow.
    --hero-canvas-h: 295;
    // Hard ceiling on hero height. Height scales with width, so a wide viewport
    // could otherwise push the box past the screen. Capping the stage WIDTH by a
    // vh-derived value keeps the rendered height <= this many vh (the type scales
    // down with it, no clipping). Only engages on wide/short viewports; otherwise
    // the panel stays full width.
    --hero-max-vh: 92vh;
    container-type: inline-size;
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: calc(
      var(--hero-max-vh) * var(--hero-canvas-w) / var(--hero-canvas-h)
    );
    margin-inline: auto;
    aspect-ratio: var(--hero-canvas-w) / var(--hero-canvas-h);
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

  // display: contents so the three spans are the h1's layout children directly,
  // each absolutely positioned against .hero-display.
  .hero-title {
    display: contents;
    margin: 0;
    color: var(--color-ink);
  }

  // Design-canvas px → cqw: each value is its reference pixel divided by the
  // canvas width, times 100cqw, so all of them scale together with the stage.
  .title-script {
    position: absolute;
    margin: 0;
    font-family: var(--font-edwardian);
    font-style: normal;
    font-weight: 400;
    font-size: calc(192 / var(--hero-canvas-w) * 100cqw); // 12rem reference
    line-height: 0.8;
    // Edwardian Script ITC is a connecting script — its kerning pairs and the
    // contextual / discretionary ligatures in the font are what align the joins
    // between glyphs (e.g. i→n in "Line", o→m in "Bottom"). Force them on, and
    // let the font's own designed metrics decide spacing rather than overriding
    // it with negative letter-spacing.
    letter-spacing: normal;
    font-kerning: normal;
    font-feature-settings:
      'kern' 1,
      'liga' 1,
      'clig' 1,
      'calt' 1,
      'dlig' 1;
    font-variant-ligatures: common-ligatures contextual discretionary-ligatures;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--color-primary);
    text-transform: none;
    white-space: nowrap;
    pointer-events: none;
    transform-origin: center;
  }

  .title-script-1 {
    top: calc(40 / var(--hero-canvas-w) * 100cqw);
    left: calc(220 / var(--hero-canvas-w) * 100cqw);
    transform: rotate(-3deg);
  }

  .title-script-2 {
    top: calc(130 / var(--hero-canvas-w) * 100cqw);
    left: calc(55 / var(--hero-canvas-w) * 100cqw);
    transform: rotate(-3deg);
  }

  .title-serif {
    position: absolute;
    top: calc(170 / var(--hero-canvas-w) * 100cqw);
    left: calc(370 / var(--hero-canvas-w) * 100cqw);
    margin: 0;
    font-family: var(--font-bodoni);
    font-style: normal;
    font-weight: 400;
    font-synthesis: none;
    font-size: calc(80 / var(--hero-canvas-w) * 100cqw); // 5rem reference
    line-height: 0.96;
    letter-spacing: 0;
    color: var(--color-ink);
    text-transform: uppercase;
    white-space: nowrap;
  }

  // Phone — keep the same cqw composition, just scaled down with the container.
  // The wordmark stays a wordmark; we tighten the panel's outer padding and give
  // the stage a more square aspect so the hero reads as a statement rather than
  // a thin band, and "Up Front" grows into the new vertical room as the anchor.
  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-3);
    }

    .hero-region {
      margin-top: var(--space-3);
      padding: var(--space-3);
    }

    .hero-display {
      // Slightly more square than desktop (was 2.51:1, now ~1.95:1) — fills a bit
      // more viewport height on phone without becoming a square.
      --hero-canvas-h: 380;
    }

    .title-script-2 {
      // Pull "Line" closer to the left edge on phone — the desktop's left:55
      // proportion reads as too much breathing room at small size.
      left: calc(20 / var(--hero-canvas-w) * 100cqw);
    }

    // Target diagram is vw-sized but the wordmark is cqw-sized, so on a narrow
    // panel the target goes out of proportion (bigger relative to the text than
    // on desktop) and reads as a noisy backdrop instead of texture. Lighten and
    // shrink it on phone so it stays subordinate to the type.
    .hero-region::before {
      width: min(36vw, 14rem);
      opacity: 0.28;
    }

    .hero-region::after {
      width: min(36vw, 14rem);
      opacity: 0.22;
    }

    .title-serif {
      // "Up Front" sits next to Line/Bottom on phone (not below them) and grows
      // to about 1.75× its desktop reference so it carries weight at small size.
      top: calc(200 / var(--hero-canvas-w) * 100cqw);
      font-size: calc(140 / var(--hero-canvas-w) * 100cqw);
    }
  }
</style>
