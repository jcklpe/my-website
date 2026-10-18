<script setup lang="ts">
  // Conway's Game of Life shares the Side Projects card and interior-page background. Pointer movement seeds a soft bloom; the viewport variant listens through the content above its non-interactive canvas. Coarse cells, 10 FPS, offscreen pausing, and a static reduced-motion frame bound its cost.
  const props = defineProps<{
    viewportInteraction?: boolean;
  }>();

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const transitionState = useFeaturedMediaTransitionState();

  // Taste knobs (see spike doc). CELL_SIZE/opacity/FPS/DENSITY are what to tune.
  const CELL_SIZE = 8;
  const FPS = 10;
  const DENSITY = 0.28;
  const FALLBACK_COLOR = '#218d4e';

  // Hover-inject knobs: while the pointer rests over the card, a loose cluster
  // is re-seeded near it every STAMP_INTERVAL ms — so the effect persists and
  // builds instead of dying after a single stamp. Bigger radius / density /
  // shorter interval = stronger, more persistent bloom.
  const STAMP_RADIUS = 15;
  const STAMP_DENSITY = 0.6;
  const STAMP_INTERVAL = 110;

  let ctx: CanvasRenderingContext2D | null = null;
  let parent: HTMLElement | null = null;
  let pointerTarget: HTMLElement | Window | null = null;
  let cellColor = FALLBACK_COLOR;

  // Double-buffered flat grids (0=dead, 1=alive), indexed row * cols + col.
  let grid = new Uint8Array(0);
  let nextGrid = new Uint8Array(0);
  let cols = 0;
  let rows = 0;

  let running = false;
  let isVisible = false;
  let isTransitioning = false;
  let motionOK = true;
  let motionMediaQuery: MediaQueryList | null = null;
  let stepTimer = 0;
  let rafId = 0;
  let lastStamp = 0;
  let pointerInside = false;
  let pointerCol = -1;
  let pointerRow = -1;

  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;

  function randomize() {
    for (let i = 0; i < grid.length; i++) {
      grid[i] = Math.random() < DENSITY ? 1 : 0;
    }
  }

  // Toroidal (wrapping) neighbour count so cells never die off at the edges.
  function countNeighbors(r: number, c: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = (r + dr + rows) % rows;
        const nc = (c + dc + cols) % cols;
        count += grid[nr * cols + nc];
      }
    }
    return count;
  }

  // One generation, B3/S23. Swap buffers instead of allocating.
  function step() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const alive = grid[idx];
        const n = countNeighbors(r, c);
        nextGrid[idx] = alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
      }
    }
    const tmp = grid;
    grid = nextGrid;
    nextGrid = tmp;
  }

  function draw() {
    const canvas = canvasEl.value;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = cellColor;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r * cols + c]) {
          // cellSize - 1 leaves a hairline gap so cells read as a grid.
          ctx.fillRect(
            c * CELL_SIZE,
            r * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1,
          );
        }
      }
    }
  }

  // Match the canvas to the parent box and (re)allocate the grid. Low-res on
  // purpose: no devicePixelRatio scaling keeps it cheap and slightly soft.
  function sizeCanvas() {
    const canvas = canvasEl.value;
    if (!canvas || !parent || !ctx) return;
    const rect = parent.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    canvas.width = width;
    canvas.height = height;
    cols = Math.max(1, Math.floor(width / CELL_SIZE));
    rows = Math.max(1, Math.floor(height / CELL_SIZE));
    grid = new Uint8Array(rows * cols);
    nextGrid = new Uint8Array(rows * cols);
    randomize();
    draw();
  }

  function tick() {
    if (!running) return;
    step();
    // Keep seeding under the pointer while it hovers, so the hover effect
    // persists and builds rather than dying out after a single stamp.
    if (pointerInside) {
      const now = performance.now();
      if (now - lastStamp >= STAMP_INTERVAL) {
        lastStamp = now;
        stampAtPointer();
      }
    }
    rafId = requestAnimationFrame(draw);
    stepTimer = window.setTimeout(tick, 1000 / FPS);
  }

  function startTicking() {
    if (running) return;
    running = true;
    tick();
  }

  function stopTicking() {
    running = false;
    window.clearTimeout(stepTimer);
    cancelAnimationFrame(rafId);
  }

  // Run only when on-screen, not mid-transition, and motion is allowed.
  function evaluateRun() {
    if (isVisible && !isTransitioning && motionOK) startTicking();
    else stopTicking();
  }

  function handleMotionPreferenceChange(event: MediaQueryListEvent) {
    motionOK = event.matches;
    if (!motionOK) pointerInside = false;
    evaluateRun();
    draw();
  }

  // Stamp a fuzzy circular cluster of live cells centred on the pointer cell.
  // Clipped to a disc, with a radial falloff (dense at the centre, thinning to
  // the edge) so it reads as a soft radial bloom rather than a hard square.
  function stampAtPointer() {
    if (pointerRow < 0 || pointerCol < 0) return;
    for (let dr = -STAMP_RADIUS; dr <= STAMP_RADIUS; dr++) {
      for (let dc = -STAMP_RADIUS; dc <= STAMP_RADIUS; dc++) {
        const dist = Math.sqrt(dr * dr + dc * dc);
        if (dist > STAMP_RADIUS) continue;
        // Probability tapers from STAMP_DENSITY at the centre to ~0 at the edge.
        const chance = STAMP_DENSITY * (1 - dist / STAMP_RADIUS);
        if (Math.random() > chance) continue;
        const nr = (pointerRow + dr + rows) % rows;
        const nc = (pointerCol + dc + cols) % cols;
        grid[nr * cols + nc] = 1;
      }
    }
  }

  // Track the pointer over the card; the actual seeding happens in the step
  // loop (see tick) so it persists while the cursor rests, not only on movement.
  function handlePointerMove(event: MouseEvent) {
    if (!parent || !motionOK) return;
    const rect = parent.getBoundingClientRect();
    pointerInside =
      event.clientX >= rect.left &&
      event.clientX < rect.right &&
      event.clientY >= rect.top &&
      event.clientY < rect.bottom;
    if (!pointerInside) return;
    pointerCol = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    pointerRow = Math.floor((event.clientY - rect.top) / CELL_SIZE);
    pointerInside = true;
  }

  function handlePointerLeave() {
    pointerInside = false;
  }

  onMounted(() => {
    const canvas = canvasEl.value;
    if (!canvas) return;
    parent = canvas.parentElement;
    ctx = canvas.getContext('2d');
    if (!ctx || !parent) return;

    // Read the terminal green from the cascade rather than hardcoding the hex.
    const resolved = getComputedStyle(canvas)
      .getPropertyValue('--color-terminal')
      .trim();
    if (resolved) cellColor = resolved;

    motionMediaQuery = window.matchMedia(
      '(prefers-reduced-motion: no-preference)',
    );
    motionOK = motionMediaQuery.matches;
    motionMediaQuery.addEventListener('change', handleMotionPreferenceChange);

    sizeCanvas();

    // Keep the canvas/grid sized (and, under reduced motion, its static frame
    // fresh) as the card box changes.
    resizeObserver = new ResizeObserver(() => sizeCanvas());
    resizeObserver.observe(parent);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        // Restart fresh on each viewport-enter (also avoids showing a settled,
        // stagnated board).
        if (isVisible && !wasVisible) randomize();
        evaluateRun();
      },
      { rootMargin: '100px' },
    );
    intersectionObserver.observe(canvas);

    pointerTarget = props.viewportInteraction ? window : parent;
    pointerTarget.addEventListener(
      'mousemove',
      handlePointerMove as EventListener,
    );
    pointerTarget.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);
  });

  // Pause while a featured-media route transition is flying so ambient paint
  // never competes with the morph.
  watch(
    () => transitionState.value.active,
    (active) => {
      isTransitioning = active;
      evaluateRun();
    },
  );

  onBeforeUnmount(() => {
    stopTicking();
    motionMediaQuery?.removeEventListener(
      'change',
      handleMotionPreferenceChange,
    );
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    pointerTarget?.removeEventListener(
      'mousemove',
      handlePointerMove as EventListener,
    );
    pointerTarget?.removeEventListener('mouseleave', handlePointerLeave);
    window.removeEventListener('blur', handlePointerLeave);
    document.removeEventListener('mouseleave', handlePointerLeave);
  });
</script>

<template>
  <canvas ref="canvasEl" class="gol-canvas" aria-hidden="true" />
</template>

<style lang="scss" scoped>
  .gol-canvas {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    // Starting point over the dark terminal ground; tune with the cell shade.
    opacity: var(--life-opacity, 0.2);
  }
</style>
