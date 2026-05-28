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

  const spotlightCaseStudy = computed(() => caseStudies.value?.[0] ?? null);

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
        <div class="title-stack">
          <p class="mega-text">{{ homePageContent?.megaText ?? 'B.L.U.F.' }}</p>
          <h1 class="hero-title">
            {{ homePageContent?.title ?? 'Title Text' }}
          </h1>
        </div>

        <FeaturedMediaFrame
          v-if="spotlightCaseStudy?.featuredMedia?.sourceUrl"
          class="spotlight-media"
          :media="spotlightCaseStudy.featuredMedia"
          label="Selected Work"
          sizes="(max-width: 820px) 88vw, 34vw"
        />

        <div class="hero-meta">
          <p class="stage-index">01 / Intro</p>
          <p class="hero-subtitle">
            {{ homePageContent?.subtitle ?? 'Subtitle text' }}
          </p>
          <a class="enter-link" href="#selected-work">Enter selected work</a>
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
    padding-inline: var(--space-6);
    overflow: hidden;
  }

  .hero-region {
    min-height: 84svh;
    box-sizing: border-box;
    padding: var(--space-7) 0 var(--space-8);
    display: grid;
    align-content: center;
    color: var(--color-ink);
  }

  .hero-display {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 34rem);
    grid-template-rows: auto auto;
    column-gap: var(--space-7);
    align-items: end;
  }

  .title-stack {
    grid-column: 1 / 3;
    grid-row: 1;
    position: relative;
    z-index: var(--z-low);
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .hero-title {
    position: relative;
    z-index: var(--z-lower);
    margin: var(--space-3) 0 0;
    max-width: 10ch;
    font-size: 8.8rem;
    font-family: var(--font-mono);
    font-weight: 600;
    line-height: 0.82;
    letter-spacing: 0;
    color: var(--color-primary);
    text-transform: none;
  }

  .spotlight-media {
    grid-column: 2;
    grid-row: 1 / 3;
    justify-self: stretch;
    align-self: end;
    height: min(62svh, 42rem);
    aspect-ratio: auto;
    box-shadow: var(--shadow-soft-high);
    clip-path: inset(0 round 48% 48% 0 0);
  }

  .spotlight-media :deep(.image),
  .spotlight-media :deep(.placeholder) {
    height: 100%;
    object-fit: cover;
  }

  .hero-meta {
    grid-column: 1;
    grid-row: 2;
    position: relative;
    z-index: var(--z-mid);
    display: grid;
    gap: var(--space-4);
    max-width: 36rem;
    margin-top: var(--space-6);
  }

  .stage-index {
    margin: 0;
    color: var(--color-muted);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .hero-subtitle {
    margin: 0;
    font-size: var(--type-large);
    font-weight: 400;
    line-height: 1.45;
    color: var(--color-ink-80);
  }

  .enter-link {
    width: max-content;
    min-width: 8rem;
    border: 1px solid var(--color-ink-80);
    border-radius: 999px;
    padding: 1rem 1.2rem;
    color: var(--color-ink);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-align: center;
    text-decoration: none;
    text-transform: uppercase;
    transition:
      background 240ms var(--motion-snappy),
      color 240ms var(--motion-snappy),
      transform 240ms var(--motion-snappy);
  }

  .enter-link:hover,
  .enter-link:focus-visible {
    background: var(--color-ink);
    color: var(--color-surface);
    transform: translateY(-0.2rem);
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      min-height: auto;
      padding: var(--space-8) 0 var(--space-7);
    }

    .hero-display {
      grid-template-columns: 1fr;
      gap: var(--space-5);
    }

    .title-stack,
    .spotlight-media,
    .hero-meta {
      grid-column: 1;
      grid-row: auto;
    }

    .hero-title {
      font-size: 4.4rem;
    }

    .spotlight-media {
      height: 24rem;
    }
  }

  @media (max-width: 68rem) and (min-width: 768px) {
    .hero-display {
      grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem);
    }

    .hero-title {
      font-size: 6rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .enter-link {
      transition: none;
    }

    .enter-link:hover,
    .enter-link:focus-visible {
      transform: none;
    }
  }
</style>
