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
        <div class="hero-tag-row">
          <span class="hero-tag">{{ homePageContent?.megaText ?? 'B.L.U.F.' }}</span>
          <span class="hero-coord" aria-hidden="true">01 / INDEX</span>
        </div>
        <h1 class="hero-title">
          {{ homePageContent?.title ?? 'Title Text' }}
        </h1>
        <div class="hero-rule" aria-hidden="true" />
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

  .hero-region {
    min-height: 58vh;
    box-sizing: border-box;
    padding: var(--space-9) 0 var(--space-8);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    background: transparent;
    border-bottom: var(--border-blue-strong);
  }

  .hero-display {
    position: relative;
  }

  .hero-tag-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-4);
  }

  .hero-tag {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .hero-coord {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: clamp(2.8rem, 7vw, 6.5rem);
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 600;
    line-height: 0.92;
    letter-spacing: -0.06em;
    color: var(--color-ink);
    text-transform: none;
    text-wrap: balance;
  }

  .hero-rule {
    width: 3rem;
    height: 2px;
    background: var(--color-primary);
    margin: var(--space-5) 0;
  }

  .hero-subtitle {
    margin: 0;
    max-width: 44rem;
    font-size: clamp(0.9rem, 1.3vw, 1.05rem);
    font-family: var(--font-sans);
    font-style: normal;
    font-weight: 400;
    line-height: 1.65;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      padding: var(--space-8) 0 var(--space-7);
    }

    .hero-coord {
      display: none;
    }
  }
</style>
