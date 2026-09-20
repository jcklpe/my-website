<script setup lang="ts">
  const props = defineProps<{
    text: string;
    hidden: boolean;
    exiting: boolean;
  }>();
  const source = ref<HTMLElement | null>(null);
  const lines = ref<string[]>([]);
  let observer: ResizeObserver | null = null;
  let frame = 0;
  let mounted = false;

  function measure() {
    const element = source.value;
    const text = element?.firstChild;
    if (!element || !text || text.nodeType !== Node.TEXT_NODE) return;
    const range = document.createRange();
    const measured: string[] = [];
    let previousTop: number | null = null;
    let line = '';
    // Measure the browser's actual wrapping without replacing the accessible source text or changing layout.
    for (let offset = 0; offset < props.text.length; offset++) {
      range.setStart(text, offset);
      range.setEnd(text, offset + 1);
      const rect = range.getBoundingClientRect();
      if (
        previousTop !== null &&
        Math.abs(rect.top - previousTop) > 2 &&
        line.trim()
      ) {
        measured.push(line.trim());
        line = '';
      }
      line += props.text[offset];
      previousTop = rect.top;
    }
    if (line.trim()) measured.push(line.trim());
    lines.value = measured;
  }

  function scheduleMeasure() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  }

  onMounted(() => {
    mounted = true;
    measure();
    observer = new ResizeObserver(scheduleMeasure);
    if (source.value) observer.observe(source.value);
    void document.fonts.ready.then(() => {
      if (mounted) scheduleMeasure();
    });
  });
  watch(
    () => props.text,
    () => nextTick(scheduleMeasure),
  );
  onBeforeUnmount(() => {
    mounted = false;
    observer?.disconnect();
    cancelAnimationFrame(frame);
  });
</script>

<template>
  <span
    class="slit-text"
    :class="{
      'is-hidden': hidden,
      'is-exiting': exiting,
      'is-measured': lines.length,
    }"
  >
    <span ref="source" class="source">{{ text }}</span>
    <span v-if="lines.length" class="lines" aria-hidden="true">
      <span v-for="(line, index) in lines" :key="index" class="line">
        <span
          class="ink"
          :style="{ '--line-delay': `${Math.min(index * 20, 80)}ms` }"
          >{{ line }}</span
        >
      </span>
    </span>
  </span>
</template>

<style scoped lang="scss">
  .slit-text {
    display: block;
    position: relative;
  }
  .source {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  // The source retains layout, selection and accessible text. Only the decorative line copies move.
  .is-measured .source {
    opacity: 0;
  }
  .lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .line {
    display: block;
    overflow: hidden;
  }
  .ink {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transform: translateY(0);
    transition: transform 160ms var(--snappy-ease-out)
      calc(80ms + var(--line-delay));
  }
  .is-hidden .ink {
    transform: translateY(110%);
    transition-delay: 0ms;
  }
  .is-exiting .ink {
    transform: translateY(-110%);
    transition-delay: var(--line-delay);
  }
  .is-hidden:not(.is-measured) .source {
    visibility: hidden;
  }
  @media (prefers-reduced-motion: reduce) {
    .ink {
      transition: none;
    }
  }
</style>
