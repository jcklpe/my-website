<script setup lang="ts">
defineProps<{
  megaText: string;
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <section class="home-hero">
    <div class="home-hero__display">
      <p class="home-hero__bluf">{{ megaText }}</p>
      <h1 class="home-hero__expansion">{{ title }}</h1>
      <p class="home-hero__clarifier">{{ subtitle }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-hero {
  box-sizing: border-box;
  min-height: calc(100vh - 4rem);
  display: grid;
  align-content: end;
  gap: $space-7;
  padding: $space-6 $space-5 $space-5;
  color: white;
}

.home-hero__display {
  position: relative;
  min-height: 15rem;
}

.home-hero__bluf {
  margin: 0;
  font-size: clamp(4.25rem, 12vw, 8.75rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.home-hero__expansion {
  position: relative;
  z-index: 1;
  margin: -0.2em 0 0;
  font-size: clamp(2.25rem, 6vw, 4.75rem);
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 700;
  line-height: 0.95;
  text-transform: uppercase;
  color: white;
}

.home-hero__clarifier {
  margin: -0.05em 0 0 0.2em;
  font-size: clamp(1.35rem, 2.8vw, 2.35rem);
  font-style: italic;
  color: rgba(255, 255, 255, 0.86);
}

@media (max-width: 720px) {
  .home-hero {
    min-height: calc(100vh - 8rem);
    padding: $space-6 $space-4 $space-4;
  }
}
</style>
