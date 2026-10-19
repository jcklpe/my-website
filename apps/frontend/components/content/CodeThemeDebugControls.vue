<script setup lang="ts">
  import {
    stopCodeHueCycle,
    supportsCodeHueCycle,
  } from '~/utils/code-hue-cycle';

  import { ditherGrain, orderedDitherRanks } from '~/utils/ordered-dither';
  import {
    animateRouteImageDissolve,
    prepareRouteImageDissolve,
  } from '~/utils/route-image-dissolve';

  const { reverseHueCycle, codeBlockCount } = useCodeTheme();
  const { rainbow, monospace, ditherPattern, grain } = useSideProjectsPreview();
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
    await prepareRouteImageDissolve(ditherPattern.value, grain.value);
    if (run !== replayGeneration || !canReplay.value) return;
    const duration = 600 / replaySpeed.value;
    replayEffects = images.map((image, index) =>
      animateRouteImageDissolve(
        image,
        true,
        duration,
        Math.min(index * 80, 160) / replaySpeed.value,
        ditherPattern.value,
        grain.value,
      ),
    );
    await Promise.allSettled(
      replayEffects.map((effect) => effect.animation.finished),
    );
    if (run === replayGeneration) stopImageReplay();
  }
  const patternPreview = computed(() => {
    const ranks = orderedDitherRanks(ditherPattern.value);
    const side = ranks.length;
    const marks: Array<{ x: number; y: number }> = [];
    for (const [tone, coverage] of [0.2, 0.4, 0.6, 0.8].entries()) {
      for (const [y, row] of ranks.entries()) {
        for (const [x, rank] of row.entries()) {
          if ((rank + 0.5) / (side * side) <= coverage)
            marks.push({ x: tone * (side + 1) + x, y });
        }
      }
    }
    return { width: side * 4 + 3, height: side, marks };
  });
  const isLocalPreview = ref(false);
  const supported = ref(false);
  let motionPreference: MediaQueryList | null = null;

  function reconcileMotionPreference() {
    reducedMotion.value = motionPreference?.matches ?? false;
    if (reducedMotion.value) {
      stopCodeHueCycle();
      stopImageReplay();
    }
  }

  watch(reverseHueCycle, (enabled) => {
    if (!enabled) stopCodeHueCycle();
  });
  watch(
    () => route.fullPath,
    () => {
      stopCodeHueCycle();
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
  watch([ditherPattern, grain, replaySpeed], stopImageReplay, {
    flush: 'sync',
  });

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
      if (
        ['bayer4', 'bayer8', 'rosette', 'hatch'].includes(saved?.ditherPattern)
      )
        ditherPattern.value = saved.ditherPattern;
      if (saved?.ditherPattern === 'bayer') ditherPattern.value = 'bayer8';
      if (typeof saved?.grain === 'number')
        grain.value = ditherGrain(saved.grain);
      if (
        typeof saved?.replaySpeed === 'number' &&
        Number.isFinite(saved.replaySpeed)
      )
        replaySpeed.value = Math.max(
          0.25,
          Math.min(2, Math.round(saved.replaySpeed * 4) / 4),
        );
    } catch {
      /* Keep the defaults when preview storage is unavailable. */
    }
    void prepareRouteImageDissolve(ditherPattern.value, grain.value);
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reconcileMotionPreference();
    motionPreference.addEventListener('change', reconcileMotionPreference);
  });
  watch([rainbow, monospace, ditherPattern, grain, replaySpeed], () => {
    if (!isLocalPreview.value) return;
    void prepareRouteImageDissolve(ditherPattern.value, grain.value);
    try {
      localStorage.setItem(
        'side-projects-preview',
        JSON.stringify({
          rainbow: rainbow.value,
          monospace: monospace.value,
          ditherPattern: ditherPattern.value,
          grain: grain.value,
          replaySpeed: replaySpeed.value,
        }),
      );
    } catch {
      /* Preview controls remain usable without storage. */
    }
  });
  onBeforeUnmount(() => {
    stopCodeHueCycle();
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
    <label>
      Image dither
      <select v-model="ditherPattern">
        <option value="bayer4">Bayer 4×4</option>
        <option value="bayer8">Bayer 8×8</option>
        <option value="rosette">Pixel rosettes</option>
        <option value="hatch">Crosshatch</option>
      </select>
    </label>
    <label class="grain-option">
      Grain
      <input v-model.number="grain" type="range" min="1" max="8" step="1" />
      <output>{{ grain }}px</output>
    </label>
    <svg
      class="pattern-preview"
      :viewBox="`0 0 ${patternPreview.width} ${patternPreview.height}`"
      :width="patternPreview.width * grain"
      :height="patternPreview.height * grain"
      role="img"
      aria-label="Selected dither pattern at four tone levels"
      shape-rendering="crispEdges"
    >
      <rect
        v-for="(mark, index) in patternPreview.marks"
        :key="index"
        :x="mark.x"
        :y="mark.y"
        width="1"
        height="1"
      />
    </svg>
    <template v-if="route.path === '/side-projects'">
      <label class="replay-option">
        Replay speed
        <input
          v-model.number="replaySpeed"
          type="range"
          min="0.25"
          max="2"
          step="0.25"
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

  .pattern-preview {
    fill: currentColor;
    max-width: 100%;
    justify-self: start;
  }

  .grain-option input,
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

  select {
    min-width: 0;
    font: inherit;
    color: inherit;
    background: var(--color-surface);
    border: 1px solid var(--color-ink);
  }

  @include breakpoint(phone) {
    .code-option {
      display: none;
    }
  }
</style>
