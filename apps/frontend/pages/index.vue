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
    padding-inline: var(--space-6);
    background: var(--texture-paper-grid);
    background-size: var(--texture-paper-grid-size);
  }

  .hero-region {
    min-height: 68vh;
    box-sizing: border-box;
    padding: var(--space-5) 0 var(--space-7);
    display: grid;
    align-content: end;
    color: var(--color-ink);
  }

  .hero-display {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(13rem, 0.75fr);
    gap: var(--space-6);
    align-items: end;
    min-height: clamp(24rem, 54vh, 40rem);
    padding: var(--space-6);
    border: var(--border-window);
    background: var(--texture-blueprint-field);
    background-size: var(--texture-blueprint-field-size);
    box-shadow: var(--shadow-hard-low);
    overflow: hidden;
  }

  .hero-display::before,
  .hero-display::after {
    content: '';
    pointer-events: none;
  }

  .hero-display::before {
    position: absolute;
    top: var(--space-5);
    right: var(--space-5);
    width: min(34vw, 24rem);
    aspect-ratio: 1;
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
    opacity: 0.92;
    transform: rotate(-8deg);
  }

  .hero-display::after {
    position: absolute;
    top: var(--space-5);
    right: var(--space-5);
    width: min(34vw, 24rem);
    aspect-ratio: 1;
    border-radius: 50%;
    background:
      linear-gradient(var(--color-primary), var(--color-primary)) 50% 0 / 1px
        100% no-repeat,
      linear-gradient(90deg, var(--color-primary), var(--color-primary)) 0 50% /
        100% 1px no-repeat;
    transform: rotate(14deg);
    opacity: 0.7;
  }

  .mega-text {
    position: relative;
    z-index: 1;
    grid-column: 1;
    margin: 0;
    font-family: var(--font-edwardian);
    font-style: normal;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: none;
    color: var(--color-primary);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    grid-column: 1;
    margin: var(--space-3) 0 0;
    max-width: 12ch;
    font-size: clamp(2.8rem, 5vw, 4.4rem);
    font-family: var(--font-bodoni);
    font-style: normal;
    font-weight: 400;
    line-height: 0.94;
    letter-spacing: 0;
    color: var(--color-ink);
    text-transform: none;
  }

  .hero-subtitle {
    position: relative;
    z-index: 1;
    grid-column: 1;
    margin: var(--space-3) 0 0;
    max-width: 42rem;
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.7;
    color: var(--color-muted);
  }

  .hero-subtitle::before {
    content: '';
    display: inline-block;
    width: 0.55em;
    height: 0.55em;
    margin-right: 0.7em;
    border-radius: 50%;
    background: var(--color-primary);
    vertical-align: 0.1em;
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      padding: var(--space-7) 0 var(--space-6);
    }

    .hero-display {
      grid-template-columns: 1fr;
      min-height: 30rem;
      padding: var(--space-4);
    }

    .hero-display::before,
    .hero-display::after {
      top: auto;
      right: var(--space-4);
      bottom: var(--space-4);
      width: 12rem;
      opacity: 0.45;
    }

    .hero-title {
      font-size: 2.7rem;
    }
  }
</style>
