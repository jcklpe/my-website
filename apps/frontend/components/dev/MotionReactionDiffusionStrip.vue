<script setup lang="ts">
  const bakedSeedUrls = Object.values(
    import.meta.glob('../../assets/rd-seeds/*.png', {
      eager: true,
      import: 'default',
      query: '?url',
    }),
  ) as string[];

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
    warmupRemaining = props.mode === 'eyebrow' ? 650 : props.warmupSteps;

    if (props.mode === 'eyebrow') {
      let seedIndex = 0;
      for (let x = Math.round(columns * 0.14); x < columns * 0.86; x += 6) {
        const centerY = Math.round(
          rows * 0.5 +
            Math.sin(x * 0.055) * rows * 0.07 +
            Math.sin(x * 0.19 + seedIndex * 0.7) * rows * 0.08,
        );
        seedBlob(x, centerY, seedIndex % 3 === 0 ? 2 : 1);
        seedIndex += 1;
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

  async function loadBakedSeed() {
    if (props.mode !== 'organism' || !bakedSeedUrls.length) return false;

    const seedUrl =
      bakedSeedUrls[Math.floor(Math.random() * bakedSeedUrls.length)];
    if (!seedUrl) return false;

    const image = new Image();
    image.src = seedUrl;
    try {
      await image.decode();
    } catch {
      return false;
    }

    const sourceAspect = image.naturalWidth / image.naturalHeight;
    const targetAspect = columns / rows;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;

    if (sourceAspect > targetAspect) {
      sourceWidth = image.naturalHeight * targetAspect;
      const availableOffset = image.naturalWidth - sourceWidth;
      sourceX = availableOffset * (0.2 + Math.random() * 0.6);
    } else {
      sourceHeight = image.naturalWidth / targetAspect;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    const seedCanvas = document.createElement('canvas');
    seedCanvas.width = columns;
    seedCanvas.height = rows;
    const context = seedCanvas.getContext('2d', { willReadFrequently: true });
    if (!context) return false;

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      columns,
      rows,
    );
    const pixels = context.getImageData(0, 0, columns, rows).data;
    for (let index = 0; index < u.length; index += 1) {
      u[index] = pixels[index * 4] / 255;
      v[index] = pixels[index * 4 + 1] / 255;
    }
    nextU.set(u);
    nextV.set(v);
    warmupRemaining = 0;
    return true;
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
    simulationPhase +=
      props.mode === 'organism'
        ? 0.032
        : props.mode === 'eyebrow'
          ? 0.016
          : 0.002;

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
            ? FEED
            : props.mode === 'organism'
              ? 0.0545
              : FEED;
        let localKill =
          props.mode === 'eyebrow'
            ? KILL
            : props.mode === 'organism'
              ? 0.062
              : KILL;

        if (props.mode === 'eyebrow') {
          const centerLine =
            rows * 0.5 +
            Math.sin(x * 0.055 - simulationPhase * 0.8) * rows * 0.07 +
            Math.sin(x * 0.014 + simulationPhase * 0.28) * rows * 0.04;
          const distanceFromLine = Math.abs(y - centerLine) / rows;
          const fertileCore = Math.exp(-Math.pow(distanceFromLine / 0.055, 2));
          const edgeDistance = Math.min(
            x / (columns * 0.12),
            (columns - 1 - x) / (columns * 0.12),
            y / (rows * 0.3),
            (rows - 1 - y) / (rows * 0.3),
          );
          const edgeHostility = Math.pow(
            1 - Math.max(0, Math.min(1, edgeDistance)),
            2,
          );
          const terrain =
            Math.sin(x * 0.045 + simulationPhase) * 0.55 +
            Math.sin(x * 0.09 - simulationPhase * 0.63) * 0.25 +
            Math.sin(y * 0.18 + simulationPhase * 0.4) * 0.2;
          localKill -= fertileCore * 0.0022;
          localFeed += fertileCore * 0.0005;
          localKill += edgeHostility * 0.034;
          localFeed -= edgeHostility * 0.01;
          localKill += terrain * 0.0024;
          localFeed -= terrain * 0.001;
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

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const destinationIndex = y * columns + x;
        const sourceIndex = indexFor(x, y);
        const rawConcentration = Math.max(0, Math.min(1, v[sourceIndex] * 4.5));
        const concentration =
          props.mode === 'eyebrow'
            ? Math.max(0, Math.min(1, (rawConcentration - 0.12) / 0.5))
            : rawConcentration;
        const edgeFade =
          props.mode === 'eyebrow'
            ? Math.max(
                0,
                Math.min(
                  1,
                  Math.min(
                    x / (columns * 0.1),
                    (columns - 1 - x) / (columns * 0.1),
                    y / (rows * 0.24),
                    (rows - 1 - y) / (rows * 0.24),
                  ),
                ),
              )
            : 1;
        const smoothEdgeFade = edgeFade * edgeFade * (3 - 2 * edgeFade);
        const pixel = destinationIndex * 4;
        imageData.data[pixel] = 30;
        imageData.data[pixel + 1] = 75;
        imageData.data[pixel + 2] = 225;
        imageData.data[pixel + 3] = Math.round(
          Math.pow(concentration, props.mode === 'eyebrow' ? 0.92 : 0.72) *
            255 *
            alphaScale *
            smoothEdgeFade,
        );
      }
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
      : props.mode === 'organism'
        ? 3
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

  onMounted(async () => {
    const element = canvas.value;
    if (!element) return;

    reset();
    await loadBakedSeed();
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
