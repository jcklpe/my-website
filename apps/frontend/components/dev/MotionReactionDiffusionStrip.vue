<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      active?: boolean;
      intensity?: number;
      columns?: number;
      rows?: number;
      warmupSteps?: number;
      stepMs?: number;
      mode?: 'free' | 'eyebrow' | 'organism';
    }>(),
    {
      active: true,
      intensity: 1,
      columns: 144,
      rows: 28,
      warmupSteps: 650,
      stepMs: 90,
      mode: 'free',
    },
  );

  const canvas = ref<HTMLCanvasElement | null>(null);
  const isVisible = ref(true);

  const columns = props.columns;
  const rows = props.rows;
  const FEED = 0.0496;
  const KILL = 0.0619;
  const DIFFUSION_U = 0.32;
  const DIFFUSION_V = 0.16;
  let u = new Float32Array(columns * rows);
  let v = new Float32Array(columns * rows);
  let nextU = new Float32Array(columns * rows);
  let nextV = new Float32Array(columns * rows);
  let imageData: ImageData | null = null;
  let timer = 0;
  let observer: IntersectionObserver | null = null;
  let motionQuery: MediaQueryList | null = null;
  let simulationPhase = 0;
  let simulationStep = 0;
  let warmupRemaining = 0;

  function indexFor(x: number, y: number) {
    const wrappedX = (x + columns) % columns;
    const wrappedY = (y + rows) % rows;
    return wrappedY * columns + wrappedX;
  }

  function seedBlob(centerX: number, centerY: number, radius: number) {
    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
      for (let x = centerX - radius; x <= centerX + radius; x += 1) {
        const distance = Math.hypot(x - centerX, y - centerY);
        if (distance > radius) continue;

        const index = indexFor(x, y);
        u[index] = 0.42 + Math.random() * 0.08;
        v[index] = 0.78 + Math.random() * 0.16;
      }
    }
  }

  function reset() {
    u.fill(1);
    v.fill(0);
    nextU.fill(1);
    nextV.fill(0);

    simulationPhase = 0;
    simulationStep = 0;
    warmupRemaining = props.warmupSteps;

    if (props.mode === 'eyebrow') {
      const centerY = Math.round(rows * 0.5);
      const sourceStart = Math.round(columns * 0.06);
      const sourceEnd = Math.round(columns * 0.78);
      for (let x = sourceStart; x <= sourceEnd; x += 2) {
        if (x % 31 < 3) continue;
        const y = centerY + Math.round(Math.sin(x * 0.19) * 2);
        seedBlob(x, y, 1);
      }
    } else {
      const seedCount = rows > columns ? 12 : 9;
      const radius = Math.max(1, Math.round(Math.min(columns, rows) * 0.05));
      for (let seed = 0; seed < seedCount; seed += 1) {
        const x = Math.round(columns * (0.1 + ((seed * 0.173) % 0.8)));
        const y = Math.round(rows * (0.16 + ((seed * 0.317) % 0.68)));
        seedBlob(x, y, radius + (seed % 2));
      }
    }

  }

  function laplacian(field: Float32Array, x: number, y: number) {
    const center = field[indexFor(x, y)] * -1;
    const orthogonal =
      (field[indexFor(x - 1, y)] +
        field[indexFor(x + 1, y)] +
        field[indexFor(x, y - 1)] +
        field[indexFor(x, y + 1)]) *
      0.2;
    const diagonal =
      (field[indexFor(x - 1, y - 1)] +
        field[indexFor(x + 1, y - 1)] +
        field[indexFor(x - 1, y + 1)] +
        field[indexFor(x + 1, y + 1)]) *
      0.05;

    return center + orthogonal + diagonal;
  }

  function simulate() {
    simulationStep += 1;
    simulationPhase += props.mode === 'organism' ? 0.012 : 0.002;

    if (props.mode === 'eyebrow' && simulationStep % 42 === 0) {
      const detachedSeed = simulationStep % 84 === 0;
      seedBlob(
        Math.round(columns * (0.12 + Math.random() * 0.58)),
        Math.round(
          rows *
            (detachedSeed
              ? 0.25 + Math.random() * 0.5
              : 0.46 + Math.random() * 0.08),
        ),
        1,
      );
    }

    if (props.mode === 'organism' && simulationStep % 150 === 0) {
      seedBlob(
        Math.round(columns * (0.18 + Math.random() * 0.64)),
        Math.round(rows * (0.18 + Math.random() * 0.64)),
        1,
      );
    }

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const index = indexFor(x, y);
        const currentU = u[index];
        const currentV = v[index];
        const reaction = currentU * currentV * currentV;
        let localFeed =
          props.mode === 'eyebrow'
            ? 0.035
            : props.mode === 'organism'
              ? 0.0545
              : FEED;
        let localKill =
          props.mode === 'eyebrow'
            ? 0.06
            : props.mode === 'organism'
              ? 0.062
              : KILL;

        if (props.mode === 'eyebrow') {
          const distanceFromSource = Math.abs(y - rows * 0.5) / (rows * 0.5);
          localKill += Math.pow(distanceFromSource, 1.7) * 0.011;
        }

        if (props.mode === 'organism') {
          const terrain =
            Math.sin(x * 0.12 + simulationPhase) * 0.5 +
            Math.sin(y * 0.085 - simulationPhase * 0.72) * 0.5;
          localKill += terrain * 0.0028;
          localFeed -= terrain * 0.0012;
        }

        nextU[index] = Math.min(
          1,
          Math.max(
            0,
            currentU +
              (DIFFUSION_U * laplacian(u, x, y) -
                reaction +
                localFeed * (1 - currentU)),
          ),
        );
        nextV[index] = Math.min(
          1,
          Math.max(
            0,
            currentV +
              (DIFFUSION_V * laplacian(v, x, y) +
                reaction -
                (localKill + localFeed) * currentV),
          ),
        );
      }
    }

    [u, nextU] = [nextU, u];
    [v, nextV] = [nextV, v];
  }

  function draw() {
    const context = canvas.value?.getContext('2d');
    if (!context) return;

    imageData ??= context.createImageData(columns, rows);
    const alphaScale = Math.min(1.4, Math.max(0.35, props.intensity));

    for (let index = 0; index < v.length; index += 1) {
      const concentration = Math.max(0, Math.min(1, v[index] * 4.5));
      const pixel = index * 4;
      imageData.data[pixel] = 30;
      imageData.data[pixel + 1] = 75;
      imageData.data[pixel + 2] = 225;
      imageData.data[pixel + 3] = Math.round(
        Math.pow(concentration, 0.72) * 255 * alphaScale,
      );
    }

    context.clearRect(0, 0, columns, rows);
    context.putImageData(imageData, 0, 0);
  }

  function stop() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function tick() {
    stop();
    if (!props.active || !isVisible.value || motionQuery?.matches) return;

    const simulationCount = warmupRemaining
      ? Math.min(14, warmupRemaining)
      : 2;
    for (let step = 0; step < simulationCount; step += 1) {
      simulate();
    }
    warmupRemaining = Math.max(0, warmupRemaining - simulationCount);
    draw();
    timer = window.setTimeout(tick, warmupRemaining ? 24 : props.stepMs);
  }

  function reconcileMotion() {
    draw();
    tick();
  }

  watch(
    () => [props.active, props.intensity],
    () => reconcileMotion(),
  );

  onMounted(() => {
    const element = canvas.value;
    if (!element) return;

    reset();
    draw();

    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', reconcileMotion);

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        isVisible.value = entry?.isIntersecting ?? true;
        reconcileMotion();
      });
      observer.observe(element);
    }

    tick();
  });

  onBeforeUnmount(() => {
    stop();
    observer?.disconnect();
    motionQuery?.removeEventListener('change', reconcileMotion);
  });
</script>

<template>
  <canvas
    ref="canvas"
    class="rd-strip"
    :width="columns"
    :height="rows"
    aria-hidden="true"
  />
</template>

<style lang="scss" scoped>
  .rd-strip {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
