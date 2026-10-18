<script setup lang="ts">
  import {
    stopCodeHueCycle,
    supportsCodeHueCycle,
  } from '~/utils/code-hue-cycle';

  const { reverseHueCycle, codeBlockCount } = useCodeTheme();
  const { rainbow, monospace } = useSideProjectsPreview();
  const route = useRoute();
  const isLocalPreview = ref(false);
  const supported = ref(false);
  let motionPreference: MediaQueryList | null = null;

  function reconcileMotionPreference() {
    if (motionPreference?.matches) stopCodeHueCycle();
  }

  watch(reverseHueCycle, (enabled) => {
    if (!enabled) stopCodeHueCycle();
  });
  watch(() => route.fullPath, stopCodeHueCycle);

  onMounted(() => {
    const host = window.location.hostname;
    isLocalPreview.value =
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host === '127.0.0.1' ||
      host === '[::1]';
    supported.value = supportsCodeHueCycle();
    try {
      const saved = JSON.parse(
        localStorage.getItem('side-projects-preview') ?? 'null',
      );
      if (typeof saved?.rainbow === 'boolean') rainbow.value = saved.rainbow;
      if (typeof saved?.monospace === 'boolean')
        monospace.value = saved.monospace;
    } catch {
      /* Keep the defaults when preview storage is unavailable. */
    }
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionPreference.addEventListener('change', reconcileMotionPreference);
  });
  watch([rainbow, monospace], () => {
    if (!isLocalPreview.value) return;
    try {
      localStorage.setItem(
        'side-projects-preview',
        JSON.stringify({ rainbow: rainbow.value, monospace: monospace.value }),
      );
    } catch {
      /* Preview controls remain usable without storage. */
    }
  });
  onBeforeUnmount(() => {
    stopCodeHueCycle();
    motionPreference?.removeEventListener('change', reconcileMotionPreference);
  });
</script>

<template>
  <aside
    v-if="isLocalPreview"
    class="debug-options"
    aria-label="Visual preview options"
  >
    <label v-if="codeBlockCount > 0" class="code-option">
      <input v-model="reverseHueCycle" type="checkbox" :disabled="!supported" />
      Reverse hue cycle
    </label>
    <label>
      <input v-model="rainbow" type="checkbox" />
      Rainbow Sneakers
    </label>
    <label>
      <input v-model="monospace" type="checkbox" />
      Side Projects: IBM Plex Mono
    </label>
  </aside>
</template>

<style lang="scss" scoped>
  .debug-options {
    position: fixed;
    right: var(--space-3);
    bottom: var(--space-3);
    z-index: var(--z-highest);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-ink);
    background: var(--color-surface);
    color: var(--color-ink);
    box-shadow: var(--shadow-hard-low);
    font: 0.75rem var(--font-mono);
    display: grid;
    gap: var(--space-2);
  }

  label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  input {
    margin: 0;
    accent-color: var(--color-primary);
  }

  @include breakpoint(phone) {
    .code-option {
      display: none;
    }
  }
</style>
