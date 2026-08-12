<script setup lang="ts">
  import type { ComponentPublicInstance } from 'vue';
  import type { WordPressCaseStudy } from '~/types/wordpress';
  import {
    caseStudyPhotoTreatmentClasses,
    caseStudyPhotoTreatmentConfig,
    caseStudyPhotoTreatmentStyle,
  } from '~/utils/case-study-photo-treatment';
  type CardOverlay = 'none' | 'catalog';

  const props = defineProps<{
    caseStudies: WordPressCaseStudy[];
    overlay: CardOverlay;
    enableParallax: boolean;
    enablePhotoColor: boolean;
    useOriginalMedia: boolean;
    parallaxShift: number;
  }>();

  const shells = ref<HTMLElement[]>([]);
  const activeMobileIndex = ref(-1);
  const resizeObservers: ResizeObserver[] = [];
  let intersectionObserver: IntersectionObserver | null = null;
  let animationFrame = 0;
  const pointerTargets = new WeakMap<HTMLElement, { x: number; y: number }>();
  const pointerPositions = new WeakMap<HTMLElement, { x: number; y: number }>();

  const layouts = ['banner', 'photo-left', 'photo-right'] as const;
  const disciplines = [
    'Research · Service design',
    'Design systems · Operations',
    'Product strategy · Facilitation',
  ];
  const engagementContexts = [
    'Multi-year system consolidation',
    'Cross-department product delivery',
    'Public-service website redesign',
  ];

  const visibleCaseStudies = computed(() => props.caseStudies.slice(0, 3));

  provide('caseStudyCardSpike', {
    resolveClasses: (index: number) =>
      caseStudyPhotoTreatmentClasses(
        caseStudyPhotoTreatmentConfig(visibleCaseStudies.value[index], index),
      ),
    resolveStyle: (index: number) =>
      caseStudyPhotoTreatmentStyle(
        caseStudyPhotoTreatmentConfig(visibleCaseStudies.value[index], index),
      ),
    resolveTonePair: (index: number) =>
      caseStudyPhotoTreatmentConfig(visibleCaseStudies.value[index], index)
        .tonePair,
    resolveDuotoneMode: (index: number) =>
      caseStudyPhotoTreatmentConfig(visibleCaseStudies.value[index], index)
        .duotoneMode,
    resolveTintOverlayEnabled: (index: number) =>
      caseStudyPhotoTreatmentConfig(visibleCaseStudies.value[index], index)
        .tintOverlayEnabled,
  });

  function layoutFor(index: number) {
    return layouts[index] ?? 'banner';
  }

  function cardStyleFor(index: number) {
    if (index === 1)
      return { '--inline-photo-width': 'clamp(220px, 30%, 430px)' };
    if (index === 2)
      return { '--inline-photo-width': 'clamp(280px, 41%, 560px)' };
    return {};
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
    pointerTargets.set(shell, {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    });
  }

  function resetPointerPosition(event: Event) {
    const shell = event.currentTarget as HTMLElement;
    pointerTargets.set(shell, { x: 0, y: 0 });
  }

  function animateParallax() {
    for (const shell of shells.value) {
      const target = pointerTargets.get(shell) ?? { x: 0, y: 0 };
      const current = pointerPositions.get(shell) ?? { x: 0, y: 0 };
      current.x += (target.x - current.x) * 0.1;
      current.y += (target.y - current.y) * 0.1;
      pointerPositions.set(shell, current);

      const textTravel = props.parallaxShift;
      const imageTravel = textTravel * (0.08 / 0.15);
      shell.style.setProperty('--image-x', `${current.x * -imageTravel}px`);
      shell.style.setProperty(
        '--image-y',
        `${current.y * -imageTravel * 0.72}px`,
      );
      shell.style.setProperty('--text-x', `${current.x * -textTravel}px`);
      shell.style.setProperty(
        '--text-y',
        `${current.y * -textTravel * 0.72}px`,
      );
    }

    animationFrame = window.requestAnimationFrame(animateParallax);
  }

  onMounted(() => {
    for (const [index, shell] of shells.value.entries()) {
      measureShell(shell);
      const resizeObserver = new ResizeObserver(() => measureShell(shell));
      resizeObserver.observe(shell);
      resizeObservers.push(resizeObserver);

      shell.dataset.labIndex = index.toString();
      pointerTargets.set(shell, { x: 0, y: 0 });
      pointerPositions.set(shell, { x: 0, y: 0 });
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
    animationFrame = window.requestAnimationFrame(animateParallax);
  });

  onBeforeUnmount(() => {
    resizeObservers.forEach((observer) => observer.disconnect());
    intersectionObserver?.disconnect();
    window.cancelAnimationFrame(animationFrame);
  });
</script>

<template>
  <div v-if="visibleCaseStudies.length" class="case-study-lab">
    <article
      v-for="(caseStudy, index) in visibleCaseStudies"
      :ref="(element) => setShell(element, index)"
      :key="caseStudy.id"
      class="card-shell"
      :class="[
        `is-${overlay}`,
        {
          'has-parallax': enableParallax,
          'is-photo-color': enablePhotoColor,
          'uses-original-media': useOriginalMedia,
          'is-mobile-active': activeMobileIndex === index,
        },
      ]"
      tabindex="0"
      :aria-label="`${caseStudy.title}: ${overlay} motion specimen`"
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
        :is-first-card="index === 0"
        :layout="layoutFor(index)"
        :plate-align="index === 1 ? 'right' : 'left'"
        :force-original-media="useOriginalMedia"
        :style="cardStyleFor(index)"
      />

      <div class="effect-layer" aria-hidden="true">
        <div class="catalog-layer">
          <span>{{ disciplines[index] }}</span>
          <small>{{ engagementContexts[index] }}</small>
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
    --text-x: 0px;
    --text-y: 0px;
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

  .catalog-layer {
    position: absolute;
    inset: 0;
    opacity: 0;
  }

  .catalog-layer {
    display: grid;
    align-content: end;
    justify-items: start;
    padding: var(--space-5);
  }

  .catalog-layer span,
  .catalog-layer small {
    max-width: calc(100% - var(--space-4));
    padding: 0.35rem 0.55rem;
    overflow: hidden;
    font-family: var(--font-mono);
    line-height: 1.2;
    white-space: nowrap;
    transform: translateX(-120%);
    transition: transform 520ms var(--snappy-ease-out);
  }

  .catalog-layer span {
    color: white;
    background: var(--color-ink);
    font-size: clamp(0.8rem, 1.15vw, 1rem);
    font-weight: 600;
  }

  .catalog-layer small {
    color: var(--color-ink);
    background: var(--color-paper, #f8f6f0);
    font-size: clamp(0.72rem, 1vw, 0.88rem);
    transition-delay: 130ms;
  }

  .card-shell.has-parallax:is(:hover, :focus-visible, .is-mobile-active)
    :deep(.card-halftone-box) {
    transform: translate3d(var(--image-x), var(--image-y), 0) scale(1.06);
  }

  .card-shell.has-parallax :deep(.card-halftone-box) {
    transform-origin: center;
    transform: translate3d(0, 0, 0) scale(1.06);
    will-change: transform;
  }

  .card-shell.has-parallax:is(:hover, :focus-visible, .is-mobile-active)
    :deep(.plate-content) {
    transform: translate3d(var(--text-x), var(--text-y), 0);
  }

  .card-shell.has-parallax :deep(.plate-content) {
    transform: translate3d(0, 0, 0);
    will-change: transform;
  }

  .card-shell.uses-original-media :deep(.card-halftone-box),
  .card-shell.uses-original-media :deep(.media-frame .image) {
    filter: none;
  }

  .card-shell.uses-original-media :deep(.card-bleed),
  .card-shell.uses-original-media :deep(.card-gradient-tint) {
    opacity: 0;
  }

  .card-shell.is-photo-color:is(:hover, :focus-visible, .is-mobile-active)
    :deep(.card-halftone-box.is-baked-halftone) {
    filter: none;
  }

  .card-shell.is-photo-color:is(:hover, :focus-visible, .is-mobile-active)
    :deep(.card-bleed),
  .card-shell.is-photo-color:is(:hover, :focus-visible, .is-mobile-active)
    :deep(.card-gradient-tint) {
    opacity: 0;
  }

  .card-shell.is-catalog .catalog-layer {
    opacity: 1;
  }

  .card-shell.is-catalog:is(:hover, :focus-visible, .is-mobile-active)
    .catalog-layer
    span,
  .card-shell.is-catalog:is(:hover, :focus-visible, .is-mobile-active)
    .catalog-layer
    small {
    transform: translateX(0);
  }

  .empty-state {
    padding: var(--space-6);
    border: var(--border-window);
  }

  @media (prefers-reduced-motion: reduce) {
    .card-shell :deep(.card-halftone-box),
    .card-shell :deep(.plate-content),
    .catalog-layer span,
    .catalog-layer small {
      transition: none;
      transform: none;
    }
  }
</style>
