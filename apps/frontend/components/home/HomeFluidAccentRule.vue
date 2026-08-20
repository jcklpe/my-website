<script setup lang="ts">
  type Point = { x: number; y: number };

  const svgElement = ref<SVGSVGElement | null>(null);
  const pathElement = ref<SVGPathElement | null>(null);
  const {
    animateAccentRule,
    accentRuleStrength,
    accentRuleSpeed,
    accentRuleTexture,
    accentWaveAmplitude,
    accentWaveFrequency,
    accentRuleThickness,
  } = useHomeMotionDebug();
  const transitionState = useFeaturedMediaTransitionState();

  const WIDTH = 224;
  const HEIGHT = 24;
  const CENTER_Y = HEIGHT / 2;
  const POINT_COUNT = 96;
  const FRAME_INTERVAL = 1000 / 30;
  const FULL_CIRCLE = Math.PI * 2;
  const isVectorTexture = computed(() =>
    accentRuleTexture.value.startsWith('vector-'),
  );

  let animationFrame = 0;
  let previousFrame = 0;
  let observer: IntersectionObserver | null = null;
  let reducedMotionQuery: MediaQueryList | null = null;
  let isVisible = true;

  function hash(value: number, seed: number): number {
    const raw = Math.sin(value * 127.1 + seed * 311.7) * 43758.5453;
    return (raw - Math.floor(raw)) * 2 - 1;
  }

  function noise(value: number, seed: number): number {
    const cell = Math.floor(value);
    const fraction = value - cell;
    const eased = fraction * fraction * (3 - 2 * fraction);
    const start = hash(cell, seed);
    const end = hash(cell + 1, seed);
    return start + (end - start) * eased;
  }

  function curveSegments(points: Point[]): string {
    let path = '';

    for (let index = 0; index < points.length - 1; index += 1) {
      const previous = points[Math.max(0, index - 1)]!;
      const current = points[index]!;
      const next = points[index + 1]!;
      const following = points[Math.min(points.length - 1, index + 2)]!;
      const controlOneX = current.x + (next.x - previous.x) / 6;
      const controlOneY = current.y + (next.y - previous.y) / 6;
      const controlTwoX = next.x - (following.x - current.x) / 6;
      const controlTwoY = next.y - (following.y - current.y) / 6;

      path += ` C ${controlOneX.toFixed(2)} ${controlOneY.toFixed(2)}, ${controlTwoX.toFixed(2)} ${controlTwoY.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
    }

    return path;
  }

  function buildRibbonPath(
    time: number,
    strength: number,
    waveAmplitude: number,
  ): string {
    const upper: Point[] = [];
    const lower: Point[] = [];
    const travel = time * accentRuleSpeed.value;

    for (let index = 0; index < POINT_COUNT; index += 1) {
      const progress = index / (POINT_COUNT - 1);
      const x = 6 + progress * (WIDTH - 12);
      let centerOffset = 0;
      let halfThickness = 1.4;

      if (accentRuleTexture.value === 'vector-flag') {
        const amplitudeDrift =
          0.78 + noise(progress * 1.7 + travel * 0.045, 83) * 0.22;
        const primaryWave = Math.sin(
          progress * FULL_CIRCLE * 1.55 * accentWaveFrequency.value -
            travel * 0.72,
        );
        const wanderingWave = Math.sin(
          progress * FULL_CIRCLE * 0.72 * accentWaveFrequency.value +
            travel * 0.31 +
            1.2,
        );
        centerOffset =
          (primaryWave * amplitudeDrift + wanderingWave * 0.22) *
          waveAmplitude *
          5.8;
        halfThickness =
          1.45 +
          strength * 0.18 +
          noise(progress * 2.6 - travel * 0.055, 97) * strength * 0.16;
      } else if (accentRuleTexture.value === 'vector-signal') {
        const primaryWave = Math.sin(
          progress * FULL_CIRCLE * 2 * accentWaveFrequency.value - travel * 0.9,
        );
        const harmonic = Math.sin(
          progress * FULL_CIRCLE * 4 * accentWaveFrequency.value - travel * 1.8,
        );
        centerOffset = (primaryWave + harmonic * 0.06) * waveAmplitude * 5.5;
        halfThickness = 1.35 + strength * 0.12;
      } else {
        const broad = noise(progress * 2.4 + travel * 0.12, 7);
        const counterflow = noise(progress * 5.2 - travel * 0.08, 19);
        centerOffset = (broad * 0.7 + counterflow * 0.3) * strength * 4.2;
        const slowBulge = noise(progress * 2.1 + travel * 0.055, 71);
        const thicknessField =
          slowBulge * 0.72 + noise(progress * 4.6 - travel * 0.075, 43) * 0.28;
        halfThickness = 1.4 + (thicknessField + 1) * strength * 1.4;
      }

      halfThickness *= accentRuleThickness.value;

      upper.push({ x, y: CENTER_Y + centerOffset - halfThickness });
      lower.push({ x, y: CENTER_Y + centerOffset + halfThickness });
    }

    const reversedLower = [...lower].reverse();
    const firstUpper = upper[0]!;
    const firstLower = reversedLower[0]!;

    return [
      `M ${firstUpper.x.toFixed(2)} ${firstUpper.y.toFixed(2)}`,
      curveSegments(upper),
      ` Q ${WIDTH.toFixed(2)} ${CENTER_Y.toFixed(2)}, ${firstLower.x.toFixed(2)} ${firstLower.y.toFixed(2)}`,
      curveSegments(reversedLower),
      ` Q 0 ${CENTER_Y.toFixed(2)}, ${firstUpper.x.toFixed(2)} ${firstUpper.y.toFixed(2)} Z`,
    ].join('');
  }

  function draw(time = 0) {
    pathElement.value?.setAttribute(
      'd',
      buildRibbonPath(
        time,
        animateAccentRule.value ? accentRuleStrength.value : 0,
        animateAccentRule.value ? accentWaveAmplitude.value : 0,
      ),
    );
  }

  function stop() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function tick(timestamp: number) {
    if (timestamp - previousFrame >= FRAME_INTERVAL) {
      previousFrame = timestamp;
      draw(timestamp / 1000);
    }
    animationFrame = window.requestAnimationFrame(tick);
  }

  function reconcileMotion() {
    const shouldAnimate =
      isVectorTexture.value &&
      animateAccentRule.value &&
      isVisible &&
      !transitionState.value.active &&
      !reducedMotionQuery?.matches;

    if (!shouldAnimate) {
      stop();
      draw();
      return;
    }

    if (!animationFrame) animationFrame = window.requestAnimationFrame(tick);
  }

  onMounted(() => {
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', reconcileMotion);
    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        reconcileMotion();
      },
      { rootMargin: '120px' },
    );
    if (svgElement.value) observer.observe(svgElement.value);
    draw();
    reconcileMotion();
  });

  watch(
    [
      animateAccentRule,
      accentRuleStrength,
      accentRuleSpeed,
      accentRuleTexture,
      accentWaveAmplitude,
      accentWaveFrequency,
      accentRuleThickness,
      transitionState,
    ],
    reconcileMotion,
  );

  onBeforeUnmount(() => {
    stop();
    observer?.disconnect();
    reducedMotionQuery?.removeEventListener('change', reconcileMotion);
  });
</script>

<template>
  <span class="accent-rule" aria-hidden="true">
    <svg
      v-show="isVectorTexture"
      ref="svgElement"
      class="fluid-rule"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      preserveAspectRatio="none"
      overflow="visible"
    >
      <path ref="pathElement" />
    </svg>
    <HomeWebglAccentRule v-if="!isVectorTexture" class="fluid-rule" />
  </span>
</template>

<style lang="scss" scoped>
  .accent-rule,
  .fluid-rule {
    display: block;
    width: 100%;
    height: 0.75rem;
  }

  .accent-rule {
    overflow: visible;
    pointer-events: none;
  }

  svg.fluid-rule {
    overflow: visible;
  }

  path {
    fill: var(--color-primary);
  }
</style>
