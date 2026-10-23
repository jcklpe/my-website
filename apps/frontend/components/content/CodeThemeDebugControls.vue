<script setup lang="ts">
  import {
    animateRouteImageDissolve,
    prepareRouteImageDissolve,
  } from '~/utils/route-image-dissolve';

  const { rainbow } = useSideProjectsPreview();
  const route = useRoute();
  const choreography = useRouteChoreographyState();
  const replaySpeed = ref(1);
  const reducedMotion = ref(false);
  const replayNote = ref('');
  const canReplay = computed(
    () =>
      route.path === '/side-projects' &&
      !choreography.value.active &&
      !reducedMotion.value,
  );
  let replayGeneration = 0;
  let replayEffects: Array<ReturnType<typeof animateRouteImageDissolve>> = [];

  function stopImageReplay() {
    replayGeneration++;
    for (const effect of replayEffects) {
      effect.animation.cancel();
      effect.dispose();
    }
    replayEffects = [];
  }

  async function replayImageDissolve() {
    stopImageReplay();
    replayNote.value = '';
    if (!canReplay.value) return;
    const run = replayGeneration;
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(
        '.side-projects-page .body img',
      ),
    ).filter((image) => {
      const rect = image.getBoundingClientRect();
      return (
        image.complete &&
        image.naturalWidth > 0 &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < innerHeight
      );
    });
    if (!images.length) {
      replayNote.value = 'Scroll an image into view to replay.';
      return;
    }
    await prepareRouteImageDissolve();
    if (run !== replayGeneration || !canReplay.value) return;
    const duration = 600 / replaySpeed.value;
    replayEffects = images.map((image, index) =>
      animateRouteImageDissolve(
        image,
        true,
        duration,
        Math.min(index * 80, 160) / replaySpeed.value,
      ),
    );
    await Promise.allSettled(
      replayEffects.map((effect) => effect.animation.finished),
    );
    if (run === replayGeneration) stopImageReplay();
  }
  const isLocalPreview = ref(false);
  let motionPreference: MediaQueryList | null = null;

  function reconcileMotionPreference() {
    reducedMotion.value = motionPreference?.matches ?? false;
    if (reducedMotion.value) {
      stopImageReplay();
    }
  }

  watch(
    () => route.fullPath,
    () => {
      stopImageReplay();
      replayNote.value = '';
    },
    { flush: 'sync' },
  );
  watch(
    () => choreography.value.active,
    (active) => {
      if (active) stopImageReplay();
    },
    { flush: 'sync' },
  );
  watch(replaySpeed, stopImageReplay, { flush: 'sync' });

  function savePreviewPreferences() {
    if (!isLocalPreview.value) return;
    try {
      localStorage.setItem(
        'side-projects-preview',
        JSON.stringify({
          rainbow: rainbow.value,
          replaySpeed: replaySpeed.value,
        }),
      );
    } catch {
      /* Preview controls remain usable without storage. */
    }
  }

  onMounted(() => {
    const host = window.location.hostname;
    isLocalPreview.value =
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host === '127.0.0.1' ||
      host === '[::1]';
    try {
      const saved = JSON.parse(
        localStorage.getItem('side-projects-preview') ?? 'null',
      );
      if (typeof saved?.rainbow === 'boolean') rainbow.value = saved.rainbow;
      if (
        typeof saved?.replaySpeed === 'number' &&
        Number.isFinite(saved.replaySpeed)
      )
        replaySpeed.value = Math.max(
          0.125,
          Math.min(2, Math.round(saved.replaySpeed * 8) / 8),
        );
    } catch {
      /* Keep the defaults when preview storage is unavailable. */
    }
    savePreviewPreferences();
    void prepareRouteImageDissolve();
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reconcileMotionPreference();
    motionPreference.addEventListener('change', reconcileMotionPreference);
  });
  watch([rainbow, replaySpeed], savePreviewPreferences);
  onBeforeUnmount(() => {
    stopImageReplay();
    motionPreference?.removeEventListener('change', reconcileMotionPreference);
  });
</script>

<template>
  <aside
    v-if="isLocalPreview"
    class="debug-options"
    aria-label="Visual preview options"
  >
    <label>
      <input v-model="rainbow" type="checkbox" />
      Rainbow Sneakers
    </label>
    <template v-if="route.path === '/side-projects'">
      <label class="replay-option">
        Replay speed
        <input
          v-model.number="replaySpeed"
          type="range"
          min="0.125"
          max="2"
          step="0.125"
        />
        <output>{{ replaySpeed }}×</output>
      </label>
      <button type="button" :disabled="!canReplay" @click="replayImageDissolve">
        Replay image dissolve
      </button>
      <p v-if="reducedMotion" class="replay-note">
        Replay disabled for reduced motion.
      </p>
      <p v-if="replayNote" class="replay-note" role="status">
        {{ replayNote }}
      </p>
    </template>
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

  .replay-option input {
    width: 8rem;
    min-width: 0;
  }

  output {
    min-width: 3ch;
    text-align: right;
  }

  .replay-note {
    margin: 0;
    font: inherit;
  }

  button {
    padding: var(--space-1) var(--space-2);
    font: inherit;
    color: inherit;
    background: var(--color-surface);
    border: 1px solid var(--color-ink);
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
