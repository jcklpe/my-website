# Conway's Game of Life Spike
## Goal
A Conway's Game of Life simulation as a background visual on the Side Projects card on the homepage. Cells evolve on a canvas element behind the card content, creating a low-key generative animation that fits the "technical playfulness" tone of that section.

---

## Visual direction
- Cell color: `var(--color-signal)` (cobalt blue) at low opacity so the cells read as texture, not primary content.
- Background: transparent so the card's cream surface shows through.
- Cell size: 4–6px. Small enough to read as texture/grain, large enough to be perceptible.
- Frame rate: 8–12 FPS (slow enough to feel contemplative rather than frantic).
- Grid: fill the card bounding box. Respects CSS `border-radius` via canvas clip path.
- Initial state: random density (~25–30% alive cells).
- Wrapping: toroidal (edges wrap). Prevents cells dying off at corners.

---

## Technical approach
### 1. Component: `<GameOfLifeBackground>`
A standalone Vue component that wraps a `<canvas>` element. Goes inside the Side Projects card as a background layer (absolutely positioned, `z-index: 0`, `pointer-events: none`).

```vue
<template>
  <canvas ref="canvas" class="gol-canvas" aria-hidden="true" />
</template>
```

```ts
const canvas = ref<HTMLCanvasElement>();
let animFrameId: number;
let stepTimerId: number;

onMounted(() => {
  initGrid();
  startLoop();
});

onUnmounted(() => {
  stopLoop();
});
```

### 2. Grid data structure
A flat `Uint8Array` (0=dead, 1=alive) indexed as `row * cols + col`. `Uint8Array` is cache-friendly and avoids garbage collection pressure during simulation steps.

```ts
let grid: Uint8Array;
let next: Uint8Array; // double-buffer to avoid read/write conflicts

function step() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbors = countNeighbors(r, c);
      const alive = grid[r * cols + c];
      next[r * cols + c] =
        alive ? (neighbors === 2 || neighbors === 3 ? 1 : 0)
               : (neighbors === 3 ? 1 : 0);
    }
  }
  [grid, next] = [next, grid];
}
```

Toroidal neighbor counting uses modulo wrapping:
```ts
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
```

### 3. Rendering
Draw only to the canvas 2D context. Fill alive cells with a semi-transparent accent color:

```ts
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'var(--color-signal)'; // or a fixed rgba if var() doesn't resolve
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r * cols + c]) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }
}
```

For low frame rate, use `setTimeout` for step timing and `requestAnimationFrame` only for the draw call:

```ts
function startLoop() {
  const FPS = 10;
  function tick() {
    step();
    requestAnimationFrame(draw);
    stepTimerId = window.setTimeout(tick, 1000 / FPS);
  }
  tick();
}
```

### 4. Intersection Observer — pause off-screen
The card is below the fold. Simulate only when the card is in (or near) the viewport:

```ts
const observer = new IntersectionObserver(
  ([entry]) => { entry.isIntersecting ? startLoop() : stopLoop(); },
  { rootMargin: '100px' }
);
observer.observe(canvas.value!);
```

### 5. Canvas sizing and resize
Size the canvas to match the card element. Use `ResizeObserver` to re-initialize when the card dimensions change (viewport resize, font-size changes):

```ts
const resizeObserver = new ResizeObserver(() => {
  const { width, height } = canvas.value!.getBoundingClientRect();
  canvas.value!.width = width;
  canvas.value!.height = height;
  cols = Math.floor(width / cellSize);
  rows = Math.floor(height / cellSize);
  grid = new Uint8Array(rows * cols);
  next = new Uint8Array(rows * cols);
  randomize();
});
resizeObserver.observe(canvas.value!.parentElement!);
```

### 6. Reduced motion
Respect `prefers-reduced-motion`:

```ts
const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (!motionOK) return; // skip init entirely
```

The canvas element can still render a single static frame of the initial state (so the card doesn't look blank), just without animation.

---

## Styling
```scss
.gol-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.18; // tune to taste — just perceptible against cream
}
```

Place behind card content with `z-index: 0` on the canvas and `position: relative; z-index: 1` on the card's content layer.

---

## Where to place this
The Side Projects section on the homepage is a single card within `apps/frontend/pages/index.vue` (or possibly `apps/frontend/components/home/`). The `<GameOfLifeBackground>` component would go inside that card:

```vue
<div class="side-projects-card">
  <GameOfLifeBackground />
  <div class="card-content"> ... </div>
</div>
```

Component file: `apps/frontend/components/home/GameOfLifeBackground.vue`

---

## Open questions
- Should the simulation restart on each viewport-enter, or resume from where it left off?
- Should the cell color shift at all with theme changes (light/dark mode doesn't exist currently, but worth considering)?
- What's the right opacity — barely visible (10–15%) or more present (25–30%)?
- Should the canvas react to hover? (e.g. inject a glider or a dense cluster near the cursor — fun but probably too interactive)
- Does this need to also work on the static-generated output? Canvas works in static HTML — no SSR concerns.
