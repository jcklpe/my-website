<script setup lang="ts">
  type Point = { x: number; y: number };

  const svgElement = ref<SVGSVGElement | null>(null);
  const pathElement = ref<SVGPathElement | null>(null);
  const {
    animateAccentRule,
    accentRuleStrength,
    accentRuleSpeed,
    accentRuleTexture,
    accentWaveFrequency,
    accentRuleThickness,
    lavaThickness,
    lavaLength,
    lavaDispersion,
    lavaParticleReach,
    hybridShedDensity,
    hybridShedForce,
  } = useHomeMotionDebug();
  const {
    waveAmplitude: accentWaveAmplitude,
    boxWidth: accentRuleBoxWidth,
    boxHeight: accentRuleBoxHeight,
  } = useHomeResponsiveAccentRule();
  const transitionState = useFeaturedMediaTransitionState();

  const WIDTH = 224;
  const HEIGHT = 24;
  const CENTER_Y = HEIGHT / 2;
  const POINT_COUNT = 96;
  const FRAME_INTERVAL = 1000 / 30;
  const FULL_CIRCLE = Math.PI * 2;
  const isVectorTexture = computed(
    () =>
      accentRuleTexture.value === 'vector-flag' ||
      accentRuleTexture.value === 'hybrid-flag-shedding',
  );
  const isHybridTexture = computed(
    () => accentRuleTexture.value === 'hybrid-flag-shedding',
  );
  const hybridParticles = reactive(
    Array.from({ length: 14 }, () => ({
      cx: WIDTH - 8,
      cy: CENTER_Y,
      rx: 0,
      ry: 0,
      opacity: 0,
    })),
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

  function unitVector(from: Point, to: Point): Point {
    const x = to.x - from.x;
    const y = to.y - from.y;
    const length = Math.hypot(x, y) || 1;

    return { x: x / length, y: y / length };
  }

  function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value));
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

      if (
        accentRuleTexture.value === 'vector-flag' ||
        accentRuleTexture.value === 'hybrid-flag-shedding'
      ) {
        centerOffset = flagCenterOffset(progress, travel, waveAmplitude);
        halfThickness =
          1.45 +
          strength * 0.18 +
          noise(progress * 2.6 - travel * 0.055, 97) * strength * 0.16;
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

  function updateHybridParticles(time: number) {
    const travel = time * accentRuleSpeed.value;

    hybridParticles.forEach((particle, index) => {
      const sourceProgress = 0.08 + ((index * 0.173) % 0.84);
      const phase =
        (travel * (0.052 + (index % 4) * 0.004) + index * 0.137) % 1;
      const life = Math.pow(Math.sin(Math.PI * phase), 0.8);
      const sampleDistance = 0.015;
      const center = flagCenterOffset(
        sourceProgress,
        travel,
        accentWaveAmplitude.value,
      );
      const centerBefore = flagCenterOffset(
        Math.max(0, sourceProgress - sampleDistance),
        travel,
        accentWaveAmplitude.value,
      );
      const centerAfter = flagCenterOffset(
        Math.min(1, sourceProgress + sampleDistance),
        travel,
        accentWaveAmplitude.value,
      );
      const futureCenter = flagCenterOffset(
        sourceProgress,
        travel + 0.04,
        accentWaveAmplitude.value,
      );
      const slope = (centerAfter - centerBefore) / (sampleDistance * 2);
      const normalLength = Math.hypot(slope, WIDTH - 12) || 1;
      const normalX = -slope / normalLength;
      const normalY = (WIDTH - 12) / normalLength;
      const whipVelocity = futureCenter - center;
      const whipIntensity = Math.min(1.6, Math.abs(whipVelocity) * 0.2);
      const side = Math.sign(whipVelocity || (index % 2 ? 1 : -1));
      const densityPosition = (index + 0.5) / hybridParticles.length;
      const densityFade = clamp(
        (hybridShedDensity.value - densityPosition) * 8 + 0.5,
        0,
        1,
      );
      const reach =
        phase *
        (8 + lavaParticleReach.value * 15) *
        hybridShedForce.value *
        (0.45 + whipIntensity);
      const wander =
        Math.sin(phase * FULL_CIRCLE * (1.1 + index * 0.08) + index) *
        lavaDispersion.value;
      const size =
        (2.8 + whipIntensity * 3.2) *
        life *
        Math.max(0.35, lavaThickness.value);
      const sourceX = 6 + sourceProgress * (WIDTH - 12);

      particle.cx = sourceX + normalX * reach * side + wander * phase * 1.5;
      particle.cy =
        CENTER_Y + center + normalY * reach * side + wander * phase * 2.5;
      particle.rx =
        size * (1.25 - phase * 0.3) * Math.max(0.45, lavaLength.value);
      const svgAspectCompensation =
        accentRuleBoxWidth.value / WIDTH / (accentRuleBoxHeight.value / HEIGHT);
      particle.ry =
        size * (0.7 + Math.sin(phase * Math.PI) * 0.24) * svgAspectCompensation;
      particle.opacity = isHybridTexture.value
        ? life * densityFade * (0.45 + whipIntensity * 0.35)
        : 0;
    });
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
    updateHybridParticles(time);
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
      accentRuleBoxWidth,
      accentRuleBoxHeight,
      accentWaveFrequency,
      accentRuleThickness,
      lavaThickness,
      lavaLength,
      lavaDispersion,
      lavaParticleReach,
      hybridShedDensity,
      hybridShedForce,
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
      <g v-if="isHybridTexture" class="shed-particles">
        <ellipse
          v-for="(particle, index) in hybridParticles"
          :key="index"
          :cx="particle.cx"
          :cy="particle.cy"
          :rx="particle.rx"
          :ry="particle.ry"
          :opacity="particle.opacity"
        />
      </g>
    </svg>
    <HomeWebglAccentRule v-if="!isVectorTexture" class="fluid-rule" />
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
    overflow: visible;
    pointer-events: none;
  }

  svg.fluid-rule {
    overflow: visible;
  }

  path,
  .shed-particles ellipse {
    fill: var(--color-primary);
  }
</style>
