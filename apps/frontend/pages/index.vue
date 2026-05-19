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
    <section class="hero-region" aria-labelledby="home-hero-title">
      <div class="hero-frame">
        <div class="hero-diagram" aria-hidden="true">
          <span class="diagram-node node-one" />
          <span class="diagram-node node-two" />
          <span class="diagram-node node-three" />
        </div>

        <div class="hero-display">
          <p class="mega-text">{{ homePageContent?.megaText ?? 'B.L.U.F.' }}</p>
          <h1 id="home-hero-title" class="hero-title">
            {{ homePageContent?.title ?? 'Title Text' }}
          </h1>
          <p class="hero-subtitle">
            {{ homePageContent?.subtitle ?? 'Subtitle text' }}
          </p>
        </div>
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
    isolation: isolate;
    padding-inline: var(--space-6);
  }

  .hero-region {
    box-sizing: border-box;
    padding: var(--space-5) 0 var(--space-7);
    display: grid;
    color: var(--color-ink);
  }

  .hero-frame {
    position: relative;
    min-height: clamp(31rem, 70vh, 46rem);
    overflow: hidden;
    border: var(--border-window);
    background: var(--texture-blueprint-field);
    background-size: var(--texture-blueprint-field-size);
    box-shadow: var(--shadow-hard-mid);
  }

  .hero-frame::before {
    content: '';
    position: absolute;
    inset: auto auto var(--space-6) var(--space-6);
    width: min(38rem, 55vw);
    height: 0.85rem;
    background: repeating-linear-gradient(
      90deg,
      var(--color-signal) 0 1.8rem,
      transparent 1.8rem 2.5rem
    );
    opacity: 0.72;
  }

  .hero-frame::after {
    content: '';
    position: absolute;
    inset: var(--space-5) var(--space-5) auto auto;
    width: min(30rem, 34vw);
    aspect-ratio: 1;
    border: var(--border-signal);
    border-radius: 50%;
    background:
      radial-gradient(
        circle,
        transparent 0 18%,
        var(--color-signal) 18.3% 19%,
        transparent 19.3%
      ),
      repeating-radial-gradient(
        circle,
        transparent 0 16%,
        var(--color-signal-pale) 16.2% 16.8%,
        transparent 17% 26%
      ),
      linear-gradient(var(--color-signal), var(--color-signal)) 50% 0 / 1px
        100% no-repeat,
      linear-gradient(90deg, var(--color-signal), var(--color-signal)) 0 50% /
        100% 1px no-repeat;
    opacity: 0.66;
    transform: rotate(-8deg);
  }

  .hero-diagram {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .hero-diagram::before,
  .hero-diagram::after {
    content: '';
    position: absolute;
    background: var(--color-signal);
    opacity: 0.48;
    transform-origin: 0 50%;
  }

  .hero-diagram::before {
    top: 31%;
    right: 14%;
    width: min(17rem, 22vw);
    height: 1px;
    transform: rotate(26deg);
  }

  .hero-diagram::after {
    top: 46%;
    right: 19%;
    width: min(12rem, 18vw);
    height: 1px;
    transform: rotate(-34deg);
  }

  .diagram-node {
    position: absolute;
    width: 0.65rem;
    aspect-ratio: 1;
    border: var(--border-signal);
    border-radius: 50%;
    background: var(--color-surface);
  }

  .node-one {
    top: 27%;
    right: 14%;
  }

  .node-two {
    top: 38%;
    right: 28%;
  }

  .node-three {
    top: 53%;
    right: 18%;
  }

  .hero-display {
    position: relative;
    z-index: 1;
    display: grid;
    align-content: end;
    max-width: 58rem;
    min-height: inherit;
    padding: var(--space-8) var(--space-6) var(--space-7);
  }

  .mega-text {
    position: absolute;
    z-index: -1;
    top: var(--space-5);
    left: var(--space-6);
    max-width: 9ch;
    margin: 0;
    font-family: var(--font-mono);
    font-style: italic;
    font-size: clamp(4.8rem, 18vw, 15rem);
    font-weight: 700;
    line-height: 0.72;
    letter-spacing: -0.12em;
    text-transform: uppercase;
    color: var(--color-signal-pale);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    max-width: 12ch;
    margin: 0;
    font-size: clamp(3rem, 9vw, 7.8rem);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 700;
    line-height: 0.88;
    letter-spacing: -0.085em;
    color: var(--color-ink);
    text-wrap: balance;
  }

  .hero-subtitle {
    max-width: 40rem;
    margin: var(--space-5) 0 0;
    padding-left: var(--space-4);
    border-left: var(--border-signal-strong);
    font-size: clamp(1rem, 1.4vw, 1.25rem);
    font-family: var(--font-sans);
    font-style: normal;
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-ink-80);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      padding: var(--space-4) 0 var(--space-6);
    }

    .hero-frame {
      min-height: 34rem;
    }

    .hero-frame::before {
      inset-inline: var(--space-4);
      width: auto;
    }

    .hero-frame::after {
      top: auto;
      right: var(--space-4);
      bottom: var(--space-6);
      width: 13rem;
      opacity: 0.42;
    }

    .hero-display {
      padding: var(--space-7) var(--space-4) var(--space-6);
    }

    .mega-text {
      top: var(--space-4);
      left: var(--space-4);
      font-size: clamp(4rem, 28vw, 8rem);
    }

    .hero-title {
      font-size: clamp(3rem, 17vw, 5rem);
    }

    .hero-subtitle {
      padding-left: var(--space-3);
    }
  }
</style>
