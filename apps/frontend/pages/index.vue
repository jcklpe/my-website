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

  const heroTitle = computed(
    () => homePageContent.value?.title?.trim() || 'Aslan French',
  );
  const heroTitleParts = computed(() => {
    const [first = 'Aslan', ...rest] = heroTitle.value.split(/\s+/);
    const second = rest.join(' ') || 'French';

    return { first, second };
  });

  useSiteSeoMeta({
    title: 'Home',
    description: () =>
      homePageContent.value?.seoDescription ??
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  });
</script>

<template>
  <div class="home-page">
    <aside class="signal-strip" aria-label="Generative design branch signal">
      <p>
        Generative design field test / Henry.codes reference / Static preview
        with care
      </p>
    </aside>

    <section class="hero-region">
      <div class="hero-display" aria-labelledby="home-title">
        <p class="mega-text">
          {{ homePageContent?.megaText ?? 'Design technologist' }}
        </p>
        <h1 class="hero-title">
          <span id="home-title" class="segment first">
            {{ heroTitleParts.first }}
          </span>
          <span class="segment middle">from the</span>
          <span class="segment third">{{ heroTitleParts.second }}</span>
        </h1>
        <p class="hero-subtitle">
          {{ homePageContent?.subtitle ?? 'Subtitle text' }}
        </p>
      </div>

      <figure class="hero-ornament">
        <img
          src="/img/gendes-henry/mechanical-scribe.png"
          alt=""
          width="1024"
          height="1536"
          loading="eager"
          fetchpriority="high"
        />
      </figure>

      <div class="hero-warning">
        <span>(Scroll with caution and with care.)</span>
      </div>

      <div class="hero-marquee" aria-hidden="true">
        <div class="marquee-track">
          <span>Portfolio weather: volatile</span>
          <span>/</span>
          <span>Headless CMS below deck</span>
          <span>/</span>
          <span>Nuxt static preview ritual</span>
          <span>/</span>
          <span>Design technology field notes</span>
          <span>/</span>
        </div>
        <div class="marquee-track">
          <span>Portfolio weather: volatile</span>
          <span>/</span>
          <span>Headless CMS below deck</span>
          <span>/</span>
          <span>Nuxt static preview ritual</span>
          <span>/</span>
          <span>Design technology field notes</span>
          <span>/</span>
        </div>
      </div>

      <nav class="hero-nav" aria-label="Home sections">
        <div>
          <p class="nav-label">Garden</p>
          <ul>
            <li>
              <NuxtLink to="#selected-work">
                <span>Selected work</span>
                <small>- Case-study dispatches</small>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="#latest-writing">
                <span>Writing</span>
                <small>- Essays and field notes</small>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="nav-label">Meta</p>
          <ul>
            <li>
              <NuxtLink to="/about">
                <span>About</span>
                <small>- A note on the author</small>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/side-projects">
                <span>Side Projects</span>
                <small>- Smaller spells and prototypes</small>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
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
    overflow: hidden;
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .signal-strip {
    --stripe-distance: 180vw;

    position: relative;
    z-index: 2;
    padding: var(--space-3) var(--space-4) var(--space-4);
    border-bottom: var(--border-default);
    background: var(--color-surface);
    color: var(--color-muted);
    font-family: var(--font-serif);
    font-size: clamp(1rem, 2.4vw, 2.15rem);
    line-height: 0.95;
    text-align: center;
    text-transform: uppercase;
  }

  .signal-strip::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 0.35rem;
    background-image: repeating-linear-gradient(
      90deg,
      var(--color-signal-blue) 0 12rem,
      var(--color-signal-lavender) 12rem 24rem,
      var(--color-signal-pink) 24rem 36rem,
      var(--color-surface) 36rem 48rem
    );
    background-size: var(--stripe-distance) 100%;
    animation: signal-drift 26s linear infinite;
  }

  .signal-strip p {
    margin: 0;
  }

  .hero-region {
    position: relative;
    box-sizing: border-box;
    min-height: min(100vh, 58rem);
    padding: var(--space-4);
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: auto auto auto 1fr auto;
    gap: var(--space-4);
  }

  .hero-display {
    position: relative;
    z-index: 1;
    display: grid;
    grid-column: 1 / -1;
    grid-row: 1 / span 4;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
  }

  .mega-text {
    grid-column: 1 / span 4;
    grid-row: 4;
    align-self: end;
    max-width: 28ch;
    margin: 0;
    color: var(--color-muted);
    font-size: var(--type-small);
    line-height: 1.1;
    text-transform: uppercase;
  }

  .hero-title {
    display: grid;
    grid-column: 1 / -1;
    grid-row: 1 / span 3;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
    margin: 0;
    color: var(--color-ink);
  }

  .segment {
    display: block;
    position: relative;
    z-index: 1;
    line-height: 0.78;
    text-transform: uppercase;
  }

  .first {
    grid-column: 1 / -1;
    grid-row: 1;
    font-family: var(--font-display);
    font-size: clamp(8rem, 24vw, 22rem);
    font-weight: 400;
  }

  .middle {
    z-index: 3;
    grid-column: 1 / span 3;
    grid-row: 2;
    align-self: start;
    margin-top: -0.34em;
    color: var(--color-surface);
    font-family: var(--font-serif);
    font-size: clamp(3.6rem, 8vw, 8rem);
    font-style: italic;
    font-weight: 400;
    line-height: 0.9;
    text-transform: none;
    -webkit-text-stroke: 0.035em var(--color-ink);
    paint-order: stroke fill;
  }

  .third {
    grid-column: 1 / span 8;
    grid-row: 2;
    align-self: end;
    margin-top: 0.1em;
    font-family: var(--font-serif);
    font-size: clamp(5rem, 11vw, 10.5rem);
    font-weight: 400;
    line-height: 0.78;
  }

  .hero-subtitle {
    grid-column: 1 / span 5;
    grid-row: 5;
    align-self: end;
    max-width: 34ch;
    margin: 0;
    font-size: clamp(1.05rem, 1.7vw, 1.55rem);
    line-height: 1.15;
  }

  .hero-ornament {
    z-index: 2;
    grid-column: 9 / -1;
    grid-row: 2 / span 4;
    align-self: stretch;
    margin: 0;
    border: var(--border-default);
    border-radius: 0.75rem;
    overflow: hidden;
    background: var(--color-surface-warm);
  }

  .hero-ornament img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 38%;
    filter: contrast(1.12);
  }

  .hero-warning {
    z-index: 3;
    grid-column: 8;
    grid-row: 4;
    align-self: start;
    justify-self: end;
    color: var(--color-muted);
    font-size: var(--type-small);
    text-transform: uppercase;
    transform: translateX(100%) rotate(90deg);
    transform-origin: 0 0;
    white-space: nowrap;
  }

  .hero-marquee {
    z-index: 4;
    grid-column: 1 / span 8;
    grid-row: 3;
    display: flex;
    overflow: hidden;
    align-self: start;
    border-top: var(--border-default);
    border-bottom: var(--border-default);
    color: var(--color-muted);
    font-size: var(--type-small);
    line-height: 1;
    text-transform: uppercase;
  }

  .marquee-track {
    display: flex;
    flex: 0 0 auto;
    gap: 0.65ch;
    align-items: center;
    width: max-content;
    padding: var(--space-2) 0;
    animation: marquee 28s linear infinite;
  }

  .hero-nav {
    z-index: 4;
    grid-column: 1 / span 5;
    grid-row: 4;
    align-self: start;
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .nav-label {
    margin: 0 0 var(--space-2);
    color: var(--color-muted);
    font-size: var(--type-small);
    text-transform: uppercase;
  }

  .hero-nav ul {
    display: grid;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .hero-nav a {
    display: inline-flex;
    gap: 0.45ch;
    color: var(--color-ink);
    text-decoration: none;
  }

  .hero-nav span {
    position: relative;
  }

  .hero-nav span::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: 0 0;
    transition: transform 180ms var(--motion-snappy);
  }

  .hero-nav a:hover span::after,
  .hero-nav a:focus-visible span::after {
    transform: scaleX(1);
  }

  .hero-nav small {
    color: var(--color-muted);
    filter: blur(1.3px);
    transition: filter 180ms var(--motion-snappy);
  }

  .hero-nav a:hover small,
  .hero-nav a:focus-visible small {
    filter: blur(0);
  }

  @keyframes marquee {
    to {
      transform: translateX(-100%);
    }
  }

  @keyframes signal-drift {
    to {
      background-position: var(--stripe-distance) 0;
    }
  }

  @include breakpoint(phone) {
    .signal-strip {
      font-size: 1.2rem;
      text-wrap: balance;
    }

    .hero-region {
      grid-template-columns: 9rem minmax(0, 1fr);
      grid-template-rows: auto auto auto auto auto;
      min-height: auto;
      padding: var(--space-4);
    }

    .hero-display {
      grid-column: 1 / -1;
      grid-row: 1 / span 4;
      display: contents;
    }

    .hero-title {
      display: grid;
      grid-column: 1 / -1;
      grid-row: 1 / span 3;
      grid-template-columns: 9rem minmax(0, 1fr);
      grid-template-rows: auto auto auto;
    }

    .first {
      grid-column: 1;
      grid-row: 1 / span 3;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-size: clamp(6rem, 28vw, 8rem);
      line-height: 0.78;
    }

    .middle {
      grid-column: 2;
      grid-row: 2;
      margin-top: 0;
      font-size: clamp(3rem, 15vw, 4.8rem);
      -webkit-text-stroke-width: 0.04em;
    }

    .third {
      grid-column: 2;
      grid-row: 3;
      font-size: clamp(4rem, 21vw, 6rem);
    }

    .hero-ornament {
      grid-column: 2;
      grid-row: 1;
      min-height: 22rem;
    }

    .hero-warning {
      grid-column: 2;
      grid-row: 4;
      transform: none;
      white-space: normal;
    }

    .hero-subtitle {
      grid-column: 2;
      grid-row: 5;
      margin-top: var(--space-3);
    }

    .mega-text {
      grid-column: 1 / -1;
      grid-row: 6;
      margin-top: var(--space-5);
    }

    .hero-marquee,
    .hero-nav {
      grid-column: 1 / -1;
    }

    .hero-marquee {
      grid-row: 7;
    }

    .hero-nav {
      grid-row: 8;
      margin-top: var(--space-4);
    }

    .hero-nav a {
      flex-wrap: wrap;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .signal-strip::after,
    .marquee-track {
      animation: none;
    }

    .hero-nav span::after,
    .hero-nav small {
      transition: none;
    }
  }
</style>
