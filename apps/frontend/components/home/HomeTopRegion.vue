<template>
  <section class="home-top-region">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
  .home-top-region {
    position: relative;
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-ink);
    color: white;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.12) 2px,
        rgba(0, 0, 0, 0.12) 3px
      );
    }
  }

  @media (max-width: 720px) {
    .home-top-region {
      margin-inline: calc(var(--space-4) * -1);
    }
  }
</style>
