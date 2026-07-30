<script setup lang="ts">
  // Page-wide Gray-Scott reaction-diffusion "skin" over the paper-grid ground.
  // Faint pale-periwinkle, slow buttery oozing, sparse — a static fertility
  // mask carves wide negative space so it never fills the whole background.
  // Reactive to hover: the pattern blooms under the cursor, then fades
  // (semi-temporary, via a gentle global decay + the barren mask). Low-res sim
  // upscaled soft; paused offscreen and during featured-media transitions;
  // single developed static frame under reduced motion. Fixed, behind content,
  // pointer-events:none. See docs/active-spikes/animation.md → Thread B.

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const transitionState = useFeaturedMediaTransitionState();

  // --- Taste knobs -----------------------------------------------------------
  const SIM_SCALE = 5; // px per sim cell (bigger = coarser/cheaper/larger scale)
  const MAX_COLS = 360; // cap sim width so huge screens stay cheap
  const TICK_FPS = 30;
  const ITERS_PER_TICK = 1; // sim steps per frame (more = faster evolution)
  // Gray-Scott reaction params. FEED/KILL choose the pattern family (coral).
  const DU = 0.16;
  const DV = 0.08;
  const DT = 1.0;
  const FEED = 0.0545;
  const KILL = 0.062;
  // Sparseness / negative space / temporariness.
  const FERTILE_FRACTION = 0.34; // ~fraction of area where patterns can sustain
  const BARREN_DECAY = 0.022; // v decay in barren regions (carves negative space)
  const GLOBAL_DECAY = 0.001; // gentle decay everywhere so growth is temporary
  const SEED_COUNT = 5; // initial sparse seeds
  // Hover bloom.
  const STAMP_RADIUS = 10; // sim cells
  const STAMP_INTERVAL = 90; // ms between hover seeds while the pointer moves over the page
  // Pale periwinkle + faint alpha.
  const COLOR: readonly [number, number, number] = [150, 162, 236];
  const ALPHA_SCALE = 210;
  const MAX_ALPHA = 82;

  let ctx: CanvasRenderingContext2D | null = null;
  let offscreen: HTMLCanvasElement | null = null;
  let offCtx: CanvasRenderingContext2D | null = null;
  let imageData: ImageData | null = null;

  let u = new Float32Array(0);
  let v = new Float32Array(0);
  let u2 = new Float32Array(0);
  let v2 = new Float32Array(0);
  let decayField = new Float32Array(0);
  let cols = 0;
  let rows = 0;
  let canvasW = 0;
  let canvasH = 0;

  let running = false;
  let isVisible = true; // fixed full-viewport, so effectively always on-screen
  let isTransitioning = false;
  let motionOK = true;
  let stepTimer = 0;
  let rafId = 0;
  let lastStamp = 0;
  let pointerInside = false;
  let pointerCol = -1;
  let pointerRow = -1;

  let resizeHandler: (() => void) | null = null;

  // Static fertility mask from smooth value noise: high = fertile (patterns
  // sustain), low = barren (patterns decay away → negative space). Precomputed
  // into a per-cell decay field so the hot loop is a single read.
  function buildDecayField() {
    const coarseCols = 8;
    const coarseRows = Math.max(2, Math.round((coarseCols * rows) / cols));
    const coarse = new Float32Array(coarseCols * coarseRows);
    for (let i = 0; i < coarse.length; i++) coarse[i] = Math.random();
    decayField = new Float32Array(rows * cols);
    const threshold = 1 - FERTILE_FRACTION; // top FERTILE_FRACTION is fertile
    const edge = 0.12; // soft, organic boundary
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = (c / cols) * (coarseCols - 1);
        const gy = (r / rows) * (coarseRows - 1);
        const x0 = Math.floor(gx);
        const y0 = Math.floor(gy);
        const x1 = Math.min(x0 + 1, coarseCols - 1);
        const y1 = Math.min(y0 + 1, coarseRows - 1);
        const fx = gx - x0;
        const fy = gy - y0;
        const top =
          coarse[y0 * coarseCols + x0] +
          (coarse[y0 * coarseCols + x1] - coarse[y0 * coarseCols + x0]) * fx;
        const bot =
          coarse[y1 * coarseCols + x0] +
          (coarse[y1 * coarseCols + x1] - coarse[y1 * coarseCols + x0]) * fx;
        const field = top + (bot - top) * fy;
        // 0 in fertile, ramps to 1 as the field drops below the threshold.
        const barren = Math.min(1, Math.max(0, (threshold - field) / edge));
        decayField[r * cols + c] = GLOBAL_DECAY + BARREN_DECAY * barren;
      }
    }
  }

  function seed() {
    u.fill(1);
    v.fill(0);
    for (let s = 0; s < SEED_COUNT; s++) {
      // Prefer fertile cells so the ambient pattern lives in the fertile field.
      let r = 0;
      let c = 0;
      for (let tries = 0; tries < 24; tries++) {
        r = Math.floor(Math.random() * rows);
        c = Math.floor(Math.random() * cols);
        if (decayField[r * cols + c] <= GLOBAL_DECAY + 0.0001) break;
      }
      stampAt(r, c, 4, 0.9);
    }
  }

  // Inject reactant (v up, u down) in a soft disc — seeds the reaction.
  function stampAt(cr: number, cc: number, radius: number, strength: number) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const dist = Math.sqrt(dr * dr + dc * dc);
        if (dist > radius) continue;
        const falloff = (1 - dist / radius) * strength;
        const nr = (cr + dr + rows) % rows;
        const nc = (cc + dc + cols) % cols;
        const i = nr * cols + nc;
        v[i] = Math.min(1, v[i] + 0.6 * falloff);
        u[i] = Math.max(0, u[i] - 0.35 * falloff);
      }
    }
  }

  function stepOnce() {
    for (let r = 0; r < rows; r++) {
      const rm = ((r - 1 + rows) % rows) * cols;
      const rp = ((r + 1) % rows) * cols;
      const rc = r * cols;
      for (let c = 0; c < cols; c++) {
        const cm = (c - 1 + cols) % cols;
        const cp = (c + 1) % cols;
        const i = rc + c;
        const uu = u[i];
        const vv = v[i];
        const lu =
          -uu +
          0.2 * (u[rm + c] + u[rp + c] + u[rc + cm] + u[rc + cp]) +
          0.05 * (u[rm + cm] + u[rm + cp] + u[rp + cm] + u[rp + cp]);
        const lv =
          -vv +
          0.2 * (v[rm + c] + v[rp + c] + v[rc + cm] + v[rc + cp]) +
          0.05 * (v[rm + cm] + v[rm + cp] + v[rp + cm] + v[rp + cp]);
        const uvv = uu * vv * vv;
        let nu = uu + (DU * lu - uvv + FEED * (1 - uu)) * DT;
        let nv = vv + (DV * lv + uvv - (FEED + KILL) * vv) * DT;
        nv -= nv * decayField[i];
        nu = nu < 0 ? 0 : nu > 1 ? 1 : nu;
        nv = nv < 0 ? 0 : nv > 1 ? 1 : nv;
        u2[i] = nu;
        v2[i] = nv;
      }
    }
    let t = u;
    u = u2;
    u2 = t;
    t = v;
    v = v2;
    v2 = t;
  }

  function draw() {
    if (!ctx || !offCtx || !offscreen || !imageData) return;
    const data = imageData.data;
    for (let i = 0, p = 0; i < v.length; i++, p += 4) {
      let a = v[i] * ALPHA_SCALE;
      if (a > MAX_ALPHA) a = MAX_ALPHA;
      data[p] = COLOR[0];
      data[p + 1] = COLOR[1];
      data[p + 2] = COLOR[2];
      data[p + 3] = a;
    }
    offCtx.putImageData(imageData, 0, 0);
    ctx.clearRect(0, 0, canvasW, canvasH);
    // Upscale the low-res sim smoothly for the buttery ooze.
    ctx.drawImage(offscreen, 0, 0, cols, rows, 0, 0, canvasW, canvasH);
  }

  function sizeCanvas() {
    const canvas = canvasEl.value;
    if (!canvas) return;
    canvasW = Math.max(1, Math.floor(window.innerWidth));
    canvasH = Math.max(1, Math.floor(window.innerHeight));
    canvas.width = canvasW;
    canvas.height = canvasH;
    cols = Math.min(MAX_COLS, Math.max(1, Math.floor(canvasW / SIM_SCALE)));
    rows = Math.max(1, Math.floor((cols * canvasH) / canvasW));
    u = new Float32Array(rows * cols);
    v = new Float32Array(rows * cols);
    u2 = new Float32Array(rows * cols);
    v2 = new Float32Array(rows * cols);
    offscreen = document.createElement('canvas');
    offscreen.width = cols;
    offscreen.height = rows;
    offCtx = offscreen.getContext('2d');
    imageData = offCtx ? offCtx.createImageData(cols, rows) : null;
    ctx = canvas.getContext('2d');
    if (ctx) ctx.imageSmoothingEnabled = true;
    buildDecayField();
    seed();
    if (!motionOK) {
      // Reduced motion: develop a static frame, then leave it be.
      for (let n = 0; n < 90; n++) stepOnce();
    }
    draw();
  }

  function tick() {
    if (!running) return;
    for (let n = 0; n < ITERS_PER_TICK; n++) stepOnce();
    if (pointerInside) {
      const now = performance.now();
      if (now - lastStamp >= STAMP_INTERVAL) {
        lastStamp = now;
        if (pointerRow >= 0 && pointerCol >= 0) {
          stampAt(pointerRow, pointerCol, STAMP_RADIUS, 1);
        }
      }
    }
    rafId = requestAnimationFrame(draw);
    stepTimer = window.setTimeout(tick, 1000 / TICK_FPS);
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

  function evaluateRun() {
    if (isVisible && !isTransitioning && motionOK) startTicking();
    else stopTicking();
  }

  function handlePointerMove(event: MouseEvent) {
    pointerCol = Math.floor((event.clientX / canvasW) * cols);
    pointerRow = Math.floor((event.clientY / canvasH) * rows);
    pointerInside = true;
  }

  function handleDocumentLeave() {
    pointerInside = false;
  }

  function handleVisibility() {
    isVisible = document.visibilityState === 'visible';
    evaluateRun();
  }

  onMounted(() => {
    const canvas = canvasEl.value;
    if (!canvas) return;
    motionOK = window.matchMedia(
      '(prefers-reduced-motion: no-preference)',
    ).matches;

    sizeCanvas();

    resizeHandler = () => sizeCanvas();
    window.addEventListener('resize', resizeHandler, { passive: true });

    if (!motionOK) return;

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleDocumentLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    evaluateRun();
  });

  // Pause while a featured-media route transition is flying.
  watch(
    () => transitionState.value.active,
    (active) => {
      isTransitioning = active;
      evaluateRun();
    },
  );

  onBeforeUnmount(() => {
    stopTicking();
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('mousemove', handlePointerMove);
    document.removeEventListener('mouseleave', handleDocumentLeave);
    document.removeEventListener('visibilitychange', handleVisibility);
  });
</script>

<template>
  <canvas ref="canvasEl" class="rd-canvas" aria-hidden="true" />
</template>

<style lang="scss" scoped>
  // Fixed full-viewport, behind content, over the paper-grid ground. z-index -1
  // sits above the page background but below in-flow content (the .home-page
  // stacking context contains it via isolation: isolate).
  .rd-canvas {
    position: fixed;
    inset: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }
</style>
