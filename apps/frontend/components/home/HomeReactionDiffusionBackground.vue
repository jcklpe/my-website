<script setup lang="ts">
  // Page-wide Gray-Scott reaction-diffusion "skin" over the paper-grid ground.
  //
  // Rendering: the sim runs on a COARSE grid (big Turing features, cheap enough
  // to iterate hard for fast blooming). Its smooth v field is upscaled with
  // bilinear smoothing, then an SVG feComponentTransfer steepens the alpha into
  // a crisp step — so the coral reads as smooth vector-like curves at pixel
  // resolution instead of an upscaled blur.
  //
  // Motion: a slowly DRIFTING fertility field (a persistent value-noise sampled
  // through a moving offset) makes fertile regions migrate, so areas of growth
  // drift across the screen and die against the barren "inhibitor" rather than
  // settling static. Ambient nucleation keeps seeding new growth as fertile
  // land moves under it.
  //
  // Cursor: lowers the local kill rate only (a growth-favourable zone), so
  // existing coral REACHES toward the pointer and recedes when it leaves — no
  // reactant is injected, so it never reads as painting.
  //
  // Paused when hidden and during featured-media transitions; a single
  // developed static frame under reduced motion. Fixed, behind content,
  // pointer-events:none. See docs/active-spikes/animation.md → Thread B.

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const transitionState = useFeaturedMediaTransitionState();

  // --- Taste knobs -----------------------------------------------------------
  const SIM_SCALE = 10; // px per sim cell (bigger = coarser / larger features)
  const MAX_COLS = 260; // cap sim width so huge screens stay cheap
  const TICK_FPS = 30;
  const ITERS_PER_TICK = 12; // sim steps per frame — fast blooming/undulation
  // Gray-Scott reaction params (coral family).
  const DU = 0.16;
  const DV = 0.08;
  const DT = 1.0;
  const FEED = 0.0545;
  const KILL = 0.062;
  // Negative space + drift.
  const FERTILE_FRACTION = 0.52; // ~fraction of area where patterns can sustain
  const BARREN_DECAY = 0.028; // v decay in barren regions (carves negative space)
  const GLOBAL_DECAY = 0.0006; // slow death everywhere; balanced by nucleation
  const NOISE_COLS = 14; // persistent coarse fertility noise
  const NOISE_ROWS = 10;
  const DRIFT_X = 0.006; // fertility-field drift per tick (noise cells)
  const DRIFT_Y = 0.0032;
  const SEED_FILL = 0.1; // fraction of fertile cells seeded at start
  const AMBIENT_SEED = 4; // faint new buds per frame in fertile → ongoing waves
  // Warm-up so a formed pattern exists immediately (coarse grid = cheap).
  const WARMUP_ITERS = 500;
  const WARMUP_PER_FRAME = 40;
  // Cursor attraction: lower the local kill so coral reaches toward the pointer;
  // relaxes back when it leaves. No nucleation — growth, not paint.
  const BOOST_RADIUS = 9; // sim cells
  const KILL_DROP = 0.013; // how much kill is lowered under the cursor
  const KILL_MIN = 0.044; // floor on the lowered kill
  const KILL_RELAX = 0.04; // how fast the lowered kill relaxes back to KILL
  // Colour. Crispness/threshold live in the SVG filter; opacity is the ceiling.
  const COLOR: readonly [number, number, number] = [205, 222, 255]; // #cddeff

  let ctx: CanvasRenderingContext2D | null = null;
  let offscreen: HTMLCanvasElement | null = null;
  let offCtx: CanvasRenderingContext2D | null = null;
  let imageData: ImageData | null = null;

  let u = new Float32Array(0);
  let v = new Float32Array(0);
  let u2 = new Float32Array(0);
  let v2 = new Float32Array(0);
  let decayField = new Float32Array(0); // per-cell v decay (drifting mask)
  let killField = new Float32Array(0); // per-cell kill rate (cursor lowers it)
  let noise = new Float32Array(0); // persistent coarse fertility noise
  let cols = 0;
  let rows = 0;
  let canvasW = 0;
  let canvasH = 0;
  let driftX = 0;
  let driftY = 0;

  let running = false;
  let isVisible = true;
  let isTransitioning = false;
  let motionOK = true;
  let stepTimer = 0;
  let rafId = 0;
  let pointerInside = false;
  let pointerCol = -1;
  let pointerRow = -1;
  let warmupRemaining = 0;

  let resizeHandler: (() => void) | null = null;

  function buildNoise() {
    noise = new Float32Array(NOISE_COLS * NOISE_ROWS);
    for (let i = 0; i < noise.length; i++) noise[i] = Math.random();
  }

  function sampleNoise(nx: number, ny: number) {
    // Bilinear sample of the wrapping coarse noise at fractional cell coords.
    const x = ((nx % NOISE_COLS) + NOISE_COLS) % NOISE_COLS;
    const y = ((ny % NOISE_ROWS) + NOISE_ROWS) % NOISE_ROWS;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = (x0 + 1) % NOISE_COLS;
    const y1 = (y0 + 1) % NOISE_ROWS;
    const fx = x - x0;
    const fy = y - y0;
    const top =
      noise[y0 * NOISE_COLS + x0] +
      (noise[y0 * NOISE_COLS + x1] - noise[y0 * NOISE_COLS + x0]) * fx;
    const bot =
      noise[y1 * NOISE_COLS + x0] +
      (noise[y1 * NOISE_COLS + x1] - noise[y1 * NOISE_COLS + x0]) * fx;
    return top + (bot - top) * fy;
  }

  // Sample the persistent noise through the current drift offset → per-cell
  // decay. Fertile = low decay; barren = high decay (negative space). Rebuilt
  // each tick so fertile land migrates across the screen.
  function buildDecayField() {
    const threshold = 1 - FERTILE_FRACTION;
    const edge = 0.14;
    const sx = NOISE_COLS / cols;
    const sy = NOISE_ROWS / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const field = sampleNoise(c * sx + driftX, r * sy + driftY);
        const barren = Math.min(1, Math.max(0, (threshold - field) / edge));
        decayField[r * cols + c] = GLOBAL_DECAY + BARREN_DECAY * barren;
      }
    }
  }

  const fertileMax = () => GLOBAL_DECAY + BARREN_DECAY * 0.15;

  function seed() {
    u.fill(1);
    v.fill(0);
    const limit = fertileMax();
    for (let i = 0; i < v.length; i++) {
      if (decayField[i] <= limit && Math.random() < SEED_FILL) {
        v[i] = 0.6;
        u[i] = 0.2;
      }
    }
  }

  // A few faint new buds in fertile cells each frame — as the fertility field
  // drifts, this keeps generating growth in freshly-fertile land.
  function ambientNucleate() {
    const limit = fertileMax();
    for (let n = 0; n < AMBIENT_SEED; n++) {
      const i = Math.floor(Math.random() * v.length);
      if (decayField[i] <= limit) {
        v[i] = Math.min(1, v[i] + 0.5);
        u[i] = Math.max(0, u[i] - 0.2);
      }
    }
  }

  function relaxKill() {
    for (let i = 0; i < killField.length; i++) {
      killField[i] += (KILL - killField[i]) * KILL_RELAX;
    }
  }

  // Lower the kill rate under the pointer so nearby coral spreads toward it.
  function boostGrowthAtPointer() {
    for (let dr = -BOOST_RADIUS; dr <= BOOST_RADIUS; dr++) {
      for (let dc = -BOOST_RADIUS; dc <= BOOST_RADIUS; dc++) {
        const dist = Math.sqrt(dr * dr + dc * dc);
        if (dist > BOOST_RADIUS) continue;
        const falloff = 1 - dist / BOOST_RADIUS;
        const nr = (pointerRow + dr + rows) % rows;
        const nc = (pointerCol + dc + cols) % cols;
        const i = nr * cols + nc;
        const lowered = killField[i] - KILL_DROP * falloff;
        killField[i] = lowered < KILL_MIN ? KILL_MIN : lowered;
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
        const k = killField[i];
        let nu = uu + (DU * lu - uvv + FEED * (1 - uu)) * DT;
        let nv = vv + (DV * lv + uvv - (FEED + k) * vv) * DT;
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

  // Write the smooth v field as periwinkle + soft alpha ramp; upscale with
  // smoothing. The SVG filter turns that soft ramp into a crisp edge.
  function draw() {
    if (!ctx || !offCtx || !offscreen || !imageData) return;
    const data = imageData.data;
    for (let i = 0, p = 0; i < v.length; i++, p += 4) {
      data[p] = COLOR[0];
      data[p + 1] = COLOR[1];
      data[p + 2] = COLOR[2];
      const a = v[i] * 255;
      data[p + 3] = a > 255 ? 255 : a;
    }
    offCtx.putImageData(imageData, 0, 0);
    ctx.clearRect(0, 0, canvasW, canvasH);
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
    decayField = new Float32Array(rows * cols);
    killField = new Float32Array(rows * cols);
    killField.fill(KILL);
    offscreen = document.createElement('canvas');
    offscreen.width = cols;
    offscreen.height = rows;
    offCtx = offscreen.getContext('2d');
    imageData = offCtx ? offCtx.createImageData(cols, rows) : null;
    ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    buildNoise();
    buildDecayField();
    seed();
    warmupRemaining = WARMUP_ITERS;
    if (!motionOK) {
      for (let n = 0; n < WARMUP_ITERS; n++) stepOnce();
      warmupRemaining = 0;
    }
    draw();
  }

  function tick() {
    if (!running) return;
    relaxKill();
    if (pointerInside && pointerRow >= 0 && pointerCol >= 0) {
      boostGrowthAtPointer();
    }
    if (warmupRemaining > 0) {
      const burst = Math.min(WARMUP_PER_FRAME, warmupRemaining);
      for (let n = 0; n < burst; n++) stepOnce();
      warmupRemaining -= burst;
    } else {
      driftX += DRIFT_X;
      driftY += DRIFT_Y;
      buildDecayField();
      ambientNucleate();
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
  <!-- Threshold filter: steepens the upscaled alpha ramp into a crisp,
       pixel-resolution edge so the coarse field reads as smooth vector curves. -->
  <svg class="rd-defs" aria-hidden="true" focusable="false">
    <filter
      id="rd-threshold"
      color-interpolation-filters="sRGB"
      x="0"
      y="0"
      width="100%"
      height="100%"
    >
      <feComponentTransfer>
        <feFuncA type="linear" slope="26" intercept="-4.4" />
      </feComponentTransfer>
    </filter>
  </svg>
</template>

<style lang="scss" scoped>
  .rd-canvas {
    position: fixed;
    inset: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    filter: url('#rd-threshold');
    opacity: 0.62;
  }

  .rd-defs {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
  }
</style>
