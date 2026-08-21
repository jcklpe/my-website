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
  const isDevelopment = import.meta.dev;
  const blufMenuOpen = ref(false);

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
    <HomeReactionDiffusionBackground />
    <HomeMotionDebugControls v-if="isDevelopment" />

    <section class="home-intro" aria-labelledby="home-hero-title">
      <div class="hero-region">
        <span class="hero-field" aria-hidden="true" />

        <div class="hero-badge" :class="{ 'is-open': blufMenuOpen }">
          <button
            class="hero-badge-trigger"
            type="button"
            :aria-expanded="blufMenuOpen"
            aria-controls="home-bluf-panel"
            @click="blufMenuOpen = !blufMenuOpen"
          >
            <span class="hero-kicker">B.L.U.F.</span>
            <span class="hero-star" aria-hidden="true">✦</span>
          </button>
          <div
            v-if="blufMenuOpen"
            id="home-bluf-panel"
            class="hero-badge-panel"
          >
            <p>
              <strong>Bottom Line Up Front.</strong> Lead with the useful
              conclusion, then make the reasoning available. It reflects how I
              approach design and technical work: clarity first, depth on
              demand.
            </p>
            <nav aria-label="Homepage sections">
              <a href="#selected-work">Selected work</a>
              <a href="#collaborators">Collaborators</a>
              <a href="#side-projects">Side projects</a>
              <a href="#latest-writing">Latest writing</a>
            </nav>
          </div>
        </div>

        <div class="hero-display">
          <h1 id="home-hero-title" class="hero-title">
            <span class="title-script title-script-1">Bottom</span>
            <span class="title-script title-script-2">Line</span>
            <span class="title-serif">Up Front</span>
          </h1>
        </div>
      </div>

      <figure class="portrait-sheet">
        <img
          :src="
            homePageContent?.heroPortrait ?? '/images/home-portrait-mock.webp'
          "
          :alt="homePageContent?.heroPortraitAlt ?? 'Portrait of Aslan French'"
          width="819"
          height="1024"
        />
      </figure>

      <HomeVitalInfo
        class="intro-vital"
        :tagline="
          homePageContent?.aboutTagline ??
          'This is the website of Aslan French, design technologist and researcher.'
        "
        :quick-links="homePageContent?.quickLinks ?? []"
      />
    </section>

    <HomeSelectedWorkSection
      :case-studies="caseStudies"
      :error="Boolean(caseStudiesError)"
    />

    <HomeEmployerTestimonials
      :testimonials="homePageContent?.employerTestimonials ?? []"
      :testimonials-texture="homePageContent?.testimonialsTexture ?? 'dots'"
    />

    <HomeSideProjectsLink
      :heading="
        homePageContent?.sideProjectsHeading ??
        'Experiments, prototypes, and smaller builds.'
      "
    />

    <HomeLatestWritingSection :posts="posts" :error="Boolean(error)" />
  </div>
</template>

<style lang="scss" scoped>
  .home-page {
    box-sizing: border-box;
    width: 100%;
    // Clip (never `hidden`) so the deliberately bleeding hero pieces — the
    // portrait bleed, the -5vw blueprint field — cannot create sideways scroll
    // on phones. The margin then lets glyphs that overhang the stage, notably
    // the final e of "Line" in Safari, still paint. `clip` never scrolls, so
    // widening the region costs nothing; anything past the viewport is simply
    // not visible.
    overflow-x: clip;
    overflow-clip-margin: 4rem;
    padding-inline: var(--space-6);
    background: var(--texture-paper-grid);
    background-size: var(--texture-paper-grid-size);
    // Stacking context so the fixed reaction-diffusion canvas (z-index: -1) sits
    // above this paper-grid background but below all in-flow content.
    isolation: isolate;
  }

  .home-intro {
    position: relative;
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    padding-bottom: 0;
  }

  // Unframed opening composition. The parent atlas ground carries through the
  // hero while a fading blueprint band supplies the stronger opening register.
  .hero-region {
    --hero-page-gutter: var(--space-6);
    position: relative;
    overflow: visible;
    box-sizing: border-box;
    grid-column: 1 / -1;
    margin: var(--space-6) 0 0;
    padding: var(--space-6) var(--space-7) 0;
    color: var(--color-ink);
    background: transparent;
  }

  .hero-field {
    position: absolute;
    inset: calc(-1 * var(--hero-page-gutter)) calc(-1 * var(--hero-page-gutter))
      0;
    // Behind the reaction-diffusion skin (z-index -1) so the RD reads over the
    // blueprint gradient, while both stay above the paper-grid and below content.
    z-index: -2;
    pointer-events: none;
    background: var(--texture-blueprint-field);
    background-position: top center;
    background-size: var(--texture-blueprint-field-size);
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 0%,
      #000 38%,
      transparent 90%
    );
    mask-image: linear-gradient(to bottom, #000 0%, #000 38%, transparent 90%);
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
    --hero-canvas-h: 225;
    // Hard ceiling on hero height. Height scales with width, so a wide viewport
    // could otherwise push the box past the screen. Capping the stage WIDTH by a
    // vh-derived value keeps the rendered height <= this many vh (the type scales
    // down with it, no clipping). Only engages on wide/short viewports; otherwise
    // the panel stays full width.
    --hero-max-vh: 92vh;
    container-type: inline-size;
    position: relative;
    z-index: calc(var(--z-high) + 1);
    width: min(100%, 108rem);
    max-width: calc(
      var(--hero-max-vh) * var(--hero-canvas-w) / var(--hero-canvas-h)
    );
    margin-left: 0;
    aspect-ratio: var(--hero-canvas-w) / var(--hero-canvas-h);
  }

  .portrait-sheet {
    position: absolute;
    box-sizing: border-box;
    // Raised 50px to sit snugger under the wordmark.
    top: calc(clamp(20rem, 20.5vw, 25rem) - 50px);
    // Shifted 5px toward the edge so the portrait's left border splits the T of
    // UP FRONT down its centre (the two scale together, so this constant offset
    // holds the split across widths).
    right: calc(clamp(var(--space-6), 4vw, var(--space-8)) - 5px);
    z-index: var(--z-high);
    width: min(30vw, 32rem);
    margin: 0;
    overflow: hidden;
    border: var(--border-window);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
  }

  .portrait-sheet img {
    display: block;
    width: 100%;
    height: auto;
  }

  .intro-vital {
    position: relative;
    box-sizing: border-box;
    z-index: var(--z-high);
    grid-column: 1 / span 8;
    // Raised toward the wordmark, but by a width-scaled amount rather than a
    // fixed offset: the wordmark scales with the viewport, so a constant raise
    // reads as too much at narrower desktop widths (crowding Line/Up Front while
    // leaving a big gap to Selected Work). This eases from ~-40px at the widest
    // toward zero as the view narrows, so the card stays balanced.
    margin-top: clamp(-42px, calc(40px - 4.2vw), 8px);
    margin-left: clamp(var(--space-4), 2vw, var(--space-6));
  }

  .hero-badge {
    position: absolute;
    top: var(--space-7);
    right: var(--space-7);
    z-index: var(--z-higher);
    color: var(--color-primary);
  }

  .hero-badge-trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-primary);
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-surface) 88%, transparent);
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .hero-badge-trigger:hover,
  .hero-badge-trigger:focus-visible,
  .hero-badge.is-open .hero-badge-trigger {
    color: var(--color-surface);
    background: var(--color-primary);
  }

  .hero-badge-panel {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    box-sizing: border-box;
    width: min(24rem, calc(100vw - var(--space-8)));
    padding: var(--space-4);
    border: var(--border-window);
    background: var(--color-surface);
    box-shadow: var(--shadow-hard-low);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    line-height: 1.45;
  }

  .hero-badge-panel p {
    margin: 0;
  }

  .hero-badge-panel nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem var(--space-3);
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-primary);
  }

  .hero-badge-panel a {
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
    display: inline-block;
    font-size: 1rem;
    line-height: 1;
    color: inherit;
    transform: scaleX(0.76);
    transform-origin: 50% 52%;
    animation: hero-badge-star 7s linear infinite;
  }

  @keyframes hero-badge-star {
    from {
      transform: rotate(0) scaleX(0.76);
    }

    to {
      transform: rotate(1turn) scaleX(0.76);
    }
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
    top: calc(-22 / var(--hero-canvas-w) * 100cqw);
    left: calc(150 / var(--hero-canvas-w) * 100cqw);
    font-size: calc(202 / var(--hero-canvas-w) * 100cqw);
    transform: rotate(-3deg);
  }

  .title-script-2 {
    top: calc(65 / var(--hero-canvas-w) * 100cqw);
    left: calc(-23 / var(--hero-canvas-w) * 100cqw);
    transform: rotate(-3deg);
  }

  .title-serif {
    position: absolute;
    top: calc(122 / var(--hero-canvas-w) * 100cqw);
    left: calc(296 / var(--hero-canvas-w) * 100cqw);
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

  // Tablet and narrow desktop use a taller lockup rather than shrinking the
  // wide composition. The intro sheets then share a grid row so Vital Info can
  // overlap the portrait without either becoming an absolutely positioned
  // height liability.
  @media (min-width: 768px) and (max-width: 1199px) {
    // Trim the hero's own side padding on tablet so the wordmark stage spans
    // wider — this both enlarges the type and lets Line's L / Bottom's m reach
    // closer to the browser edges.
    .hero-region {
      padding-inline: var(--space-3);
    }

    .hero-display {
      // Tablet keeps the stage full-width so the composition can reach the
      // browser edges (Line to the left, Bottom's "m" to the right). Size is
      // controlled by the wider canvas rather than by leashing the stage: a
      // larger --hero-canvas-w means the cqw-scaled type stays contained even
      // though the stage tracks the viewport width.
      --hero-canvas-w: 1000;
      --hero-canvas-h: 470;
      width: 100%;
      max-width: none;
    }

    // Big type on a full-width stage: the words stay large in the center and
    // only their outer extremes travel to the edges. Font size is set
    // independently of the position numbers so the cluster can be dense
    // without the type being small.
    .title-script {
      font-size: calc(300 / var(--hero-canvas-w) * 100cqw);
    }

    // Bottom — larger than Line (its own size) so its "m" fills out to the
    // right edge; sits high with the B over the "ine" of Line but clear of the
    // far-left L (no tangent).
    .title-script-1 {
      top: calc(10 / var(--hero-canvas-w) * 100cqw);
      left: calc(110 / var(--hero-canvas-w) * 100cqw);
      font-size: calc(345 / var(--hero-canvas-w) * 100cqw);
    }

    // Line — pulled hard to the left edge, dropped just clear of Bottom so the
    // two read as a tight stack without their glyphs overlapping.
    .title-script-2 {
      top: calc(260 / var(--hero-canvas-w) * 100cqw);
      left: calc(-40 / var(--hero-canvas-w) * 100cqw);
    }

    // Up Front — sits in the pocket below Bottom; sized so it spans the portrait
    // with a hair of clearance: U flush with the portrait's left edge, T just
    // inside its right rather than tangent to the browser cut-off.
    .title-serif {
      top: calc(246 / var(--hero-canvas-w) * 100cqw);
      left: calc(500 / var(--hero-canvas-w) * 100cqw);
      font-size: calc(215 / var(--hero-canvas-w) * 97cqw);
    }

    // Portrait grows to fill from the vital card across to the right edge,
    // bleeding past the page gutter by the same amount the vital card bleeds
    // left, so the two have symmetric margins to the browser edges. It is also
    // lifted slightly to close the gap under Bottom, and cropped to a squarer,
    // stouter ratio than the native 819×1024 so the tall portrait doesn't force
    // a large gap down to the case-study cards.
    .portrait-sheet {
      position: relative;
      top: auto;
      right: auto;
      grid-row: 2;
      grid-column: 7 / -1;
      justify-self: stretch;
      width: auto;
      aspect-ratio: 1 / 1.05;
      margin: -22px calc(-1 * var(--space-5)) 0 0;
    }

    // Crop from the bottom of the shirt, keeping the face and the blueprint
    // detailing above it in frame.
    .portrait-sheet img {
      height: 100%;
      object-fit: cover;
      object-position: center top;
    }

    .intro-vital {
      grid-row: 2;
      grid-column: 1 / span 7;
      align-self: start;
      z-index: var(--z-high);
      // Bleed the card left past the page gutter so it sits closer to the
      // browser edge, and let it overlap the portrait on its right rather than
      // tangenting the frame. Sits high — roughly midway between the wordmark
      // above and the (lower) Selected Work label — rather than crowding it.
      margin: var(--space-7) 0 0 calc(-1 * var(--space-5));
    }
  }

  // Phone — the "framed portrait" composition: the portrait is the centered
  // anchor, "Line" runs horizontally across the top, and "Bottom" / "Up Front"
  // stand as vertical columns down the left and right edges, framing it like a
  // magazine cover.
  //
  // Everything here is expressed in cqw of a portrait-width stage rather than in
  // vw/rem. Because the three words, their positions, and the headroom are all
  // fractions of the SAME ruler (the portrait), the whole composition scales as
  // one rigid unit and — critically — CAPS together when the portrait hits its
  // 27rem max. That is what keeps "Line" just above the portrait, "Bottom" on
  // its left edge, and "Up Front" fully over its right edge at every phone
  // width, instead of the pieces drifting apart as vw type outgrows a capped
  // portrait. (Reference at tuning: portrait ~432px, so 100cqw ≈ 432px.)
  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-3);
    }

    // .home-intro is the composition stage. --phone-stage is the single ruler —
    // the portrait width (90vw). Every size and position below is a calc()
    // fraction of it, so the whole composition scales as one rigid unit across
    // the phone range without any piece diverging. flow-root gives a formatting
    // context so the portrait's large top margin stays contained.
    .home-intro {
      --phone-stage: min(90vw, 38rem);
      position: relative;
      display: flow-root;
      width: var(--phone-stage);
      margin-inline: auto;
      padding-bottom: var(--space-9);
    }

    .hero-region,
    .hero-display {
      display: contents;
    }

    // Blueprint gradient field — reinstated on phone across the top of the
    // composition (behind the words, fading down toward the portrait), sized in
    // --phone-stage fractions like everything else. The base rule supplies the
    // texture and the top-down fade mask; we just place and size it here.
    .hero-field {
      display: block;
      // The stage sits at 5vw–95vw of the viewport, so bleed the field -5vw on
      // each side to reach the true viewport edges (full width).
      inset: 0 -5vw auto -5vw;
      height: calc(var(--phone-stage) * 0.8);
      z-index: -2; // stay behind the reaction-diffusion skin (see base rule)
    }

    // BLUF badge — reinstated on phone, tucked into the top-right negative space
    // above the portrait. Positioned in --phone-stage fractions like everything
    // else so it holds its corner across the range.
    .hero-badge {
      top: calc(var(--phone-stage) * 0.05 + 20px);
      right: calc(var(--phone-stage) * 0.02 - 10px);
      z-index: var(--z-higher);
    }

    .hero-badge-panel {
      right: 0;
      width: min(21rem, calc(100vw - var(--space-6)));
    }

    // Portrait — fills the stage (explicit width so it can't collapse). Its top
    // margin leaves room for "Bottom" to clear its "Bot" above the portrait.
    .portrait-sheet {
      position: relative;
      top: auto;
      right: auto;
      z-index: var(--z-low);
      width: var(--phone-stage);
      margin: calc(var(--phone-stage) * 0.558) 0 0;
    }

    .intro-vital {
      z-index: var(--z-high);
      width: 100%;
      max-width: none;
      margin: var(--space-6) 0 0;
    }

    // Shared reset for the phone composition.
    .title-script,
    .title-serif {
      z-index: var(--z-high);
      line-height: 1;
    }

    // Line — large across the top, its left edge anchored just past "Bottom"'s B
    // so the L flourish nestles into it. Fractions of --phone-stage so the
    // nestle holds at every width.
    .title-script-2 {
      top: calc(var(--phone-stage) * 0.243);
      left: calc(var(--phone-stage) * 0.25);
      right: auto;
      width: auto;
      // The final e's swash paints 0.091em PAST the text's advance width
      // (measured from Edwardian-Script-ITC), and width:auto + nowrap shrink-wrap
      // this box to the advance — so the swash overhangs the element's own box.
      // Safari then clips it away, because rotate() gives the element a
      // compositing layer sized to that box; Blink happens to paint outside it.
      // Padding widens the box past the ink. It cannot shift the text, which is
      // anchored by `left`, and font-size is NOT the lever here: the overhang is
      // a fixed fraction of the em, so it scales with the type and the cut stays
      // in exactly the same place at every size.
      padding-right: 0.15em;
      font-size: calc(var(--phone-stage) * 0.374);
      transform: rotate(-3deg);
    }

    // Bottom — sideways script running down the left edge, mirroring the Up Front
    // spine on the right. text-orientation: sideways rotates the whole run (so
    // the connecting script keeps its joins) while giving a predictable column
    // box to position: the B sits over the white up top, the rest descends over
    // the portrait's left edge.
    .title-script-1 {
      top: calc(var(--phone-stage) * -0.007);
      left: calc(var(--phone-stage) * -0.037);
      writing-mode: vertical-rl;
      text-orientation: sideways;
      transform: none;
      font-size: calc(var(--phone-stage) * 0.397);
    }

    // Up Front — an upright serif "spine" down the right edge, overlapping the
    // portrait. In vertical writing-mode it is NEGATIVE LETTER-SPACING (not
    // line-height, which only sets the column width here) that crushes the gaps
    // between the stacked letters, and NEGATIVE WORD-SPACING closes the gap
    // between "Up" and "Front" — letting the font size grow into a dense spine.
    .title-serif {
      top: calc(var(--phone-stage) * 0.705);
      right: calc(var(--phone-stage) * 0.028);
      left: auto;
      writing-mode: vertical-rl;
      text-orientation: upright;
      font-size: calc(var(--phone-stage) * 0.199);
      line-height: 1;
      letter-spacing: -0.42em;
      word-spacing: -0.7em;
    }

    // WebKit only. The upright spine above is tuned against Blink's metrics and
    // is NOT portable: engines disagree on the advance of an upright glyph.
    // Blink advances a full 1em em-box, while WebKit uses the glyph's own, much
    // narrower advance — so the -0.42em that merely tightens the spine in Blink
    // cancels almost the entire advance in WebKit and piles the letters on top
    // of each other. Rather than compromise the tuned Blink result, WebKit gets
    // its own stacking that avoids the disputed metric altogether: a one-em-wide
    // box puts a single glyph per line and line-height sets the gap, which every
    // engine computes identically. 0.58 is what 1em - 0.42em yields in Blink, so
    // the two should read the same; the space collapses at the line break, which
    // closes the Up/Front gap that word-spacing handles above.
    //
    // Detector: -webkit-named-image is implemented only by Safari, desktop AND
    // iOS, and never by Blink. (-webkit-touch-callout alone is not enough — it
    // is iOS-only, so it misses desktop Safari at phone widths.)
    @supports (background: -webkit-named-image(i)) or
      (-webkit-touch-callout: none) {
      .title-serif {
        // Narrower than a single cap, so exactly one glyph lands per line and
        // simply overflows the box (break-all never splits a glyph). A 1em box
        // instead fits TWO of these caps, which stacked them in pairs.
        //
        // The box no longer marks the spine's edge, so `right` is restated to
        // keep the same optical centre: Blink's vertical column is 1em wide and
        // centred at right + 0.5em, i.e. 0.028 + 0.0995 = 0.1275 of the stage;
        // this box is centred at right + 0.1em, so right becomes ~0.108.
        width: 0.2em;
        right: calc(var(--phone-stage) * 0.108);
        writing-mode: horizontal-tb;
        // The base rule sets white-space: nowrap, which forbids line breaking
        // outright — word-break cannot override it, so without this the spine
        // runs off horizontally instead of stacking.
        white-space: normal;
        word-break: break-all;
        text-align: center;
        // Measured from Bodoni-Z37 rather than guessed: cap height is 0.72em and
        // hhea ascent+descent is 1.2em. Blink advances an upright glyph by that
        // 1.2em vertical advance, so its real spacing is 1.2 - 0.42 = 0.78em —
        // just clear of the 0.72em caps, which is what makes the spine dense but
        // not overlapping. Matching it here reproduces the Blink stack. (An
        // earlier 0.58, assuming a 1em advance, sat below cap height and so
        // piled the letters into each other.)
        line-height: 0.78;
        letter-spacing: 0;
        word-spacing: 0;
      }

      // Nudged down to sit where the Blink spine does.
      .title-serif {
        top: calc(var(--phone-stage) * 0.705 + 30px);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-star {
      animation: none;
    }
  }
</style>
