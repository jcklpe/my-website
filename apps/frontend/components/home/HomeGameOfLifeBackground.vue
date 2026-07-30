<script setup lang="ts">
  // Conway's Game of Life rendered as an ambient background texture inside the
  // Side Projects card — phosphor-green cells over the section's dark terminal
  // scanline ground. Deliberately cheap: coarse grid, low FPS (setTimeout step
  // + rAF draw), paused offscreen and while a featured-media route transition
  // is flying, single static frame under reduced motion. Restarts fresh on each
  // viewport-enter (also dodges the Game-of-Life stagnation problem), and
  // moving the pointer over the card seeds new life near the cursor. The canvas
  // is pointer-events:none and sizes to its parent (the card's `.link`). See
  // docs/active-spikes/animation.md → Thread C.

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const transitionState = useFeaturedMediaTransitionState();

  // Taste knobs (see spike doc). CELL_SIZE/opacity/FPS/DENSITY are what to tune.
  const CELL_SIZE = 5;
  const FPS = 10;
  const DENSITY = 0.28;
  const FALLBACK_COLOR = '#218d4e';

  let ctx: CanvasRenderingContext2D | null = null;
  let parent: HTMLElement | null = null;
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
  let stepTimer = 0;
  let rafId = 0;
  let lastStamp = 0;

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
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
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

  // Hover-inject: stamp a loose random cluster near the pointer so moving over
  // the card seeds new life. Throttled; only while the sim is actually running.
  function handlePointerMove(event: MouseEvent) {
    if (!running || !parent) return;
    const now = performance.now();
    if (now - lastStamp < 45) return;
    lastStamp = now;
    const rect = parent.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    const row = Math.floor((event.clientY - rect.top) / CELL_SIZE);
    const radius = 3;
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.random() < 0.5) continue;
        const nr = (row + dr + rows) % rows;
        const nc = (col + dc + cols) % cols;
        grid[nr * cols + nc] = 1;
      }
    }
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

    motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

    sizeCanvas();

    // Keep the canvas/grid sized (and, under reduced motion, its static frame
    // fresh) as the card box changes.
    resizeObserver = new ResizeObserver(() => sizeCanvas());
    resizeObserver.observe(parent);

    // Reduced motion: sizeCanvas already drew one static frame — no loop, no
    // observers, no pointer seeding.
    if (!motionOK) return;

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

    parent.addEventListener('mousemove', handlePointerMove);
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
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    parent?.removeEventListener('mousemove', handlePointerMove);
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
    opacity: 0.2;
  }
</style>
