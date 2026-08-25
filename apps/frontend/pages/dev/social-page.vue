<script setup lang="ts">
  definePageMeta({ layout: false });

  useHead({
    title: 'Social Card Preview',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  });
</script>

<template>
  <main class="social-page">
    <section class="card" aria-label="Default social card for Aslan French">
      <img
        class="signal-texture"
        src="/images/social-card-signal-texture.png"
        alt=""
      />
      <svg
        class="corner-signal"
        viewBox="0 0 240 72"
        aria-hidden="true"
      >
        <path class="rule" d="M0 36h158" />
        <path
          class="star"
          d="M30 17c1.4 10.7 6.8 16.1 17.5 17.5C36.8 35.9 31.4 41.3 30 52c-1.4-10.7-6.8-16.1-17.5-17.5C23.2 33.1 28.6 27.7 30 17Z"
        />
        <rect x="154" y="32" width="8" height="8" />
        <g class="dots">
          <circle cx="190" cy="27" r="2" />
          <circle cx="202" cy="27" r="2" />
          <circle cx="214" cy="27" r="2" />
          <circle cx="190" cy="36" r="2" />
          <circle cx="202" cy="36" r="2" />
          <circle cx="214" cy="36" r="2" />
          <circle cx="190" cy="45" r="2" />
          <circle cx="202" cy="45" r="2" />
          <circle cx="214" cy="45" r="2" />
        </g>
      </svg>
      <div class="copy">
        <h1>
          <span>Aslan</span>
          <span>French</span>
        </h1>
        <p>Design technologist + researcher</p>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
  :global(nuxt-devtools),
  :global(nuxt-devtools-container),
  :global(#nuxt-devtools-container) {
    display: none !important;
  }

  .social-page {
    display: grid;
    width: 100vw;
    min-width: 1200px;
    height: 100vh;
    min-height: 630px;
    margin: 0;
    overflow: hidden;
    place-items: start;
    background: var(--color-ink);
  }

  .card {
    --title-aslan-offset-x: 210px;
    --title-french-offset-x: 160px;
    --title-offset-y: -70px;
    --title-size: 290px;
    --descriptor-size: 35px;
    position: relative;
    box-sizing: border-box;
    width: 1200px;
    height: 630px;
    overflow: hidden;
    isolation: isolate;
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .signal-texture {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .corner-signal {
    position: absolute;
    top: 22px;
    left: 28px;
    width: 220px;
    overflow: visible;
    color: var(--color-primary);
  }

  .corner-signal .rule {
    fill: none;
    stroke: currentColor;
    stroke-width: 1;
  }

  .corner-signal .star,
  .corner-signal rect,
  .corner-signal circle {
    fill: currentColor;
  }

  .corner-signal .dots {
    opacity: 0.72;
  }

  .card::after {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--color-surface) 94%, transparent) 0%,
      color-mix(in srgb, var(--color-surface) 82%, transparent) 43%,
      transparent 68%
    );
    content: '';
    pointer-events: none;
  }

  .copy {
    position: absolute;
    top: 90px;
    left: 78px;
    width: 700px;
  }

  h1 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: var(--title-offset-y) 0 0;
    font-family: var(--font-bodoni);
    font-size: var(--title-size);
    font-style: normal;
    font-weight: 400;
    font-synthesis: none;
    letter-spacing: -0.018em;
    line-height: 0.8;
    text-rendering: optimizeLegibility;
  }

  h1 span:first-child {
    margin-left: var(--title-aslan-offset-x);
  }

  h1 span:last-child {
    margin-top: 0.035em;
    margin-left: var(--title-french-offset-x);
  }

  p {
    margin: 34px 0 0 4px;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--descriptor-size);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 1.2;
    white-space: nowrap;
  }
</style>
