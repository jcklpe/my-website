<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  const props = defineProps<{
    firstCaseStudy: WordPressCaseStudy | null;
  }>();

  const emit = defineEmits<{
    done: [];
  }>();

  const screenEl = ref<HTMLElement | null>(null);
  const progressEl = ref<HTMLElement | null>(null);
  const imageContainerEl = ref<HTMLElement | null>(null);
  const nameTopEl = ref<HTMLElement | null>(null);
  const nameBottomEl = ref<HTMLElement | null>(null);
  const enterButtonEl = ref<HTMLButtonElement | null>(null);

  const progress = ref(0);
  const phase = ref<'loading' | 'intro' | 'entering'>('loading');

  const progressDisplay = computed(() => `${Math.floor(progress.value)}%`);
  const featuredSrc = computed(
    () => props.firstCaseStudy?.featuredMedia?.sourceUrl ?? null,
  );
  const firstTitle = computed(() => props.firstCaseStudy?.title ?? '');

  const IMAGE_TRAIL_COUNT = 8;
  const TEXT_TRAIL_COUNT = 3;

  onMounted(async () => {
    // Respect reduced-motion preference — skip straight to done.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      emit('done');
      return;
    }

    const { gsap } = await import('gsap');

    // Phase 1: fake progress counter.
    await new Promise<void>((resolve) => {
      gsap.to(progress, {
        value: 100,
        duration: 2.5,
        ease: 'power1.inOut',
        onComplete: resolve,
      });
    });

    // Fade the progress counter out.
    await new Promise<void>((resolve) => {
      gsap.to(progressEl.value, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: resolve,
      });
    });

    // Switch to intro phase so name elements enter the DOM.
    phase.value = 'intro';
    await nextTick();

    const imgTrails = Array.from(
      imageContainerEl.value?.querySelectorAll<HTMLElement>('.trail-img') ?? [],
    );
    const nameTopTrails = Array.from(
      nameTopEl.value?.querySelectorAll<HTMLElement>('.trail-text') ?? [],
    );
    const nameBottomTrails = Array.from(
      nameBottomEl.value?.querySelectorAll<HTMLElement>('.trail-text') ?? [],
    );

    // Phase 2: trail reveals.
    // Use explicit per-element fromTo with manual stagger delay to avoid
    // TypeScript friction with GSAP function-based opacity values.
    await new Promise<void>((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });

      // Image trail — reverse stagger (last/lead animates first).
      imgTrails.forEach((img, i) => {
        const staggerDelay = (IMAGE_TRAIL_COUNT - 1 - i) * 0.055;
        const opacity =
          i === IMAGE_TRAIL_COUNT - 1 ? 1 : (i / IMAGE_TRAIL_COUNT) * 0.6;
        tl.fromTo(
          img,
          { x: '14%', opacity: 0 },
          { x: 0, opacity, duration: 1.1, ease: 'power3.out' },
          staggerDelay,
        );
      });

      // Name top — trails down from above.
      nameTopTrails.forEach((el, i) => {
        const staggerDelay = 0.2 + (TEXT_TRAIL_COUNT - 1 - i) * 0.085;
        const opacity =
          i === TEXT_TRAIL_COUNT - 1 ? 1 : (i / TEXT_TRAIL_COUNT) * 0.35;
        tl.fromTo(
          el,
          { y: '-35%', opacity: 0, rotateX: 35 },
          { y: 0, rotateX: 0, opacity, duration: 0.95, ease: 'power3.out' },
          staggerDelay,
        );
      });

      // Name bottom — trails up from below.
      nameBottomTrails.forEach((el, i) => {
        const staggerDelay = 0.3 + (TEXT_TRAIL_COUNT - 1 - i) * 0.085;
        const opacity =
          i === TEXT_TRAIL_COUNT - 1 ? 1 : (i / TEXT_TRAIL_COUNT) * 0.35;
        tl.fromTo(
          el,
          { y: '35%', opacity: 0 },
          { y: 0, opacity, duration: 0.95, ease: 'power3.out' },
          staggerDelay,
        );
      });

      // Enter button.
      tl.fromTo(
        enterButtonEl.value,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        1.1,
      );
    });
  });

  async function handleEnter() {
    if (phase.value !== 'intro') return;
    phase.value = 'entering';

    const { gsap } = await import('gsap');

    const imgTrails = Array.from(
      imageContainerEl.value?.querySelectorAll<HTMLElement>('.trail-img') ?? [],
    );
    const nameTopTrails = Array.from(
      nameTopEl.value?.querySelectorAll<HTMLElement>('.trail-text') ?? [],
    );
    const nameBottomTrails = Array.from(
      nameBottomEl.value?.querySelectorAll<HTMLElement>('.trail-text') ?? [],
    );

    // Target: the first case study card's media frame underneath the overlay.
    const targetEl = document.querySelector<HTMLElement>(
      '.case-study-card .media-frame',
    );

    const tl = gsap.timeline({ onComplete: () => emit('done') });

    // Exit name rows.
    nameTopTrails.forEach((el, i) => {
      tl.to(
        el,
        { y: '-20%', opacity: 0, duration: 0.5, ease: 'power2.in' },
        i * 0.03,
      );
    });
    nameBottomTrails.forEach((el, i) => {
      tl.to(
        el,
        { y: '20%', opacity: 0, duration: 0.5, ease: 'power2.in' },
        0.05 + i * 0.03,
      );
    });

    tl.to(
      enterButtonEl.value,
      { opacity: 0, duration: 0.3, ease: 'power2.in' },
      0,
    );

    const leadImg = imgTrails[imgTrails.length - 1];
    if (targetEl && leadImg) {
      const fromRect = leadImg.getBoundingClientRect();
      const toRect = targetEl.getBoundingClientRect();

      const dx = toRect.left - fromRect.left;
      const dy = toRect.top - fromRect.top;
      const scaleX = toRect.width / fromRect.width;
      const scaleY = toRect.height / fromRect.height;

      // Scatter trailing ghost images.
      if (imgTrails.length > 1) {
        imgTrails.slice(0, -1).forEach((img, i) => {
          tl.to(
            img,
            { opacity: 0, scale: 0.93, duration: 0.4, ease: 'power2.in' },
            i * 0.035,
          );
        });
      }

      // Lead image flies to the card's media slot — manual FLIP.
      tl.set(leadImg, { transformOrigin: '0 0' }, 0.15);
      tl.to(
        leadImg,
        { x: dx, y: dy, scaleX, scaleY, duration: 1.1, ease: 'power3.inOut' },
        0.2,
      );
    }

    // Fade the overlay out after the image has landed.
    tl.to(
      screenEl.value,
      { opacity: 0, duration: 0.45, ease: 'power2.in' },
      leadImg && targetEl ? 0.95 : 0.4,
    );
  }
</script>

<template>
  <div
    ref="screenEl"
    class="intro-screen"
    :class="`is-${phase}`"
    aria-hidden="true"
  >
    <!-- Loader: progress counter (phase 1) -->
    <div class="loader-region">
      <span ref="progressEl" class="progress-counter">{{
        progressDisplay
      }}</span>
    </div>

    <!-- Featured image with trail copies (all phases) -->
    <div ref="imageContainerEl" class="image-region">
      <template v-if="featuredSrc">
        <img
          v-for="i in IMAGE_TRAIL_COUNT"
          :key="i"
          class="trail-img"
          :src="featuredSrc"
          :alt="i === IMAGE_TRAIL_COUNT ? firstTitle : ''"
          :aria-hidden="i !== IMAGE_TRAIL_COUNT ? 'true' : undefined"
          :style="{ zIndex: i }"
        />
      </template>
      <div v-else class="image-placeholder" />
    </div>

    <!-- Name display: appears in intro phase -->
    <div class="name-display">
      <div ref="nameTopEl" class="name-row name-row--top">
        <span
          v-for="i in TEXT_TRAIL_COUNT"
          :key="i"
          class="trail-text"
          :aria-hidden="i !== TEXT_TRAIL_COUNT ? 'true' : undefined"
          >Aslan</span
        >
      </div>
      <div ref="nameBottomEl" class="name-row name-row--bottom">
        <span
          v-for="i in TEXT_TRAIL_COUNT"
          :key="i"
          class="trail-text"
          :aria-hidden="i !== TEXT_TRAIL_COUNT ? 'true' : undefined"
          >French</span
        >
      </div>
    </div>

    <!-- Enter button: appears after trail reveal -->
    <button
      ref="enterButtonEl"
      class="enter-button"
      :class="{ 'is-inert': phase !== 'intro' }"
      @click="handleEnter"
    >
      <span class="enter-label">Enter</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .intro-screen {
    position: fixed;
    inset: 0;
    z-index: var(--z-highest);
    background: var(--color-surface);
    overflow: hidden;
    pointer-events: auto;

    &.is-entering {
      pointer-events: none;
    }
  }

  // ── Loader region ────────────────────────────────────────────────────────────

  .loader-region {
    position: absolute;
    bottom: var(--space-7);
    left: var(--space-7);
    z-index: 2;

    @media (max-width: 767px) {
      bottom: var(--space-6);
      left: var(--space-5);
    }
  }

  .progress-counter {
    display: block;
    font-family: var(--font-mono);
    font-style: italic;
    font-size: clamp(3rem, 7vw, 6.5rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.03em;
    color: var(--color-ink-30);
    user-select: none;
  }

  // ── Image region ─────────────────────────────────────────────────────────────

  .image-region {
    position: absolute;
    top: 0;
    right: 0;
    width: min(52vw, 720px);
    height: 100%;
    z-index: 1;

    @media (max-width: 767px) {
      width: 100%;
      height: 55%;
      bottom: 0;
      top: auto;
    }
  }

  .trail-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    will-change: transform, opacity;
  }

  .image-placeholder {
    position: absolute;
    inset: 0;
    background: var(--color-surface-warm);
  }

  // ── Name display ─────────────────────────────────────────────────────────────

  .name-display {
    position: absolute;
    left: var(--space-7);
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    pointer-events: none;

    // Hidden in loading phase — GSAP will handle the reveal.
    .is-loading & {
      visibility: hidden;
    }

    @media (max-width: 767px) {
      left: var(--space-5);
      top: auto;
      bottom: calc(55% + var(--space-6));
      transform: none;
    }
  }

  .name-row {
    position: relative;
    line-height: 0.88;
  }

  .trail-text {
    display: block;
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 300;
    font-size: clamp(4.5rem, 9vw, 10.5rem);
    color: var(--color-display);
    white-space: nowrap;
    letter-spacing: -0.02em;
    pointer-events: none;
    will-change: transform, opacity;
    // All copies are initially opacity:0; GSAP handles the reveal.
    opacity: 0;

    // Only the last (lead) copy is in-flow to establish row height.
    // The others are absolute so they stack on the lead without expanding the row.
    &:not(:last-child) {
      position: absolute;
      top: 0;
      left: 0;
    }

    &:last-child {
      position: relative;
    }

    @media (max-width: 767px) {
      font-size: clamp(3rem, 12vw, 5rem);
    }
  }

  .name-row--bottom {
    margin-top: 0.06em;
  }

  // ── Enter button ─────────────────────────────────────────────────────────────

  .enter-button {
    position: absolute;
    bottom: var(--space-7);
    left: var(--space-7);
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    background: none;
    border: 1px solid var(--color-ink-30);
    color: var(--color-ink-80);
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-style: italic;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    opacity: 0; // GSAP reveals this.
    will-change: opacity;
    transition:
      border-color 200ms ease,
      color 200ms ease;

    &:hover {
      border-color: var(--color-display);
      color: var(--color-display);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 3px;
    }

    &.is-inert {
      pointer-events: none;
    }

    @media (max-width: 767px) {
      bottom: var(--space-6);
      left: var(--space-5);
    }
  }

  .enter-label {
    display: inline-block;
  }

  // After the enter-label: a small arrow glyph
  .enter-label::after {
    content: ' →';
    opacity: 0.6;
  }
</style>
