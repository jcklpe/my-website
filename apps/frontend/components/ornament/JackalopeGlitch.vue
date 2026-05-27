<script setup lang="ts">
  // Jackalope signature ornament — a deterministic generative "glitch" field that
  // replaces the original theme's YouTube glitch-video hero background. Seeded so
  // SSR and client render identically (no hydration mismatch): horizontal
  // datamosh slices with RGB channel-split, plus a scanline veil. Decorative only:
  // aria-hidden, and the drift animation is gated by prefers-reduced-motion.

  const props = withDefaults(
    defineProps<{
      seed?: number;
      slices?: number;
    }>(),
    {
      seed: 20260527,
      slices: 26,
    },
  );

  type Slice = {
    y: number;
    h: number;
    x: number;
    w: number;
    shift: number;
    channel: 'cyan' | 'blue' | 'red' | 'ink';
    delay: number;
  };

  const WIDTH = 600;
  const HEIGHT = 400;

  function mulberry32(seed: number) {
    let state = seed >>> 0;

    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const glitchSlices = computed<Slice[]>(() => {
    const random = mulberry32(props.seed);
    const out: Slice[] = [];
    const channels: Slice['channel'][] = ['cyan', 'blue', 'red', 'ink'];

    let y = 0;
    for (let i = 0; i < props.slices; i += 1) {
      const h = 4 + random() * 26;
      const w = WIDTH * (0.18 + random() * 0.7);
      const x = random() * (WIDTH - w);
      const shift = (random() - 0.5) * 64;
      // Bias toward blue/cyan; red and ink are the rarer hot/structural glitches.
      const roll = random();
      const channel =
        roll > 0.82
          ? 'red'
          : roll > 0.62
            ? 'ink'
            : roll > 0.3
              ? 'blue'
              : 'cyan';

      out.push({
        y,
        h,
        x,
        w,
        shift,
        channel: channels.includes(channel) ? channel : 'blue',
        delay: random() * -4,
      });

      y += h + random() * 8;
      if (y > HEIGHT) break;
    }

    return out;
  });

  const viewBox = `0 0 ${WIDTH} ${HEIGHT}`;
</script>

<template>
  <svg
    class="jackalope-glitch"
    :viewBox="viewBox"
    role="presentation"
    aria-hidden="true"
    preserveAspectRatio="xMidYMid slice"
  >
    <g class="drift">
      <rect
        v-for="(slice, index) in glitchSlices"
        :key="`slice-${index}`"
        :x="slice.x"
        :y="slice.y"
        :width="slice.w"
        :height="slice.h"
        :class="['slice', slice.channel]"
        :style="{
          '--shift': `${slice.shift}px`,
          '--delay': `${slice.delay}s`,
        }"
      />
    </g>
  </svg>
</template>

<style lang="scss" scoped>
  .jackalope-glitch {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .slice {
    mix-blend-mode: screen;
    opacity: 0.55;
    animation: jackalope-glitch-drift 2.4s steps(2) infinite alternate;
    animation-delay: var(--delay);
  }

  .slice.cyan {
    fill: #00b0ff;
  }

  .slice.blue {
    fill: #2657eb;
  }

  .slice.red {
    fill: #e63120;
  }

  .slice.ink {
    fill: #0a0a0a;
    mix-blend-mode: multiply;
    opacity: 0.7;
  }

  @keyframes jackalope-glitch-drift {
    from {
      transform: translateX(0);
    }

    to {
      transform: translateX(var(--shift, 0));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .slice {
      animation: none;
    }
  }
</style>
