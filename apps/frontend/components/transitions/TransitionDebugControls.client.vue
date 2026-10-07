<script setup lang="ts">
  const { enableTransitionTrails } = useHomeMotionDebug();
  const transitionState = useFeaturedMediaTransitionState();
  const isLocalPreview = ref(false);
  const duration = ref(600);
  let defaultDuration = 600;

  onMounted(() => {
    const hostname = window.location.hostname;
    isLocalPreview.value =
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === 'localhost' ||
      hostname.endsWith('.localhost');
    if (!isLocalPreview.value) return;

    const cssTime = getComputedStyle(document.documentElement)
      .getPropertyValue('--home-case-study-flight-duration')
      .trim();
    const milliseconds =
      parseFloat(cssTime) * (cssTime.endsWith('ms') ? 1 : 1000);
    if (Number.isFinite(milliseconds) && milliseconds > 0) {
      defaultDuration = milliseconds;
      duration.value = milliseconds;
    }
  });

  function changeDuration(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!Number.isFinite(input.valueAsNumber)) {
      input.value = String(duration.value);
      return;
    }
    duration.value = Math.min(3000, Math.max(50, input.valueAsNumber));
    input.value = String(duration.value);
    // Change the existing shared clock, so photo, title, trails, and cleanup stay synchronized.
    document.documentElement.style.setProperty(
      '--home-case-study-flight-duration',
      `${duration.value}ms`,
    );
  }

  function resetControls() {
    duration.value = defaultDuration;
    enableTransitionTrails.value = true;
    document.documentElement.style.removeProperty(
      '--home-case-study-flight-duration',
    );
  }

  onBeforeUnmount(() => {
    if (isLocalPreview.value) {
      document.documentElement.style.removeProperty(
        '--home-case-study-flight-duration',
      );
    }
  });
</script>

<template>
  <details v-if="isLocalPreview" class="controls" open>
    <summary>Motion preview</summary>
    <fieldset :disabled="transitionState.active">
      <legend class="scope">Home → Case Study</legend>
      <label class="duration">
        Flight duration
        <span class="value">
          <input
            type="number"
            aria-label="Home to Case Study duration in milliseconds"
            :value="duration"
            min="50"
            max="3000"
            step="50"
            @change="changeDuration"
          />
          ms
        </span>
      </label>
      <label class="trails">
        <input v-model="enableTransitionTrails" type="checkbox" />
        Photoplate trails
      </label>
      <button type="button" @click="resetControls">Reset</button>
    </fieldset>
  </details>
</template>

<style lang="scss" scoped>
  .controls {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: var(--z-highest);
    width: 250px;
    max-width: calc(100vw - 32px);
    padding: 12px;
    color: var(--color-ink);
    background: var(--color-surface);
    border: 2px solid var(--color-primary);
    box-shadow: 4px 4px 0 var(--color-ink);
    font: 12px / 1.5 var(--font-mono);
  }

  summary {
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
  }

  fieldset {
    display: grid;
    gap: 12px;
    min-width: 0;
    margin: 12px 0 0;
    padding: 0;
    border: 0;
  }

  .scope {
    margin-bottom: 8px;
    padding: 0;
  }

  .duration {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .value {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  input[type='number'] {
    width: 72px;
    padding: 4px;
    color: var(--color-ink);
    background: var(--color-surface-warm);
    border: 1px solid var(--color-ink);
    font: inherit;
    cursor: text;
  }

  .trails {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  input[type='checkbox'] {
    margin: 0;
    accent-color: var(--color-primary);
    cursor: pointer;
  }

  button {
    justify-self: start;
    padding: 4px 8px;
    color: var(--color-primary);
    background: var(--color-surface);
    border: 1px solid var(--color-primary);
    font: inherit;
    cursor: pointer;
  }
</style>
