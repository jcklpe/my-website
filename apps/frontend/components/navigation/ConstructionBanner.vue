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
    <button
      class="dismiss"
      type="button"
      aria-label="Dismiss under construction notice"
      @click="enableConstructionBanner = false"
    >
      ×
    </button>
  </aside>
</template>

<style lang="scss" scoped>
  .construction-banner {
    position: fixed;
    left: var(--space-4);
    top: var(--space-4);
    z-index: var(--z-higher);
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr) auto;
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
    pointer-events: auto;
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

  .dismiss {
    align-self: start;
    width: 1.75rem;
    height: 1.75rem;
    margin: 0.35rem 0.35rem 0 0;
    padding: 0;
    border: 2px solid var(--color-ink);
    background: #ffd800;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
  }

  .dismiss:hover,
  .dismiss:focus-visible {
    color: #ffd800;
    background: var(--color-ink);
  }

  @include breakpoint(phone) {
    .construction-banner {
      left: var(--space-3);
      top: var(--space-3);
      grid-template-columns: 3rem minmax(0, 1fr) auto;
      width: min(14.5rem, calc(100vw - var(--space-6)));
    }

    .sign {
      width: 3rem;
      height: 3rem;
    }

    .message {
      margin: 0.3rem;
      padding-inline: 0.45rem;
      font-size: 0.56rem;
      letter-spacing: 0.05em;
    }

    .status {
      font-size: 0.5rem;
    }
  }

  @media print {
    .construction-banner {
      display: none;
    }
  }
</style>
