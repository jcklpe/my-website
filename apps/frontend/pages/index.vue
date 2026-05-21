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
    <!-- Hero is a field-guide plate: a warm framed panel carrying a celestial
         desert emblem, a small-caps kicker, and a Fraunces display headline. -->
    <section class="hero-region">
      <div class="hero-plate">
        <div class="hero-copy">
          <p class="hero-kicker">{{ homePageContent?.megaText ?? 'B.L.U.F.' }}</p>
          <h1 class="hero-title">
            {{ homePageContent?.title ?? 'Title Text' }}
          </h1>
          <p class="hero-subtitle">
            {{ homePageContent?.subtitle ?? 'Subtitle text' }}
          </p>
        </div>

        <svg
          class="hero-emblem"
          viewBox="0 0 120 168"
          role="img"
          aria-label="A desert sun rising over layered mesas"
        >
          <defs>
            <linearGradient id="hero-sun" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="var(--color-spectrum-gold)" />
              <stop offset="55%" stop-color="var(--color-spectrum-amber)" />
              <stop offset="100%" stop-color="var(--color-spectrum-red)" />
            </linearGradient>
          </defs>
          <!-- capsule frame -->
          <rect
            x="3"
            y="3"
            width="114"
            height="162"
            rx="57"
            class="emblem-frame"
          />
          <!-- sun rays -->
          <g class="emblem-rays">
            <line x1="60" y1="20" x2="60" y2="34" />
            <line x1="42" y1="26" x2="48" y2="38" />
            <line x1="78" y1="26" x2="72" y2="38" />
            <line x1="30" y1="40" x2="40" y2="48" />
            <line x1="90" y1="40" x2="80" y2="48" />
          </g>
          <!-- sun disc -->
          <circle cx="60" cy="62" r="16" class="emblem-sun" />
          <!-- layered mesas -->
          <path
            class="emblem-mesa"
            d="M18 120 L44 92 L60 108 L80 84 L102 120 Z"
          />
          <path class="emblem-mesa-back" d="M30 120 L60 98 L92 120 Z" />
          <!-- horizon + ground dots -->
          <line x1="18" y1="120" x2="102" y2="120" class="emblem-horizon" />
          <g class="emblem-dots">
            <circle cx="34" cy="134" r="1.4" />
            <circle cx="50" cy="140" r="1.4" />
            <circle cx="68" cy="136" r="1.4" />
            <circle cx="86" cy="142" r="1.4" />
            <circle cx="58" cy="150" r="1.4" />
          </g>
        </svg>
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
    box-sizing: border-box;
    padding: var(--space-7) 0 var(--space-7);
  }

  // The plate: a framed broadside on warm paper with a soft print shadow.
  // Deliberately left-biased — it occupies ~62% of the width, leaving an open
  // right gutter of bare sand that the emblem spills into. overflow: visible
  // lets the emblem break the frame.
  .hero-plate {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: end;
    gap: var(--space-6);
    width: min(100%, 46rem);
    min-height: 44vh;
    margin-top: var(--space-7);
    padding: var(--space-8) var(--space-7);
    background: var(--color-surface-soft);
    border: var(--border-frame);
    box-shadow: var(--shadow-print);
    overflow: visible;
  }

  .hero-kicker {
    margin: 0 0 var(--space-4);
    @include kicker;
  }

  // Fraunces display, soft + wonky, sun-baked ink.
  .hero-title {
    margin: 0;
    max-width: 18ch;
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-weight: 460;
    font-style: normal;
    font-size: clamp(2.6rem, 6vw, 5rem);
    line-height: 0.98;
    letter-spacing: -0.015em;
    color: var(--color-ink);

    @include display-character($opsz: 144, $soft: 60, $wonk: 1);
  }

  .hero-subtitle {
    margin: var(--space-4) 0 0;
    max-width: 44ch;
    font-family: var(--font-sans);
    font-size: clamp(0.98rem, 1.2vw, 1.12rem);
    font-style: normal;
    line-height: 1.6;
    color: var(--color-muted);
  }

  // The emblem floats large in the open right gutter, spilling well past the
  // plate's right edge and tilted — the bold asymmetric gesture that anchors
  // the empty right side and breaks the framed-box rhythm.
  .hero-emblem {
    position: absolute;
    top: var(--space-6);
    right: 0;
    width: clamp(8rem, 17vw, 13.5rem);
    height: auto;
    overflow: visible;
    transform: translate(64%, -22%) rotate(4deg);
  }

  .emblem-frame {
    fill: none;
    stroke: var(--color-primary);
    stroke-width: 1.5;
    opacity: 0.55;
  }

  .emblem-rays line,
  .emblem-mesa,
  .emblem-mesa-back,
  .emblem-horizon {
    fill: none;
    stroke: var(--color-primary);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .emblem-mesa-back {
    opacity: 0.45;
  }

  .emblem-sun {
    fill: url(#hero-sun);
    stroke: none;
  }

  .emblem-dots circle {
    fill: var(--color-primary);
    opacity: 0.7;
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      padding: var(--space-6) 0;
    }

    .hero-plate {
      width: 100%;
      padding: var(--space-6) var(--space-5);
      min-height: 0;
    }

    // On mobile the emblem returns to normal flow above the copy — no gutter
    // to spill into, no breakout, no tilt.
    .hero-emblem {
      position: static;
      order: -1;
      justify-self: start;
      width: 5.5rem;
      margin-bottom: var(--space-2);
      transform: none;
    }
  }
</style>
