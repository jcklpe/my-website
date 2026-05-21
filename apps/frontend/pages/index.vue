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
    background: var(--color-surface);
  }

  .hero-region {
    position: relative;
    min-height: 72vh;
    box-sizing: border-box;
    padding: var(--space-9) 0 var(--space-7);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    background:
      linear-gradient(90deg, var(--color-pop-yellow) 0 64%, transparent 64%),
      linear-gradient(180deg, var(--color-pop-aqua) 0 38%, transparent 38%),
      var(--color-pop-cream);
    border-bottom: var(--border-strong);
    overflow: hidden;
    margin-inline: calc(var(--space-6) * -1);
    padding-inline: var(--space-6);
  }

  .hero-region::before,
  .hero-region::after {
    content: '';
    position: absolute;
    pointer-events: none;
  }

  .hero-region::before {
    top: var(--space-7);
    right: var(--space-6);
    width: min(24rem, 34%);
    height: 9rem;
    background: var(--color-pop-coral);
    border: var(--border-strong);
    box-shadow: 0.8rem 0.8rem 0 var(--color-primary-heavy);
    transform: rotate(4deg);
  }

  .hero-region::after {
    right: 18%;
    bottom: var(--space-7);
    width: 14rem;
    height: 2.5rem;
    background: var(--color-pop-lime);
    border: var(--border-strong);
    transform: rotate(-8deg);
  }

  .hero-display {
    position: relative;
    z-index: 1;
    max-width: 62rem;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-style: normal;
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    max-width: 12ch;
    font-size: 5.4rem;
    font-family: var(--font-sans);
    font-style: normal;
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: 0;
    color: var(--color-ink);
    text-transform: none;
    text-wrap: balance;
  }

  .hero-subtitle {
    margin: var(--space-3) 0 0;
    max-width: 34rem;
    padding: var(--space-3) var(--space-4);
    border: var(--border-default);
    background: var(--color-pop-cream);
    box-shadow: 0.45rem 0.45rem 0 var(--color-pop-pink);
    font-size: 1.05rem;
    font-style: normal;
    font-weight: 600;
    line-height: 1.45;
    color: var(--color-ink);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      min-height: 66vh;
      margin-inline: calc(var(--space-4) * -1);
      padding: var(--space-8) var(--space-4) var(--space-6);
      background:
        linear-gradient(180deg, var(--color-pop-yellow) 0 62%, transparent 62%),
        linear-gradient(90deg, var(--color-pop-aqua) 0 42%, transparent 42%),
        var(--color-pop-cream);
    }

    .hero-region::before {
      top: var(--space-5);
      right: var(--space-4);
      width: 9rem;
      height: 4rem;
    }

    .hero-region::after {
      right: var(--space-5);
      bottom: var(--space-5);
      width: 7rem;
    }

    .hero-title {
      font-size: 3rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }
  }
</style>
