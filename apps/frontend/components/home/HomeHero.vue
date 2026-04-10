<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <section class="home-hero">
    <h1>{{ title }}</h1>
    <p class="home-hero__subtitle">{{ subtitle }}</p>
  </section>
</template>

<style lang="scss" scoped>
.home-hero {
  max-width: 48rem;
  padding: $space-8 0 $space-7;
}

.home-hero__subtitle {
  max-width: 36rem;
  margin-top: $space-5;
  font-size: $type-step-3;
}
</style>
