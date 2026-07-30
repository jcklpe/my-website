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
  const SIM_SCALE = 4; // px per sim cell (smaller = finer / less upscale blur)
  const MAX_COLS = 420; // cap sim width so huge screens stay cheap
  const TICK_FPS = 30;
  const ITERS_PER_TICK = 3; // sim steps per frame (more = faster slither/ooze)
  // Gray-Scott reaction params. FEED/KILL choose the pattern family (coral).
  const DU = 0.16;
  const DV = 0.08;
  const DT = 1.0;
  const FEED = 0.0545;
  const KILL = 0.062;
  // Sparseness / negative space.
  const FERTILE_FRACTION = 0.5; // ~fraction of area where patterns can sustain
  const BARREN_DECAY = 0.03; // v decay in barren regions (carves negative space)
  const GLOBAL_DECAY = 0;
  const SEED_FILL = 0.12; // fraction of fertile cells given seed reactant
  // Warm-up so a formed coral pattern exists before the slow ambient rate.
  const WARMUP_ITERS = 600;
  const WARMUP_PER_FRAME = 24;
  // Cursor "attraction": rather than painting reactant, the pointer locally
  // raises the feed rate, so existing coral GROWS toward the cursor (slime-mold
  // toward food) and recedes when it leaves — emergent, not a paint blob.
  const BOOST_RADIUS = 13; // sim cells
  const FEED_BOOST = 0.02; // feed added toward FEED_MAX near the cursor per frame
  const FEED_MAX = 0.075; // cap on the boosted feed
  const FEED_RELAX = 0.03; // how fast boosted feed relaxes back to FEED
  // Pale periwinkle, rendered through a crisp threshold so edges read as smooth
  // vector-like curves (anti-aliased by the upscale) rather than a gradient blur.
  const COLOR: readonly [number, number, number] = [104, 118, 210];
  const V_THRESHOLD = 0.18; // v level that reads as "on"
  const V_SOFT = 0.035; // narrow soft band around the threshold = crisp edge
  const MAX_ALPHA = 135;

  let ctx: CanvasRenderingContext2D | null = null;
  let offscreen: HTMLCanvasElement | null = null;
  let offCtx: CanvasRenderingContext2D | null = null;
  let imageData: ImageData | null = null;

  let u = new Float32Array(0);
  let v = new Float32Array(0);
  let u2 = new Float32Array(0);
  let v2 = new Float32Array(0);
  let decayField = new Float32Array(0);
  let feedField = new Float32Array(0);
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
  let pointerInside = false;
  let pointerCol = -1;
  let pointerRow = -1;
  let warmupRemaining = 0;

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
    // Scatter seed reactant across the fertile field so coral nucleates there
    // and the barren regions stay open as negative space.
    const fertileMax = GLOBAL_DECAY + BARREN_DECAY * 0.2;
    for (let i = 0; i < v.length; i++) {
      if (decayField[i] <= fertileMax && Math.random() < SEED_FILL) {
        v[i] = 0.6;
        u[i] = 0.2;
      }
    }
  }

  // Relax the boosted feed field back toward the base feed each frame, so the
  // cursor's influence fades and the growth it drew recedes (semi-temporary).
  function relaxFeed() {
    for (let i = 0; i < feedField.length; i++) {
      feedField[i] += (FEED - feedField[i]) * FEED_RELAX;
    }
  }

  // Raise the feed rate in a soft disc under the pointer — existing coral grows
  // faster there, so the pattern reaches toward the cursor rather than being
  // painted on.
  function boostFeedAtPointer() {
    for (let dr = -BOOST_RADIUS; dr <= BOOST_RADIUS; dr++) {
      for (let dc = -BOOST_RADIUS; dc <= BOOST_RADIUS; dc++) {
        const dist = Math.sqrt(dr * dr + dc * dc);
        if (dist > BOOST_RADIUS) continue;
        const falloff = 1 - dist / BOOST_RADIUS;
        const nr = (pointerRow + dr + rows) % rows;
        const nc = (pointerCol + dc + cols) % cols;
        const i = nr * cols + nc;
        const boosted = feedField[i] + FEED_BOOST * falloff;
        feedField[i] = boosted > FEED_MAX ? FEED_MAX : boosted;
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
        const f = feedField[i];
        let nu = uu + (DU * lu - uvv + f * (1 - uu)) * DT;
        let nv = vv + (DV * lv + uvv - (f + KILL) * vv) * DT;
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
    const t0 = V_THRESHOLD - V_SOFT;
    const inv = 1 / (2 * V_SOFT);
    for (let i = 0, p = 0; i < v.length; i++, p += 4) {
      let x = (v[i] - t0) * inv;
      x = x < 0 ? 0 : x > 1 ? 1 : x;
      const s = x * x * (3 - 2 * x); // smoothstep → crisp but anti-aliased edge
      data[p] = COLOR[0];
      data[p + 1] = COLOR[1];
      data[p + 2] = COLOR[2];
      data[p + 3] = s * MAX_ALPHA;
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
    feedField = new Float32Array(rows * cols);
    feedField.fill(FEED);
    offscreen = document.createElement('canvas');
    offscreen.width = cols;
    offscreen.height = rows;
    offCtx = offscreen.getContext('2d');
    imageData = offCtx ? offCtx.createImageData(cols, rows) : null;
    ctx = canvas.getContext('2d');
    if (ctx) ctx.imageSmoothingEnabled = true;
    buildDecayField();
    seed();
    warmupRemaining = WARMUP_ITERS;
    if (!motionOK) {
      // Reduced motion: develop the full pattern synchronously, then leave it.
      for (let n = 0; n < WARMUP_ITERS; n++) stepOnce();
      warmupRemaining = 0;
    }
    draw();
  }

  function tick() {
    if (!running) return;
    relaxFeed();
    if (pointerInside && pointerRow >= 0 && pointerCol >= 0) {
      boostFeedAtPointer();
    }
    if (warmupRemaining > 0) {
      // Develop the pattern fast at first, then drop to the slow ambient rate.
      const burst = Math.min(WARMUP_PER_FRAME, warmupRemaining);
      for (let n = 0; n < burst; n++) stepOnce();
      warmupRemaining -= burst;
    } else {
      for (let n = 0; n < ITERS_PER_TICK; n++) stepOnce();
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
