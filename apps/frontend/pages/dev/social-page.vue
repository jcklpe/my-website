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
    --title-offset-x: 28px;
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
    margin: var(--title-offset-y) 0 0 var(--title-offset-x);
    font-family: var(--font-bodoni);
    font-size: var(--title-size);
    font-style: normal;
    font-weight: 400;
    font-synthesis: none;
    letter-spacing: -0.018em;
    line-height: 0.8;
    text-rendering: optimizeLegibility;
  }

  h1 span:last-child {
    margin-top: 0.035em;
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
