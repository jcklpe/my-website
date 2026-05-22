<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      lines?: number;
      size?: number;
      color?: string;
      opacity?: number;
    }>(),
    {
      lines: 20,
      size: 480,
      color: 'currentColor',
      opacity: 0.07,
    },
  );

  const center = computed(() => props.size / 2);
  const outerRadius = computed(() => props.size / 2 - 2);
  const innerRadius = computed(() => props.size * 0.08);

  const linePoints = computed(() =>
    Array.from({ length: props.lines }, (_, i) => {
      const angle = (i / props.lines) * Math.PI * 2 - Math.PI / 2;
      return {
        x1: center.value + innerRadius.value * Math.cos(angle),
        y1: center.value + innerRadius.value * Math.sin(angle),
        x2: center.value + outerRadius.value * Math.cos(angle),
        y2: center.value + outerRadius.value * Math.sin(angle),
      };
    }),
  );
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    fill="none"
    :style="{ opacity }"
    aria-hidden="true"
    focusable="false"
    class="organic-radial"
  >
    <line
      v-for="(pt, i) in linePoints"
      :key="i"
      :x1="pt.x1"
      :y1="pt.y1"
      :x2="pt.x2"
      :y2="pt.y2"
      :stroke="color"
      stroke-width="0.75"
    />
    <circle
      :cx="center"
      :cy="center"
      :r="innerRadius * 0.6"
      :stroke="color"
      stroke-width="0.5"
      fill="none"
    />
  </svg>
</template>
