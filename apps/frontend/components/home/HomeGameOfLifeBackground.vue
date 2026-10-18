<script setup lang="ts">
  import {
    disposeLifeCrt,
    drawLifeCrt,
    isLifeCrtWarming,
    lifeCrtPointer,
    stopLifeCrtWarmup,
  } from '~/utils/life-crt';

  import {
    LifeField,
    registerLifeField,
    takeLifeFieldHandoff,
  } from '~/utils/life-field';

  // Conway's Game of Life shares the Side Projects card and interior-page background. Pointer movement seeds a soft bloom; the viewport variant listens through the content above its non-interactive canvas. Coarse cells, 10 FPS, offscreen pausing, and a static reduced-motion frame bound its cost.
  const props = defineProps<{
    viewportInteraction?: boolean;
  }>();

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const transitionState = useFeaturedMediaTransitionState();
  const routeState = useRouteChoreographyState();

  const FPS = 10;
  const FALLBACK_COLOR = '#218d4e';

  const STAMP_INTERVAL = 110;

  let field: LifeField | null = null;
  let parent: HTMLElement | null = null;
  let pointerTarget: HTMLElement | Window | null = null;
  let cellColor = FALLBACK_COLOR;

  let running = false;
  let isVisible = false;
  let motionOK = true;
  let motionMediaQuery: MediaQueryList | null = null;
  let stepTimer = 0;
  let rafId = 0;
  let warmupFrame = 0;
  let lastWarmupPaint = 0;
  let lastStamp = 0;
  let pointerInside = false;
  let pointerCol = -1;
  let pointerRow = -1;

  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;

  function draw() {
    if (!field || !canvasEl.value) return;
    drawLifeCrt(canvasEl.value, field.canvas);
    startWarmupPaint();
  }

  function startWarmupPaint() {
    // Repaint the fading light at 30 FPS without advancing the 10 FPS Life simulation.
    if (
      warmupFrame ||
      !isVisible ||
      !motionOK ||
      document.hidden ||
      !isLifeCrtWarming() ||
      !canvasEl.value ||
      canvasEl.value.dataset.lifeRenderer !== 'webgl'
    )
      return;
    if (getComputedStyle(canvasEl.value).visibility === 'hidden') return;
    const paint = (now: number) => {
      warmupFrame = 0;
      if (
        !isVisible ||
        !motionOK ||
        document.hidden ||
        !isLifeCrtWarming() ||
        !canvasEl.value ||
        !field ||
        canvasEl.value.dataset.lifeRenderer !== 'webgl' ||
        getComputedStyle(canvasEl.value).visibility === 'hidden'
      )
        return;
      if (now - lastWarmupPaint >= 1000 / 30) {
        drawLifeCrt(canvasEl.value, field.canvas);
        lastWarmupPaint = now;
      }
      warmupFrame = requestAnimationFrame(paint);
    };
    warmupFrame = requestAnimationFrame(paint);
  }

  // Keep a viewport-sized field behind the card, with overscan for the curved glass. Expansion reveals more cells at their original size.
  function sizeCanvas() {
    const canvas = canvasEl.value;
    if (!canvas || !parent) return;
    const rect = parent.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const fieldWidth = Math.max(width, innerWidth) * 1.12;
    const fieldHeight = Math.max(height, innerHeight) * 1.12;
    if (
      field &&
      canvas.width === width &&
      canvas.height === height &&
      field.canvas.width >= fieldWidth &&
      field.canvas.height >= fieldHeight
    )
      return;
    canvas.width = width;
    canvas.height = height;
    if (!field) {
      field =
        takeLifeFieldHandoff() ??
        new LifeField(fieldWidth, fieldHeight, cellColor);
      registerLifeField(canvas, field);
    }
    field.ensureSize(fieldWidth, fieldHeight);
    draw();
  }

  function tick() {
    if (!running || !field) return;
    field.step();
    // Keep seeding under the pointer while it hovers, so the effect builds rather than dying out after a single stamp.
    if (pointerInside) {
      const now = performance.now();
      if (now - lastStamp >= STAMP_INTERVAL) {
        lastStamp = now;
        field.stamp(pointerRow, pointerCol);
      }
    }
    field.paint(motionOK);
    rafId = requestAnimationFrame(draw);
    stepTimer = window.setTimeout(tick, 1000 / FPS);
  }

  function startTicking() {
    if (running) return;
    running = true;
    // Show the inherited frame before the next ordinary generation, rather than advancing during the handoff.
    startWarmupPaint();
    stepTimer = window.setTimeout(tick, 1000 / FPS);
  }

  function stopTicking() {
    running = false;
    window.clearTimeout(stepTimer);
    cancelAnimationFrame(rafId);
    cancelAnimationFrame(warmupFrame);
    warmupFrame = 0;
  }

  // Run only when on-screen, not mid-transition, and motion is allowed.
  function evaluateRun() {
    if (
      isVisible &&
      !transitionState.value.active &&
      !routeState.value.active &&
      motionOK &&
      !document.hidden
    )
      startTicking();
    else {
      stopTicking();
      startWarmupPaint();
    }
  }

  function handleMotionPreferenceChange(event: MediaQueryListEvent) {
    motionOK = event.matches;
    if (!motionOK) {
      pointerInside = false;
      stopLifeCrtWarmup();
    }
    evaluateRun();
    field?.paint(motionOK);
    draw();
  }

  // Track the pointer over the card; seeding in the step loop persists while the cursor rests, not only on movement.
  function handlePointerMove(event: MouseEvent) {
    if (!parent || !field || !motionOK) return;
    const rect = parent.getBoundingClientRect();
    pointerInside =
      event.clientX >= rect.left &&
      event.clientX < rect.right &&
      event.clientY >= rect.top &&
      event.clientY < rect.bottom;
    if (!pointerInside) return;
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    const point = lifeCrtPointer(
      x,
      y,
      rect,
      field.canvas,
      canvasEl.value?.dataset.lifeRenderer === 'webgl',
    );
    x = point.x;
    y = point.y;
    pointerCol = Math.min(
      field.cols - 1,
      Math.max(0, Math.floor(x * field.cols)),
    );
    pointerRow = Math.min(
      field.rows - 1,
      Math.max(0, Math.floor(y * field.rows)),
    );
    pointerInside = true;
  }

  function handlePointerLeave() {
    pointerInside = false;
  }

  onMounted(() => {
    const canvas = canvasEl.value;
    if (!canvas) return;
    parent = canvas.parentElement;
    if (!parent) return;

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

    // Resize the presentation without reseeding the shared logical board.
    resizeObserver = new ResizeObserver(() => sizeCanvas());
    resizeObserver.observe(parent);
    window.addEventListener('resize', sizeCanvas);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
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
    document.addEventListener('visibilitychange', evaluateRun);
  });

  // Freeze the same board under both surfaces until the traveling plane is released.
  watch(
    () => transitionState.value.active || routeState.value.active,
    evaluateRun,
    { flush: 'sync' },
  );

  // The shader light keeps settling while the board waits for the text entrance to finish.
  watch(() => routeState.value.hideDestination, draw, { flush: 'post' });

  onBeforeUnmount(() => {
    stopTicking();
    if (canvasEl.value) disposeLifeCrt(canvasEl.value);
    motionMediaQuery?.removeEventListener(
      'change',
      handleMotionPreferenceChange,
    );
    resizeObserver?.disconnect();
    window.removeEventListener('resize', sizeCanvas);
    intersectionObserver?.disconnect();
    pointerTarget?.removeEventListener(
      'mousemove',
      handlePointerMove as EventListener,
    );
    pointerTarget?.removeEventListener('mouseleave', handlePointerLeave);
    window.removeEventListener('blur', handlePointerLeave);
    document.removeEventListener('mouseleave', handlePointerLeave);
    document.removeEventListener('visibilitychange', evaluateRun);
  });
</script>

<template>
  <canvas ref="canvasEl" class="gol-canvas" aria-hidden="true" />
</template>

<style lang="scss" scoped>
  @property --life-opacity {
    syntax: '<number>';
    inherits: true;
    initial-value: 0.2;
  }

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

  .gol-canvas[data-life-renderer='webgl'] {
    opacity: 1;
  }
</style>
