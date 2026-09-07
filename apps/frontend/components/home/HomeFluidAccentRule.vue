<script setup lang="ts">
  type Point = { x: number; y: number };

  const svgElement = ref<SVGSVGElement | null>(null);
  const pathElement = ref<SVGPathElement | null>(null);
  const {
    animateAccentRule,
    accentRuleStrength,
    accentRuleSpeed,
    accentWaveFrequency,
    accentRuleThickness,
  } = useHomeMotionDebug();
  const { waveAmplitude: accentWaveAmplitude } = useHomeResponsiveAccentRule();
  const transitionState = useFeaturedMediaTransitionState();

  const WIDTH = 224;
  const HEIGHT = 24;
  const CENTER_Y = HEIGHT / 2;
  const POINT_COUNT = 96;
  const FRAME_INTERVAL = 1000 / 30;
  const FULL_CIRCLE = Math.PI * 2;
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

  function unitVector(from: Point, to: Point): Point {
    const x = to.x - from.x;
    const y = to.y - from.y;
    const length = Math.hypot(x, y) || 1;

    return { x: x / length, y: y / length };
  }

  function flagCenterOffset(
    progress: number,
    travel: number,
    waveAmplitude: number,
  ) {
    const amplitudeDrift =
      0.78 + noise(progress * 1.7 + travel * 0.045, 83) * 0.22;
    const primaryWave = Math.sin(
      progress * FULL_CIRCLE * 1.55 * accentWaveFrequency.value - travel * 0.72,
    );
    const wanderingWave = Math.sin(
      progress * FULL_CIRCLE * 0.72 * accentWaveFrequency.value +
        travel * 0.31 +
        1.2,
    );

    return (
      (primaryWave * amplitudeDrift + wanderingWave * 0.22) *
      waveAmplitude *
      5.8
    );
  }

  function flagHalfThickness(
    progress: number,
    travel: number,
    strength: number,
  ) {
    return (
      1.45 +
      strength * 0.18 +
      noise(progress * 2.6 - travel * 0.055, 97) * strength * 0.16
    );
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

      centerOffset = flagCenterOffset(progress, travel, waveAmplitude);
      halfThickness = flagHalfThickness(progress, travel, strength);

      halfThickness *= accentRuleThickness.value;

      upper.push({ x, y: CENTER_Y + centerOffset - halfThickness });
      lower.push({ x, y: CENTER_Y + centerOffset + halfThickness });
    }

    const reversedLower = [...lower].reverse();
    const firstUpper = upper[0]!;
    const firstLower = reversedLower[0]!;
    const lastUpper = upper[upper.length - 1]!;
    const leftLower = lower[0]!;
    const rightUpperTangent = unitVector(upper[upper.length - 2]!, lastUpper);
    const rightLowerTangent = unitVector(
      lower[lower.length - 1]!,
      lower[lower.length - 2]!,
    );
    const leftLowerTangent = unitVector(lower[1]!, leftLower);
    const leftUpperTangent = unitVector(firstUpper, upper[1]!);
    const rightCapDepth = Math.min(
      16,
      Math.max(3, Math.abs(firstLower.y - lastUpper.y) * 0.42),
    );
    const leftCapDepth = Math.min(
      16,
      Math.max(3, Math.abs(leftLower.y - firstUpper.y) * 0.42),
    );

    return [
      `M ${firstUpper.x.toFixed(2)} ${firstUpper.y.toFixed(2)}`,
      curveSegments(upper),
      ` C ${(lastUpper.x + rightUpperTangent.x * rightCapDepth).toFixed(2)} ${(lastUpper.y + rightUpperTangent.y * rightCapDepth).toFixed(2)}, ${(firstLower.x - rightLowerTangent.x * rightCapDepth).toFixed(2)} ${(firstLower.y - rightLowerTangent.y * rightCapDepth).toFixed(2)}, ${firstLower.x.toFixed(2)} ${firstLower.y.toFixed(2)}`,
      curveSegments(reversedLower),
      ` C ${(leftLower.x + leftLowerTangent.x * leftCapDepth).toFixed(2)} ${(leftLower.y + leftLowerTangent.y * leftCapDepth).toFixed(2)}, ${(firstUpper.x - leftUpperTangent.x * leftCapDepth).toFixed(2)} ${(firstUpper.y - leftUpperTangent.y * leftCapDepth).toFixed(2)}, ${firstUpper.x.toFixed(2)} ${firstUpper.y.toFixed(2)} Z`,
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
      ref="svgElement"
      class="fluid-rule"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      preserveAspectRatio="none"
      overflow="visible"
    >
      <path ref="pathElement" />
    </svg>
  </span>
</template>

<style lang="scss" scoped>
  .accent-rule,
  .fluid-rule {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
  }

  .accent-rule {
    position: relative;
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
