<script setup lang="ts">
  import type { ComponentPublicInstance } from 'vue';
  import type { WordPressCaseStudy } from '~/types/wordpress';
  import { mediaImageSourceForTreatment } from '~/utils/featured-media';

  type HoverTreatment =
    | 'parallax'
    | 'partition'
    | 'registration'
    | 'aperture'
    | 'catalog'
    | 'signal';

  const props = defineProps<{
    caseStudies: WordPressCaseStudy[];
    treatment: HoverTreatment;
    intensity: number;
  }>();

  const shells = ref<HTMLElement[]>([]);
  const activeMobileIndex = ref(-1);
  const resizeObservers: ResizeObserver[] = [];
  let intersectionObserver: IntersectionObserver | null = null;

  const layouts = ['banner', 'photo-left', 'photo-right'] as const;
  const disciplines = [
    'Research · Service design',
    'Design systems · Operations',
    'Product strategy · Facilitation',
  ];

  const visibleCaseStudies = computed(() => props.caseStudies.slice(0, 3));
  const labStyle = computed(() => ({
    '--partition-shift': `${28 * props.intensity}%`,
    '--partition-shift-negative': `${-28 * props.intensity}%`,
    '--registration-x': `${7 * props.intensity}px`,
    '--registration-y': `${-5 * props.intensity}px`,
    '--aperture-inset': `${Math.max(7, 44 - 40 * props.intensity)}%`,
  }));

  function layoutFor(index: number) {
    return layouts[index] ?? 'banner';
  }

  function imageFor(caseStudy: WordPressCaseStudy) {
    return mediaImageSourceForTreatment(
      caseStudy.featuredMedia,
      'case-study-halftone',
      1200,
    ).sourceUrl;
  }

  function setShell(
    element: Element | ComponentPublicInstance | null,
    index: number,
  ) {
    if (element instanceof HTMLElement) {
      shells.value[index] = element;
    }
  }

  function measureShell(shell: HTMLElement) {
    const imageArea = shell.querySelector<HTMLElement>('.card-image-area');
    const effectLayer = shell.querySelector<HTMLElement>('.effect-layer');
    if (!imageArea || !effectLayer) return;

    const shellBounds = shell.getBoundingClientRect();
    const imageBounds = imageArea.getBoundingClientRect();
    effectLayer.style.left = `${imageBounds.left - shellBounds.left}px`;
    effectLayer.style.top = `${imageBounds.top - shellBounds.top}px`;
    effectLayer.style.width = `${imageBounds.width}px`;
    effectLayer.style.height = `${imageBounds.height}px`;
  }

  function setPointerPosition(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    const shell = event.currentTarget as HTMLElement;
    const bounds = shell.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    shell.style.setProperty('--image-x', `${x * -24 * props.intensity}px`);
    shell.style.setProperty('--image-y', `${y * -18 * props.intensity}px`);
    shell.style.setProperty(
      '--image-tilt-x',
      `${y * -1.2 * props.intensity}deg`,
    );
    shell.style.setProperty(
      '--image-tilt-y',
      `${x * 1.2 * props.intensity}deg`,
    );
  }

  function resetPointerPosition(event: Event) {
    const shell = event.currentTarget as HTMLElement;
    shell.style.setProperty('--image-x', '0px');
    shell.style.setProperty('--image-y', '0px');
    shell.style.setProperty('--image-tilt-x', '0deg');
    shell.style.setProperty('--image-tilt-y', '0deg');
  }

  onMounted(() => {
    for (const [index, shell] of shells.value.entries()) {
      measureShell(shell);
      const resizeObserver = new ResizeObserver(() => measureShell(shell));
      resizeObserver.observe(shell);
      resizeObservers.push(resizeObserver);

      shell.dataset.labIndex = index.toString();
    }

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (!window.matchMedia('(hover: none)').matches) return;

        const centered = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];
        activeMobileIndex.value = Number(
          (centered?.target as HTMLElement | undefined)?.dataset.labIndex ?? -1,
        );
      },
      { threshold: [0.35, 0.55, 0.75] },
    );

    shells.value.forEach((shell) => intersectionObserver?.observe(shell));
  });

  onBeforeUnmount(() => {
    resizeObservers.forEach((observer) => observer.disconnect());
    intersectionObserver?.disconnect();
  });
</script>

<template>
  <div
    v-if="visibleCaseStudies.length"
    class="case-study-lab"
    :style="labStyle"
  >
    <article
      v-for="(caseStudy, index) in visibleCaseStudies"
      :ref="(element) => setShell(element, index)"
      :key="caseStudy.id"
      class="card-shell"
      :class="[
        `is-${treatment}`,
        `signal-${index + 1}`,
        { 'is-mobile-active': activeMobileIndex === index },
      ]"
      tabindex="0"
      :aria-label="`${caseStudy.title}: ${treatment} motion specimen`"
      @pointermove="setPointerPosition"
      @pointerleave="resetPointerPosition"
      @blur="resetPointerPosition"
    >
      <CaseStudyCard
        class="production-card"
        aria-hidden="true"
        inert
        :case-study="caseStudy"
        :card-index="index"
        :is-first-card="true"
        :layout="layoutFor(index)"
        :plate-align="index === 1 ? 'right' : 'left'"
      />

      <div class="effect-layer" aria-hidden="true">
        <img
          v-if="imageFor(caseStudy)"
          class="registration-image"
          :src="imageFor(caseStudy)"
          alt=""
        />
        <div class="partition-layer"><span /><span /><span /></div>
        <div class="aperture-layer" />
        <div class="catalog-layer">
          <span>{{ disciplines[index] }}</span>
          <small>Proposed CMS metadata</small>
        </div>
        <div class="signal-layer">
          <i v-for="signalIndex in 7" :key="signalIndex" />
        </div>
      </div>
    </article>
  </div>

  <p v-else class="empty-state">
    The CMS case studies are unavailable, so the production-faithful hover
    comparison cannot render.
  </p>
</template>

<style lang="scss" scoped>
  .case-study-lab {
    display: grid;
  }

  .card-shell {
    --image-x: 0px;
    --image-y: 0px;
    --image-tilt-x: 0deg;
    --image-tilt-y: 0deg;
    position: relative;
    outline-offset: 4px;
  }

  .production-card {
    pointer-events: none;
  }

  .effect-layer {
    position: absolute;
    z-index: 5;
    overflow: hidden;
    pointer-events: none;
  }

  .registration-image,
  .partition-layer,
  .aperture-layer,
  .catalog-layer,
  .signal-layer {
    position: absolute;
    inset: 0;
    opacity: 0;
  }

  .registration-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: multiply;
    filter: saturate(1.5) contrast(1.1);
    transition:
      transform 260ms steps(3),
      opacity 120ms linear;
  }

  .partition-layer {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .partition-layer span {
    background: rgba(248, 246, 240, 0.28);
    border-right: 1px solid var(--color-primary);
    transition: transform 520ms var(--snappy-ease-out);
  }

  .aperture-layer {
    clip-path: inset(44% 50%);
    background: rgba(38, 87, 235, 0.76);
    mix-blend-mode: multiply;
    transition:
      clip-path 620ms var(--snappy-ease-out),
      opacity 100ms linear;
  }

  .catalog-layer {
    display: grid;
    align-content: end;
    justify-items: start;
    padding: var(--space-4);
  }

  .catalog-layer span,
  .catalog-layer small {
    max-width: calc(100% - var(--space-4));
    padding: 0.25rem 0.45rem;
    overflow: hidden;
    font-family: var(--font-mono);
    line-height: 1.2;
    white-space: nowrap;
    transform: translateX(-120%);
    transition: transform 440ms var(--snappy-ease-out);
  }

  .catalog-layer span {
    color: white;
    background: var(--color-ink);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .catalog-layer small {
    color: var(--color-ink);
    background: var(--color-signal-soft);
    font-size: 0.65rem;
    transition-delay: 65ms;
  }

  .signal-layer i {
    position: absolute;
    display: block;
    background: var(--color-primary);
    transition:
      transform 480ms var(--snappy-ease-out),
      opacity 240ms linear;
  }

  .signal-1 .signal-layer i {
    width: 2px;
    height: 27%;
    bottom: 8%;
    left: calc(8% + var(--signal-index, 1) * 12%);
    transform-origin: bottom;
  }

  .signal-1 .signal-layer i:nth-child(1) {
    left: 12%;
  }
  .signal-1 .signal-layer i:nth-child(2) {
    left: 24%;
  }
  .signal-1 .signal-layer i:nth-child(3) {
    left: 36%;
  }
  .signal-1 .signal-layer i:nth-child(4) {
    left: 48%;
  }
  .signal-1 .signal-layer i:nth-child(5) {
    left: 60%;
  }
  .signal-1 .signal-layer i:nth-child(6) {
    left: 72%;
  }
  .signal-1 .signal-layer i:nth-child(7) {
    left: 84%;
  }

  .signal-2 .signal-layer i {
    width: 72%;
    height: 1px;
    left: 14%;
  }

  .signal-2 .signal-layer i:nth-child(1) {
    top: 15%;
  }
  .signal-2 .signal-layer i:nth-child(2) {
    top: 27%;
  }
  .signal-2 .signal-layer i:nth-child(3) {
    top: 39%;
  }
  .signal-2 .signal-layer i:nth-child(4) {
    top: 51%;
  }
  .signal-2 .signal-layer i:nth-child(5) {
    top: 63%;
  }
  .signal-2 .signal-layer i:nth-child(6) {
    top: 75%;
  }
  .signal-2 .signal-layer i:nth-child(7) {
    top: 87%;
  }

  .signal-3 .signal-layer i {
    width: 12px;
    aspect-ratio: 1;
    top: 50%;
    left: 50%;
    border: 1px solid var(--color-primary);
    border-radius: 50%;
    background: transparent;
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0;
  }

  .card-shell.is-parallax:is(:hover, :focus-visible, .is-mobile-active)
    :deep(.card-halftone-box) {
    transform: translate(var(--image-x), var(--image-y))
      rotateX(var(--image-tilt-x)) rotateY(var(--image-tilt-y)) scale(1.06);
    transition: transform 220ms ease-out;
  }

  .card-shell.is-partition .partition-layer,
  .card-shell.is-registration .registration-image,
  .card-shell.is-aperture .aperture-layer,
  .card-shell.is-catalog .catalog-layer,
  .card-shell.is-signal .signal-layer {
    opacity: 1;
  }

  .card-shell.is-partition:is(:hover, :focus-visible, .is-mobile-active)
    .partition-layer
    span:nth-child(1) {
    transform: translateX(var(--partition-shift-negative));
  }

  .card-shell.is-partition:is(:hover, :focus-visible, .is-mobile-active)
    .partition-layer
    span:nth-child(2) {
    transform: translateY(16%);
  }

  .card-shell.is-partition:is(:hover, :focus-visible, .is-mobile-active)
    .partition-layer
    span:nth-child(3) {
    transform: translateX(var(--partition-shift));
  }

  .card-shell.is-registration:is(:hover, :focus-visible, .is-mobile-active)
    .registration-image {
    transform: translate(var(--registration-x), var(--registration-y));
    opacity: 0.48;
  }

  .card-shell.is-aperture:is(:hover, :focus-visible, .is-mobile-active)
    .aperture-layer {
    clip-path: inset(var(--aperture-inset) 12%);
  }

  .card-shell.is-catalog:is(:hover, :focus-visible, .is-mobile-active)
    .catalog-layer
    span,
  .card-shell.is-catalog:is(:hover, :focus-visible, .is-mobile-active)
    .catalog-layer
    small {
    transform: translateX(0);
  }

  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-1
    i:nth-child(odd) {
    transform: scaleY(2.4);
  }

  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-2
    i {
    transform: translateX(12%);
  }

  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-3
    i {
    opacity: 0.72;
  }

  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-3
    i:nth-child(1) {
    transform: translate(-50%, -50%) scale(2);
  }
  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-3
    i:nth-child(2) {
    transform: translate(-50%, -50%) scale(4);
  }
  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-3
    i:nth-child(3) {
    transform: translate(-50%, -50%) scale(6);
  }
  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-3
    i:nth-child(4) {
    transform: translate(-50%, -50%) scale(8);
  }
  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-3
    i:nth-child(5) {
    transform: translate(-50%, -50%) scale(10);
  }
  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-3
    i:nth-child(6) {
    transform: translate(-50%, -50%) scale(12);
  }
  .card-shell.is-signal:is(:hover, :focus-visible, .is-mobile-active)
    .signal-3
    i:nth-child(7) {
    transform: translate(-50%, -50%) scale(14);
  }

  .empty-state {
    padding: var(--space-6);
    border: var(--border-window);
  }

  @media (prefers-reduced-motion: reduce) {
    .card-shell :deep(.card-halftone-box),
    .registration-image,
    .partition-layer span,
    .aperture-layer,
    .catalog-layer span,
    .catalog-layer small,
    .signal-layer i {
      transition: none;
      transform: none;
    }
  }
</style>
