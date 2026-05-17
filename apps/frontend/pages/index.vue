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
        <div class="hero-chrome" aria-hidden="true">
          <span class="chrome-title">Signal Garden</span>
          <span class="chrome-status">Live feed</span>
        </div>

        <div class="hero-display">
          <div class="hero-copy">
            <p class="mega-text">
              {{ homePageContent?.megaText ?? 'B.L.U.F.' }}
            </p>
            <h1 id="home-hero-title" class="hero-title">
              {{ homePageContent?.title ?? 'Title Text' }}
            </h1>
            <p class="hero-subtitle">
              {{ homePageContent?.subtitle ?? 'Subtitle text' }}
            </p>
          </div>

          <aside class="hero-system-panel" aria-hidden="true">
            <div class="panel-heading">
              <span class="panel-dot"></span>
              <span>Live systems overview</span>
            </div>
            <div class="system-dial">
              <span class="dial-value">72%</span>
              <span class="dial-label">Signal health</span>
            </div>
            <dl class="system-list">
              <div>
                <dt>Data flow</dt>
                <dd>72%</dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>58%</dd>
              </div>
              <div>
                <dt>Environment</dt>
                <dd>41%</dd>
              </div>
            </dl>
          </aside>
        </div>

        <div class="hero-index" aria-hidden="true">
          <span>field: portfolio</span>
          <span>system: web / research / tools</span>
          <span>est. 2026</span>
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
    padding: var(--space-6) 0 var(--space-7);
    display: grid;
    color: var(--color-ink);
  }

  .hero-frame {
    position: relative;
    overflow: hidden;
    min-height: clamp(34rem, 72vh, 48rem);
    border: var(--border-window);
    background: var(--texture-blueprint-field);
    background-size: var(--texture-blueprint-field-size);
    box-shadow: var(--shadow-hard-mid);
  }

  .hero-frame::before,
  .hero-frame::after {
    content: '';
    position: absolute;
    pointer-events: none;
  }

  .hero-frame::before {
    inset: var(--space-6) var(--space-7) auto auto;
    width: min(32vw, 28rem);
    aspect-ratio: 1;
    border: 1px solid color-mix(in srgb, var(--color-signal) 58%, transparent);
    border-radius: 50%;
    background:
      linear-gradient(
        90deg,
        transparent 49.6%,
        color-mix(in srgb, var(--color-signal) 36%, transparent) 49.6% 50.4%,
        transparent 50.4%
      ),
      linear-gradient(
        transparent 49.6%,
        color-mix(in srgb, var(--color-signal) 36%, transparent) 49.6% 50.4%,
        transparent 50.4%
      );
    opacity: 0.46;
  }

  .hero-frame::after {
    right: var(--space-6);
    bottom: var(--space-6);
    width: min(34vw, 24rem);
    height: min(18vw, 12rem);
    border: var(--border-signal);
    background:
      repeating-linear-gradient(
        90deg,
        color-mix(in srgb, var(--color-signal) 60%, transparent) 0 2px,
        transparent 2px 14px
      ),
      linear-gradient(180deg, transparent 0%, var(--color-signal-soft) 100%);
    clip-path: polygon(0 88%, 12% 62%, 24% 74%, 38% 34%, 52% 48%, 66% 12%, 82% 28%, 100% 0, 100% 100%, 0 100%);
    opacity: 0.32;
  }

  .hero-chrome {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    align-items: center;
    min-height: 2.75rem;
    padding: 0 var(--space-5);
    border-bottom: var(--border-ink);
    background: var(--color-surface-soft);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    line-height: 1;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .chrome-title::before {
    content: '*';
    display: inline-block;
    margin-right: var(--space-2);
    color: var(--color-signal);
  }

  .chrome-status {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-muted);
  }

  .chrome-status::before {
    content: '';
    width: 0.55rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--color-signal);
  }

  .hero-display {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(19rem, 0.62fr);
    gap: var(--space-7);
    align-items: end;
    min-height: calc(clamp(34rem, 72vh, 48rem) - 5.5rem);
    padding: var(--space-8) var(--space-5) var(--space-7);
  }

  .hero-copy {
    max-width: 58rem;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-signal-heavy);
  }

  .hero-title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    max-width: 13ch;
    font-size: clamp(3.2rem, 9vw, 8.5rem);
    font-family: var(--font-mono);
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: -0.08em;
    color: var(--color-ink);
    text-transform: uppercase;
    text-wrap: balance;
  }

  .hero-subtitle {
    max-width: 38rem;
    margin: var(--space-5) 0 0;
    padding-left: var(--space-4);
    border-left: var(--border-signal-strong);
    font-size: clamp(1rem, 1.4vw, 1.25rem);
    font-family: var(--font-mono);
    line-height: 1.6;
    color: var(--color-ink-80);
  }

  .hero-system-panel {
    position: relative;
    z-index: 2;
    align-self: stretch;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    min-height: 24rem;
    border: var(--border-ink);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
  }

  .panel-heading {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-bottom: var(--border-ink);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .panel-dot {
    width: 0.55rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--color-ink);
  }

  .system-dial {
    display: grid;
    place-items: center;
    align-content: center;
    margin: var(--space-5);
    border-radius: 50%;
    aspect-ratio: 1;
    border: 1.2rem solid var(--color-signal);
    border-left-color: var(--color-signal-soft);
    background: var(--color-surface);
    text-align: center;
  }

  .dial-value {
    font-family: var(--font-mono);
    font-size: clamp(2rem, 4vw, 3.75rem);
    font-weight: 700;
    line-height: 1;
  }

  .dial-label {
    max-width: 8ch;
    margin-top: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    line-height: 1.15;
    text-transform: uppercase;
  }

  .system-list {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-4);
    border-top: var(--border-ink);
  }

  .system-list div {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-3);
    align-items: baseline;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .system-list dt,
  .system-list dd {
    margin: 0;
  }

  .system-list dt::before {
    content: '';
    display: inline-block;
    width: 0.4rem;
    aspect-ratio: 1;
    margin-right: var(--space-2);
    border-radius: 50%;
    background: var(--color-signal);
    vertical-align: 0.08em;
  }

  .hero-index {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    border-top: var(--border-ink);
    background: var(--color-surface-soft);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  @include breakpoint(phone) {
    .home-page {
      padding-inline: var(--space-4);
    }

    .hero-region {
      padding: var(--space-4) 0 var(--space-6);
    }

    .hero-frame {
      min-height: auto;
    }

    .hero-frame::before {
      inset: var(--space-6) auto auto 45%;
      width: 70vw;
    }

    .hero-frame::after {
      display: none;
    }

    .hero-chrome,
    .hero-index {
      padding-inline: var(--space-3);
    }

    .hero-chrome,
    .hero-index {
      flex-wrap: wrap;
    }

    .hero-display {
      grid-template-columns: 1fr;
      min-height: auto;
      padding: var(--space-7) var(--space-3) var(--space-5);
    }

    .hero-title {
      font-size: clamp(3rem, 18vw, 5rem);
    }

    .hero-subtitle {
      padding-left: var(--space-3);
    }

    .hero-system-panel {
      min-height: auto;
    }

    .system-dial {
      max-width: 15rem;
      justify-self: center;
    }
  }
</style>
