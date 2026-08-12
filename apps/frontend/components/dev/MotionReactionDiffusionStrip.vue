<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      active?: boolean;
      intensity?: number;
    }>(),
    {
      active: true,
      intensity: 1,
    },
  );

  const canvas = ref<HTMLCanvasElement | null>(null);
  const isVisible = ref(true);

  const COLS = 144;
  const ROWS = 28;
  const FEED = 0.0496;
  const KILL = 0.0619;
  const DIFFUSION_U = 0.32;
  const DIFFUSION_V = 0.16;
  const STEP_MS = 90;

  let u = new Float32Array(COLS * ROWS);
  let v = new Float32Array(COLS * ROWS);
  let nextU = new Float32Array(COLS * ROWS);
  let nextV = new Float32Array(COLS * ROWS);
  let imageData: ImageData | null = null;
  let timer = 0;
  let observer: IntersectionObserver | null = null;
  let motionQuery: MediaQueryList | null = null;

  function indexFor(x: number, y: number) {
    const wrappedX = (x + COLS) % COLS;
    const wrappedY = (y + ROWS) % ROWS;
    return wrappedY * COLS + wrappedX;
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

    seedBlob(14, 13, 3);
    seedBlob(43, 9, 3);
    seedBlob(70, 18, 4);
    seedBlob(99, 10, 3);
    seedBlob(128, 17, 4);

    for (let step = 0; step < 650; step += 1) {
      simulate();
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
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const index = indexFor(x, y);
        const currentU = u[index];
        const currentV = v[index];
        const reaction = currentU * currentV * currentV;

        nextU[index] = Math.min(
          1,
          Math.max(
            0,
            currentU +
              (DIFFUSION_U * laplacian(u, x, y) -
                reaction +
                FEED * (1 - currentU)),
          ),
        );
        nextV[index] = Math.min(
          1,
          Math.max(
            0,
            currentV +
              (DIFFUSION_V * laplacian(v, x, y) +
                reaction -
                (KILL + FEED) * currentV),
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

    imageData ??= context.createImageData(COLS, ROWS);
    const alphaScale = Math.min(1.35, Math.max(0.35, props.intensity));

    for (let index = 0; index < v.length; index += 1) {
      const concentration = Math.max(0, Math.min(1, v[index] * 4.5));
      const pixel = index * 4;
      imageData.data[pixel] = 38;
      imageData.data[pixel + 1] = 87;
      imageData.data[pixel + 2] = 235;
      imageData.data[pixel + 3] = Math.round(concentration * 235 * alphaScale);
    }

    context.clearRect(0, 0, COLS, ROWS);
    context.putImageData(imageData, 0, 0);
  }

  function stop() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function tick() {
    stop();
    if (!props.active || !isVisible.value || motionQuery?.matches) return;

    simulate();
    simulate();
    draw();
    timer = window.setTimeout(tick, STEP_MS);
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
    :width="COLS"
    :height="ROWS"
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
