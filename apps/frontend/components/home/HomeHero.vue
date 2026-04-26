<script setup lang="ts">
  defineProps<{
    megaText: string;
    title: string;
    subtitle: string;
  }>();
</script>

<template>
  <section class="home-hero">
    <div class="status-bar" aria-hidden="true">
      <span class="sys-label">PORTFOLIO.SYS</span>
      <span class="sys-status"><span class="pulse-dot">◉</span> ONLINE</span>
    </div>

    <div class="display">
      <p class="mega-text">{{ megaText }}</p>
    </div>

    <div class="identity-strip">
      <div class="identity-rule" aria-hidden="true"></div>
      <div class="identity-body">
        <h1 class="title">{{ title }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .home-hero {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: calc(100vh - 4rem);
    padding: var(--space-4) var(--space-5) var(--space-5);
    color: white;
  }

  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block: var(--space-3);
    border-bottom: 1px solid rgba(200, 124, 32, 0.3);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(200, 124, 32, 0.75);
  }

  .pulse-dot {
    display: inline-block;
    animation: pulse 2.8s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.15;
    }
  }

  .display {
    display: flex;
    align-items: flex-end;
    padding-block: var(--space-5) var(--space-4);
  }

  .mega-text {
    margin: 0;
    font-size: clamp(5.5rem, 15.5vw, 13rem);
    font-family: var(--font-mono);
    font-weight: 700;
    font-style: italic;
    line-height: 0.84;
    letter-spacing: -0.04em;
    text-transform: uppercase;
  }

  .identity-strip {
    display: grid;
    grid-template-columns: 3px 1fr;
    gap: 0 var(--space-4);
    align-items: start;
    padding-block: var(--space-4);
    border-top: 1px solid rgba(200, 124, 32, 0.3);
  }

  .identity-rule {
    background: var(--color-amber-warm);
    align-self: stretch;
  }

  .identity-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .title {
    margin: 0;
    font-size: clamp(0.9rem, 1.5vw, 1.2rem);
    font-family: var(--font-mono);
    font-weight: 400;
    font-style: normal;
    line-height: 1.4;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.65);
  }

  .subtitle {
    margin: 0;
    font-size: clamp(0.72rem, 1.1vw, 0.88rem);
    font-family: var(--font-mono);
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-amber-warm);
  }

  @media (max-width: 720px) {
    .home-hero {
      min-height: calc(100vh - 6rem);
      padding: var(--space-4) var(--space-4) var(--space-4);
    }

    .mega-text {
      font-size: clamp(4rem, 18vw, 6rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse-dot {
      animation: none;
    }
  }
</style>

<style lang="scss" scoped>
  .home-hero {
    box-sizing: border-box;
    min-height: calc(100vh - 4rem);
    display: grid;
    align-content: end;
    gap: var(--space-7);
    padding: var(--space-6) var(--space-5) var(--space-5);
    color: white;
  }

  .display {
    position: relative;
    min-height: 15rem;
  }

  .mega-text {
    margin: 0;
    font-size: clamp(4.25rem, 12vw, 8.75rem);
    font-family: var(--font-mono);
    font-weight: 700;
    font-style: italic;
    line-height: 0.9;
    letter-spacing: -0.05em;
    text-transform: uppercase;
  }

  .title {
    position: relative;
    z-index: 1;
    margin: -0.2em 0 0;
    font-size: clamp(2.25rem, 6vw, 4.75rem);
    font-family: var(--font-sans);
    font-weight: 500;
    line-height: 0.95;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.78);
    letter-spacing: 0.04em;
  }

  .subtitle {
    margin: 0.55em 0 0 0.2em;
    font-size: clamp(0.92rem, 1.6vw, 1.18rem);
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.06em;
    color: #c87c20;
    text-transform: uppercase;
  }

  @media (max-width: 720px) {
    .home-hero {
      min-height: calc(100vh - 8rem);
      padding: var(--space-6) var(--space-4) var(--space-4);
    }
  }
</style>
