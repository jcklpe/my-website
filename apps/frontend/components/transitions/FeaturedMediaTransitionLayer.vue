<script setup lang="ts">
  import gsap from 'gsap';

  const transitionState = useFeaturedMediaTransitionState();
  const trailLayer = ref<HTMLElement | null>(null);

  const TRAIL_COUNT = 4;

  const overlayRect = computed(() => {
    const state = transitionState.value;
    return state.phase === 'moving' && state.to ? state.to : state.from;
  });

  const overlayStyle = computed(() => {
    const rect = overlayRect.value;
    const state = transitionState.value;

    if (!rect) {
      return {};
    }

    return {
      clipPath:
        state.phase === 'moving' ? state.mediaClipTo : state.mediaClipFrom,
      borderRadius:
        state.phase === 'moving' ? state.mediaRadiusTo : state.mediaRadiusFrom,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
    };
  });

  const titleOverlayRect = computed(() => {
    const state = transitionState.value;
    return state.phase === 'moving' && state.titleTo
      ? state.titleTo
      : state.titleFrom;
  });

  const titleOverlayStyle = computed(() => {
    const state = transitionState.value;
    const rect = titleOverlayRect.value;
    const titleStyle =
      state.phase === 'moving' && state.titleStyleTo
        ? state.titleStyleTo
        : state.titleStyleFrom;

    if (!rect) {
      return {};
    }

    return {
      color: titleStyle?.color,
      fontFamily: titleStyle?.fontFamily,
      fontSize: titleStyle?.fontSize,
      fontStyle: titleStyle?.fontStyle,
      fontWeight: titleStyle?.fontWeight,
      letterSpacing: titleStyle?.letterSpacing,
      lineHeight: titleStyle?.lineHeight,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
    };
  });

  const metaOverlayRect = computed(() => {
    const state = transitionState.value;
    return state.phase === 'moving' && state.metaTo
      ? state.metaTo
      : state.metaFrom;
  });

  const metaOverlayStyle = computed(() => {
    const rect = metaOverlayRect.value;
    const state = transitionState.value;
    const metaStyle =
      state.phase === 'moving' && state.metaStyleTo
        ? state.metaStyleTo
        : state.metaStyleFrom;

    if (!rect) {
      return {};
    }

    return {
      backgroundColor: metaStyle?.backgroundColor,
      color: metaStyle?.color,
      fontFamily: metaStyle?.fontFamily,
      fontSize: metaStyle?.fontSize,
      fontStyle: metaStyle?.fontStyle,
      fontWeight: metaStyle?.fontWeight,
      letterSpacing: metaStyle?.letterSpacing,
      lineHeight: metaStyle?.lineHeight,
      textTransform: metaStyle?.textTransform,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
    };
  });

  const slipRect = computed(() => {
    const state = transitionState.value;

    // Prefer explicitly captured slip container rects
    if (state.phase === 'moving' && state.slipTo) return state.slipTo;
    if (state.slipFrom) return state.slipFrom;

    // Fallback: combine title + meta text rects
    const titleRect = titleOverlayRect.value;
    const metaRect = metaOverlayRect.value;

    if (!titleRect) return null;
    if (!metaRect) return titleRect;

    const left = Math.min(titleRect.left, metaRect.left);
    const top = Math.min(titleRect.top, metaRect.top);
    const right = Math.max(
      titleRect.left + titleRect.width,
      metaRect.left + metaRect.width,
    );
    const bottom = Math.max(
      titleRect.top + titleRect.height,
      metaRect.top + metaRect.height,
    );

    return { left, top, width: right - left, height: bottom - top };
  });

  const slipStyle = computed(() => {
    const posRect = slipRect.value;
    if (!posRect) return {};
    return {
      width: `${posRect.width}px`,
      height: `${posRect.height}px`,
      transform: `translate3d(${posRect.left}px, ${posRect.top}px, 0)`,
    };
  });

  function routeMotionSeconds() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(
      '--motion-route-transition-duration',
    );
    const ms = Number.parseFloat(raw);
    return Number.isFinite(ms) ? ms / 1000 : 0.56;
  }

  // Trail effect: as the shared media morphs from the square card slab to the
  // arched detail hero, a few cloned echoes ride the same path on a stagger and
  // fade out — the gendes-seamless.cc signature move. GSAP owns the staggered
  // timeline; the main frame morph itself is CSS-driven (see overlayStyle).
  function spawnMediaTrail() {
    const layer = trailLayer.value;
    const state = transitionState.value;
    const from = state.from;
    const to = state.to;
    const mediaUrl = state.media?.sourceUrl;

    if (!layer || !from || !to || !mediaUrl) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    layer.replaceChildren();

    const duration = routeMotionSeconds();

    for (let index = 0; index < TRAIL_COUNT; index += 1) {
      const clone = document.createElement('div');
      clone.className = 'trail-echo';
      clone.style.backgroundImage = `url("${mediaUrl}")`;
      layer.appendChild(clone);

      const progress = (index + 1) / (TRAIL_COUNT + 1);

      gsap.set(clone, {
        x: from.left,
        y: from.top,
        width: from.width,
        height: from.height,
        borderRadius: state.mediaRadiusFrom,
        opacity: 0,
      });

      gsap
        .timeline({
          delay: progress * duration * 0.4,
          onComplete: () => clone.remove(),
        })
        .to(clone, {
          x: to.left,
          y: to.top,
          width: to.width,
          height: to.height,
          borderRadius: state.mediaRadiusTo,
          duration,
          ease: 'power3.out',
        })
        .fromTo(
          clone,
          { opacity: 0 },
          {
            opacity: 0.5 - progress * 0.32,
            duration: duration * 0.35,
            ease: 'power1.out',
          },
          0,
        )
        .to(
          clone,
          { opacity: 0, duration: duration * 0.55, ease: 'power1.in' },
          duration * 0.4,
        );
    }
  }

  function clearMediaTrail() {
    trailLayer.value?.replaceChildren();
  }

  watch(
    () => transitionState.value.phase,
    (phase) => {
      if (phase === 'moving') {
        spawnMediaTrail();
        return;
      }

      if (phase === 'idle') {
        clearMediaTrail();
      }
    },
  );

  onBeforeUnmount(() => {
    clearMediaTrail();
  });
</script>

<template>
  <Teleport to="body">
    <div
      v-if="transitionState.active && transitionState.media?.sourceUrl"
      class="featured-media-transition-layer"
      aria-hidden="true"
    >
      <div ref="trailLayer" class="trail-layer" />

      <figure class="frame" :style="overlayStyle">
        <img
          class="image"
          :src="transitionState.media.sourceUrl"
          :srcset="transitionState.media.srcSet || undefined"
          sizes="100vw"
          :alt="transitionState.media.altText || ''"
          decoding="async"
        />
      </figure>

      <div
        v-if="transitionState.title && transitionState.titleFrom"
        class="slip-bg"
        :style="slipStyle"
      />

      <div
        v-if="transitionState.title && transitionState.titleFrom"
        class="title"
        :style="titleOverlayStyle"
      >
        {{ transitionState.title }}
      </div>

      <div
        v-if="transitionState.meta && transitionState.metaFrom"
        class="meta"
        :style="metaOverlayStyle"
      >
        {{ transitionState.meta }}
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
  .featured-media-transition-layer {
    position: fixed;
    inset: 0;
    z-index: 900;
    pointer-events: none;
  }

  // Trail echoes ride below the main frame on the same fixed plane.
  .trail-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .trail-layer :deep(.trail-echo) {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    background-position: center;
    background-size: cover;
    will-change: transform, opacity, border-radius;
  }

  .frame {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    margin: 0;
    overflow: hidden;
    background: transparent;
    transition:
      clip-path var(--motion-route-transition-duration) var(--motion-snappy),
      border-radius var(--motion-route-transition-duration) var(--motion-snappy),
      width var(--motion-route-transition-duration) var(--motion-snappy),
      height var(--motion-route-transition-duration) var(--motion-snappy),
      transform var(--motion-route-transition-duration) var(--motion-snappy);
  }

  .image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // Transition state (2) — flying clone slip panel and title.
  // Visual appearance is fully delegated to shared-components/_featured-media-overlay.scss.
  // To change how the panel or title looks, edit that file — not here.
  // Geometry, motion timing, and z-layering are intentionally local to this component.
  .slip-bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    @include slip-surface;
    transition:
      width var(--motion-route-transition-duration) var(--motion-snappy),
      height var(--motion-route-transition-duration) var(--motion-snappy),
      transform var(--motion-route-transition-duration) var(--motion-snappy);
  }

  .title {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    box-sizing: border-box;
    font-family: var(--font-display);
    font-style: italic;
    @include slip-title;
    transition:
      width var(--motion-route-transition-duration) var(--motion-snappy),
      height var(--motion-route-transition-duration) var(--motion-snappy),
      font-size var(--motion-route-transition-duration) var(--motion-snappy),
      font-weight var(--motion-route-transition-duration) var(--motion-snappy),
      letter-spacing var(--motion-route-transition-duration)
        var(--motion-snappy),
      line-height var(--motion-route-transition-duration) var(--motion-snappy),
      transform var(--motion-route-transition-duration) var(--motion-snappy);
  }

  .title span {
    transition: none;
  }

  .meta {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    transition: transform var(--motion-route-transition-duration)
      var(--motion-snappy);
  }

  @media (prefers-reduced-motion: reduce) {
    .frame,
    .slip-bg,
    .title,
    .meta {
      transition: none;
    }
  }
</style>
