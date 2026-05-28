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
        <p class="mega-text">
          {{ homePageContent?.megaText ?? 'A digital garden ✷ tend with care' }}
        </p>
        <h1 class="hero-title">
          {{ homePageContent?.title ?? 'Aslan French' }}
        </h1>
        <p class="hero-subtitle">
          {{
            homePageContent?.subtitle ??
            'Design technologist & researcher. I build quiet, durable things for the web — and write about the seams where people meet machines.'
          }}
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
    min-height: 78vh;
    box-sizing: border-box;
    padding: var(--space-10) 0 var(--space-8);
    display: grid;
    align-content: end;
    color: var(--color-ink);
    background: var(--color-surface);
  }

  .hero-display {
    position: relative;
  }

  .mega-text {
    margin: 0 0 var(--space-5);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(3.5rem, 15vw, 13rem);
    font-weight: 400;
    line-height: 0.86;
    letter-spacing: -0.03em;
    color: var(--color-ink);
    text-transform: none;
    text-wrap: balance;
  }

  .hero-subtitle {
    max-width: 32ch;
    margin: var(--space-6) 0 0;
    font-family: var(--font-serif);
    font-size: clamp(1.25rem, 1rem + 1.4vw, 2rem);
    font-style: italic;
    font-weight: 400;
    line-height: 1.32;
    letter-spacing: -0.01em;
    color: var(--color-ink-90);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      min-height: 70vh;
      padding: var(--space-9) 0 var(--space-7);
    }
  }
</style>
