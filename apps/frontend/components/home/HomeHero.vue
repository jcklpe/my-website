<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  intro: string;
}>();
</script>

<template>
  <section class="home-hero">
    <p class="home-hero__eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p class="home-hero__intro">Sup{{ intro }}</p>
  </section>
</template>

<style lang="scss" scoped>
.home-hero {
  max-width: 48rem;
  padding: $space-8 0 $space-7;
}

.home-hero__eyebrow {
  margin-bottom: $space-3;
  color: $color-accent;
  font-size: $type-step-1;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-hero__intro {
  max-width: 36rem;
  margin-top: $space-5;
  font-size: $type-step-3;
}
</style>
