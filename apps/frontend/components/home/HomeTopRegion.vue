<template>
  <section class="home-top-region">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
  .home-top-region {
    margin-inline: calc(var(--space-6) * -1);
    background: linear-gradient(145deg, #1f38c5 0%, #2657eb 58%, #4d72ef 100%);
    background-attachment: fixed;
    background-position: top left;
    background-size: 100vw 100vh;
    color: white;
  }

  @media (max-width: 720px) {
    .home-top-region {
      margin-inline: calc(var(--space-4) * -1);
    }
  }
</style>
