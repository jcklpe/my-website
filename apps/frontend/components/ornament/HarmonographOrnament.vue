<script setup lang="ts">
  // Generative specimen ornament. Traces damped harmonograph (compound-pendulum)
  // curves — the same mathematical line-drawing on the Organic Dream mood board —
  // and strokes them with the iridescent sweep. Purely decorative: aria-hidden,
  // deterministic from `seed` so SSR and client hydrate identically, and fully
  // static under prefers-reduced-motion.

  const props = withDefaults(
    defineProps<{
      seed?: number;
      curves?: number;
      strokeWidth?: number;
      // Drives draw-on order so stacked ornaments don't all animate in unison.
      animate?: boolean;
    }>(),
    {
      seed: 1,
      curves: 3,
      strokeWidth: 0.45,
      animate: true,
    },
  );

  const gradientId = useId();

  // Small deterministic PRNG (mulberry32) so a given seed always yields the same
  // organism on server and client.
  function makeRandom(seed: number) {
    let state = seed >>> 0;

    return function next() {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildPath(random: () => number) {
    const center = 50;
    const samples = 540;
    const totalTime = Math.PI * 2 * 6;
    // Two pendulums per axis, frequencies near small integers with a slight detune
    // so the figure precesses instead of closing on itself.
    const freqs = [1, 2, 3].map((base) => base + (random() - 0.5) * 0.06);
    const axis = () => ({
      a1: 22 + random() * 14,
      a2: 10 + random() * 10,
      f1: freqs[Math.floor(random() * freqs.length)],
      f2: freqs[Math.floor(random() * freqs.length)],
      p1: random() * Math.PI * 2,
      p2: random() * Math.PI * 2,
      d1: 0.0014 + random() * 0.0016,
      d2: 0.0016 + random() * 0.002,
    });
    const x = axis();
    const y = axis();

    let path = '';

    for (let i = 0; i <= samples; i += 1) {
      const t = (i / samples) * totalTime;
      const px =
        center +
        x.a1 * Math.sin(x.f1 * t + x.p1) * Math.exp(-x.d1 * t * 30) +
        x.a2 * Math.sin(x.f2 * t + x.p2) * Math.exp(-x.d2 * t * 30);
      const py =
        center +
        y.a1 * Math.sin(y.f1 * t + y.p1) * Math.exp(-y.d1 * t * 30) +
        y.a2 * Math.sin(y.f2 * t + y.p2) * Math.exp(-y.d2 * t * 30);
      path += `${i === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)}`;
    }

    return path;
  }

  const paths = computed(() => {
    const random = makeRandom(props.seed);

    return Array.from({ length: props.curves }, () => buildPath(random));
  });
</script>

<template>
  <svg
    class="harmonograph"
    :class="{ 'is-animated': animate }"
    viewBox="0 0 100 100"
    role="presentation"
    aria-hidden="true"
    focusable="false"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="var(--color-iris-teal)" />
        <stop offset="28%" stop-color="var(--color-iris-periwinkle)" />
        <stop offset="52%" stop-color="var(--color-iris-orchid)" />
        <stop offset="74%" stop-color="var(--color-iris-rose)" />
        <stop offset="100%" stop-color="var(--color-iris-amber)" />
      </linearGradient>
    </defs>

    <path
      v-for="(d, index) in paths"
      :key="index"
      :d="d"
      :stroke="`url(#${gradientId})`"
      :stroke-width="strokeWidth"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      pathLength="1"
      class="curve"
      :style="{ '--curve-index': index }"
    />
  </svg>
</template>

<style lang="scss" scoped>
  .harmonograph {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .curve {
    opacity: 0.9;
  }

  // Draw-on: each curve traces itself, staggered by index. Continuous, very slow
  // rotation gives the organism a gentle living drift.
  .is-animated {
    @media (prefers-reduced-motion: no-preference) {
      animation: harmonograph-spin 96s linear infinite;
      transform-origin: 50% 50%;

      .curve {
        stroke-dasharray: 1;
        stroke-dashoffset: 1;
        animation: harmonograph-draw 3.2s ease forwards;
        animation-delay: calc(var(--curve-index) * 0.5s);
      }
    }
  }

  @keyframes harmonograph-draw {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes harmonograph-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
