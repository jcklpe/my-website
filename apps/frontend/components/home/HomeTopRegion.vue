<template>
  <section class="home-top-region">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
  .home-top-region {
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: var(--color-surface);
    color: var(--color-ink);
  }
</style>
