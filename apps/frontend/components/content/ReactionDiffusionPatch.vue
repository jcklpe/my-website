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
      interactive?: boolean;
    }>(),
    {
      active: true,
      intensity: 1,
      columns: 144,
      rows: 28,
      warmupSteps: 650,
      stepMs: 90,
      mode: 'free',
      interactive: false,
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
  let bakedSeedU: Float32Array | null = null;
  let bakedSeedV: Float32Array | null = null;
  let imageData: ImageData | null = null;
  let timer = 0;
  let observer: IntersectionObserver | null = null;
  let motionQuery: MediaQueryList | null = null;
  let simulationPhase = 0;
  let simulationStep = 0;
  let pointerActive = false;
  let pointerX = 0.5;
  let pointerY = 0.5;
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
    if (
      (props.mode !== 'organism' && props.mode !== 'eyebrow') ||
      !bakedSeedUrls.length
    )
      return false;

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
    bakedSeedU = new Float32Array(u);
    bakedSeedV = new Float32Array(v);
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

  function smoothstep(edge0: number, edge1: number, value: number) {
    const progress = Math.max(
      0,
      Math.min(1, (value - edge0) / (edge1 - edge0)),
    );
    return progress * progress * (3 - 2 * progress);
  }

  function terrainAt(x: number, y: number) {
    return (
      Math.sin(x * 0.073 + simulationPhase * 0.82) * 0.42 +
      Math.sin(y * 0.091 - simulationPhase * 0.61) * 0.33 +
      Math.sin((x + y) * 0.038 + simulationPhase * 0.37) * 0.25
    );
  }

  function seedOrganismBlossom() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const x = Math.round(columns * (0.18 + Math.random() * 0.64));
      const y = Math.round(rows * (0.18 + Math.random() * 0.64));
      const normalizedX = x / Math.max(1, columns - 1) - 0.5;
      const normalizedY = y / Math.max(1, rows - 1) - 0.5;
      const ellipseDistance = Math.hypot(normalizedX * 2, normalizedY * 2);

      if (ellipseDistance < 0.72 && terrainAt(x, y) < 0.3) {
        seedBlob(x, y, simulationStep % 60 === 0 ? 3 : 2);
        return;
      }
    }
  }

  function simulate() {
    simulationStep += 1;
    simulationPhase +=
      props.mode === 'organism'
        ? 0.032
        : props.mode === 'eyebrow'
          ? 0.016
          : 0.002;

    if (props.mode === 'organism' && simulationStep % 30 === 0) {
      seedOrganismBlossom();
    }

    const seedOffsetX = Math.round(
      Math.sin(simulationPhase * 0.08) * columns * 0.08,
    );
    const seedOffsetY = Math.round(
      Math.sin(simulationPhase * 0.053 + 1.7) * rows * 0.06,
    );

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const index = indexFor(x, y);
        const currentU = u[index];
        const currentV = v[index];
        const reaction = currentU * currentV * currentV;
        let localFeed = props.mode === 'eyebrow' ? 0.0545 : FEED;
        let localKill = props.mode === 'eyebrow' ? 0.062 : KILL;
        let terrain = 0;

        if (props.mode === 'eyebrow' || props.mode === 'organism') {
          terrain = terrainAt(x, y);
          localKill += terrain * 0.0018;
          localFeed -= terrain * 0.0008;

          if (props.mode === 'organism') {
            const deadZone = smoothstep(0.28, 0.78, terrain);
            localKill += deadZone * 0.004;
            localFeed -= deadZone * 0.001;
          }
        }

        if (props.mode === 'organism') {
          const normalizedX = x / Math.max(1, columns - 1) - 0.5;
          const normalizedY = y / Math.max(1, rows - 1) - 0.5;
          const ellipseDistance = Math.hypot(normalizedX * 2, normalizedY * 2);
          const edgeHostility = smoothstep(0.78, 1.04, ellipseDistance);
          localKill += edgeHostility * 0.018;
          localFeed -= edgeHostility * 0.004;
        } else if (props.mode === 'eyebrow') {
          const interiorDistance = Math.min(
            x / (columns * 0.2),
            (columns - 1 - x) / (columns * 0.2),
            y / (rows * 0.2),
            (rows - 1 - y) / (rows * 0.2),
          );
          const edgeAmount = 1 - Math.max(0, Math.min(1, interiorDistance));
          const edgeHostility = edgeAmount * edgeAmount * (3 - 2 * edgeAmount);
          localKill += edgeHostility * 0.038;
          localFeed -= edgeHostility * 0.01;
        }

        if (props.interactive && pointerActive) {
          const normalizedX = x / Math.max(1, columns - 1);
          const normalizedY = y / Math.max(1, rows - 1);
          const aspect = columns / rows;
          const distance = Math.hypot(
            (normalizedX - pointerX) * Math.min(1, aspect),
            (normalizedY - pointerY) * Math.min(1, 1 / aspect),
          );
          const influence = Math.max(0, 1 - distance / 0.2);
          const easedInfluence = influence * influence * (3 - 2 * influence);
          const speckle = smoothstep(
            0.15,
            0.78,
            Math.sin(x * 0.41 + simulationPhase * 0.7) * 0.5 +
              Math.sin(y * 0.37 - simulationPhase * 0.53) * 0.5,
          );
          localKill -= easedInfluence * (0.009 + speckle * 0.012);
          localFeed += easedInfluence * (0.0015 + speckle * 0.0015);
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
        const flowAngle =
          Math.sin(simulationPhase * 0.11) * 0.9 +
          Math.sin(simulationPhase * 0.047) * 0.55;
        const flowX = Math.cos(flowAngle);
        const flowY = Math.sin(flowAngle);
        const flowWeight = Math.abs(flowX) + Math.abs(flowY);
        const upstreamX = x - Math.sign(flowX);
        const upstreamY = y - Math.sign(flowY);
        const transportedV =
          props.mode === 'organism'
            ? ((Math.abs(flowX) * v[indexFor(upstreamX, y)] +
                Math.abs(flowY) * v[indexFor(x, upstreamY)]) /
                flowWeight -
                currentV) *
              0.025
            : 0;

        nextV[index] = Math.min(
          1,
          Math.max(
            0,
            currentV +
              (DIFFUSION_V * laplacian(v, x, y) +
                reaction -
                (localKill + localFeed) * currentV) +
              transportedV,
          ),
        );

        if (props.mode === 'organism' && bakedSeedU && bakedSeedV) {
          const normalizedX = x / Math.max(1, columns - 1) - 0.5;
          const normalizedY = y / Math.max(1, rows - 1) - 0.5;
          const ellipseDistance = Math.hypot(normalizedX * 2, normalizedY * 2);
          if (ellipseDistance < 0.84) {
            const seedIndex = indexFor(x + seedOffsetX, y + seedOffsetY);
            const reservoirV = bakedSeedV[seedIndex] ?? 0;
            const reservoirGate = 1 - smoothstep(0.34, 0.82, terrain);
            const reservoirFloor = reservoirV * reservoirGate * 0.82;

            if (reservoirFloor > nextV[index]) {
              nextU[index] +=
                ((bakedSeedU[seedIndex] ?? nextU[index]) - nextU[index]) * 0.18;
              nextV[index] = reservoirFloor;
            }
          }
        }
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
        const rawConcentration = Math.max(
          0,
          Math.min(1, (v[sourceIndex] - 0.13) / (0.22 - 0.13)),
        );
        const displayConcentration = smoothstep(0, 1, rawConcentration);
        const concentration =
          props.mode === 'eyebrow'
            ? Math.max(0, Math.min(1, (displayConcentration - 0.12) / 0.5))
            : displayConcentration;
        const normalizedX = x / Math.max(1, columns - 1);
        const normalizedY = y / Math.max(1, rows - 1);
        const ellipseDistance = Math.hypot(
          (normalizedX - 0.5) * 2,
          (normalizedY - 0.5) * 2,
        );
        const edgeFade =
          props.mode === 'organism'
            ? 1 - smoothstep(0.58, 1.08, ellipseDistance)
            : 1;
        const pixel = destinationIndex * 4;
        imageData.data[pixel] = 205;
        imageData.data[pixel + 1] = 222;
        imageData.data[pixel + 2] = 255;
        imageData.data[pixel + 3] = Math.round(
          Math.pow(
            concentration,
            props.mode === 'eyebrow'
              ? 0.92
              : props.mode === 'organism'
                ? 0.86
                : 0.72,
          ) *
            255 *
            (props.mode === 'organism' ? 0.62 : 1) *
            alphaScale *
            edgeFade,
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
        ? 2
        : props.mode === 'eyebrow'
          ? 8
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

  function updatePointer(event: PointerEvent) {
    if (!props.interactive || event.pointerType === 'touch') return;
    const bounds = canvas.value?.getBoundingClientRect();
    if (!bounds) return;

    pointerActive =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;
    if (!pointerActive) return;

    pointerX = (event.clientX - bounds.left) / bounds.width;
    pointerY = (event.clientY - bounds.top) / bounds.height;
  }

  function clearPointer() {
    pointerActive = false;
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
    if (props.interactive) {
      window.addEventListener('pointermove', updatePointer, { passive: true });
      document.addEventListener('mouseleave', clearPointer);
    }

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
    window.removeEventListener('pointermove', updatePointer);
    document.removeEventListener('mouseleave', clearPointer);
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
