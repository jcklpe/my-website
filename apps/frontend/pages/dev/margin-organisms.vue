<script setup lang="ts">
  definePageMeta({ layout: false });

  useHead({
    title: 'GPU Margin Organism Mock',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  });
</script>

<template>
  <div class="page">
    <HomeReactionDiffusionBackground presentation="margin-mock" />

    <header class="lab-nav">
      <NuxtLink to="/dev/motion">← Motion lab</NuxtLink>
      <span>Shared GPU field · margin-window mock</span>
    </header>

    <main>
      <article>
        <p class="kicker">Working paper · September 2026</p>
        <h1>The page is the habitat</h1>
        <p class="lede">
          One living reaction-diffusion field continues behind the page. Soft
          windows in the empty margins reveal fragments of that shared ecology
          without introducing a second simulation.
        </p>

        <h2>A view, not a specimen</h2>
        <p>
          The earlier margin organisms each owned their own chemistry, timing,
          and canvas. They opened from familiar baked seeds, then quickly stopped
          resembling the homepage because their equations and cadence were
          different. This version is literally the homepage field: the same
          coral, drift, turnover, pointer response, and rendering quality.
        </p>
        <p>
          The margins therefore behave more like apertures into a larger living
          atlas. Growth can cross beyond the visible window and return later;
          nothing collides with a rectangular patch boundary because the field
          itself continues beyond what is shown.
        </p>

        <blockquote>
          The mask should disappear from perception. What remains should feel
          like fragments passing through the page rather than a thumbprint
          pasted behind the article.
        </blockquote>

        <h2>What this mock answers</h2>
        <p>
          It answers the visual question quickly: whether full-speed homepage
          motion, seen sparsely at the edges of editorial content, has the living
          quality the CPU patches lacked. It does not yet solve production
          placement, collision avoidance, long-document scrolling, or whether
          the visual earns its GPU cost on interior pages.
        </p>
        <p>
          Move the pointer anywhere in the viewport. Because this is one shared
          field rather than hover-bound patches, both visible windows respond to
          the same environmental influence.
        </p>
      </article>
    </main>
  </div>
</template>

<style lang="scss" scoped>
  .page {
    position: relative;
    isolation: isolate;
    min-height: 150vh;
    overflow-x: clip;
    color: var(--color-ink);
    background:
      linear-gradient(rgba(38, 87, 235, 0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(38, 87, 235, 0.055) 1px, transparent 1px),
      var(--color-surface-warmer);
    background-size: 24px 24px;
  }

  .lab-nav,
  main {
    position: relative;
    z-index: 1;
  }

  .lab-nav {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .lab-nav a {
    color: var(--color-primary);
  }

  main {
    padding: clamp(5rem, 11vw, 10rem) var(--space-4) 12rem;
  }

  article {
    width: min(100%, var(--article-column));
    margin-inline: auto;
    padding: clamp(2rem, 5vw, 4rem);
    background: color-mix(in srgb, var(--color-surface-warmer) 92%, transparent);
    border: var(--border-window);
    box-shadow: var(--shadow-window);
  }

  .kicker {
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  h1,
  h2 {
    font-family: var(--font-bodoni), serif;
    font-weight: 400;
  }

  h1 {
    max-width: 8ch;
    margin: var(--space-4) 0 var(--space-5);
    font-size: clamp(4rem, 10vw, 8rem);
    line-height: 0.83;
    letter-spacing: -0.035em;
  }

  h2 {
    margin: var(--space-8) 0 var(--space-3);
    font-size: clamp(2.2rem, 5vw, 4rem);
    line-height: 0.95;
  }

  p,
  blockquote {
    font-size: clamp(1rem, 1.45vw, 1.2rem);
    line-height: 1.65;
  }

  p + p {
    margin-top: var(--space-4);
  }

  .lede {
    font-size: clamp(1.2rem, 2vw, 1.55rem);
  }

  blockquote {
    margin: var(--space-8) calc(-1 * var(--space-6));
    padding: var(--space-5) var(--space-6);
    color: var(--color-surface-warmer);
    background: var(--color-primary);
    font-family: var(--font-mono);
  }

  @include breakpoint(phone) {
    .lab-nav {
      align-items: flex-start;
      flex-direction: column;
    }

    main {
      padding-top: var(--space-7);
    }

    article {
      padding: var(--space-5) var(--space-4) var(--space-7);
    }

    blockquote {
      margin-inline: calc(-1 * var(--space-4));
      padding-inline: var(--space-4);
    }
  }
</style>
