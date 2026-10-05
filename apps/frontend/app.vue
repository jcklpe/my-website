<script setup lang="ts">
  const { themeName } = useCodeTheme();
  useHead({ htmlAttrs: { 'data-code-theme': themeName } });
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
