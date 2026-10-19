<script setup lang="ts">
  import { stopCodeHueCycle } from '~/utils/code-hue-cycle';
  const { themeName, softenHueCycle } = useCodeTheme();
  useHead({
    htmlAttrs: {
      'data-code-theme': themeName,
      'data-code-hue-soften': computed(() => String(softenHueCycle.value)),
    },
  });
  const route = useRoute();
  watch(() => route.fullPath, stopCodeHueCycle, { flush: 'sync' });
  onBeforeUnmount(stopCodeHueCycle);
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <CodeThemeDebugControls />
  </ClientOnly>
</template>
