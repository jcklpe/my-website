<script setup lang="ts">
  const { enableConstructionBanner } = useHomeMotionDebug();
</script>

<template>
  <aside
    v-if="enableConstructionBanner"
    class="construction-banner"
    aria-label="Website under construction"
  >
    <img
      class="sign"
      src="/images/under-construction-158664.gif"
      alt=""
      width="266"
      height="266"
    />
    <span class="message">
      <span>Under construction</span>
      <span class="status">Live preview</span>
    </span>
  </aside>
</template>

<style lang="scss" scoped>
  .construction-banner {
    position: fixed;
    left: var(--space-4);
    bottom: var(--space-4);
    z-index: var(--z-higher);
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr);
    align-items: center;
    width: min(21rem, calc(100vw - var(--space-8)));
    overflow: hidden;
    border: 3px solid var(--color-ink);
    background: repeating-linear-gradient(
      -45deg,
      #ffd800 0,
      #ffd800 0.75rem,
      var(--color-ink) 0.75rem,
      var(--color-ink) 1.5rem
    );
    box-shadow: var(--shadow-hard-low);
    color: var(--color-ink);
    pointer-events: none;
  }

  .sign {
    display: block;
    width: 4.5rem;
    height: 4.5rem;
    image-rendering: pixelated;
  }

  .message {
    display: grid;
    gap: 0.15rem;
    margin: 0.45rem;
    padding: 0.45rem 0.65rem;
    background: #ffd800;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.1;
    text-transform: uppercase;
  }

  .status {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.14em;
  }

  @include breakpoint(phone) {
    .construction-banner {
      left: var(--space-3);
      bottom: var(--space-3);
      grid-template-columns: 3.5rem minmax(0, 1fr);
      width: min(18rem, calc(100vw - var(--space-6)));
    }

    .sign {
      width: 3.5rem;
      height: 3.5rem;
    }

    .message {
      font-size: 0.68rem;
    }
  }

  @media print {
    .construction-banner {
      display: none;
    }
  }
</style>
