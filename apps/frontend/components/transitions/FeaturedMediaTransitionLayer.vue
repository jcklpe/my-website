<script setup lang="ts">
  const transitionState = useFeaturedMediaTransitionState();

  const shouldUseHalftoneOverlay = computed(() =>
    Boolean(transitionState.value.key?.startsWith('case-study-')),
  );

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
      borderRadius:
        state.phase === 'moving' ? state.mediaRadiusTo : state.mediaRadiusFrom,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
    };
  });

  function transformRelativeToPlate(
    rect: { left: number; top: number },
    plate: { left: number; top: number },
  ) {
    return `translate3d(${rect.left - plate.left}px, ${rect.top - plate.top}px, 0)`;
  }

  const textPlateRect = computed(() => {
    const state = transitionState.value;

    if (state.phase === 'moving' && state.slipTo) return state.slipTo;
    if (state.slipFrom) return state.slipFrom;

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

  const textPlateStyle = computed(() => {
    const state = transitionState.value;
    const rect = textPlateRect.value;
    const plateStyle =
      state.phase === 'moving' && state.slipStyleTo
        ? state.slipStyleTo
        : state.slipStyleFrom;

    if (!rect) {
      return {};
    }

    return {
      backgroundColor:
        plateStyle?.backgroundColor ?? 'var(--color-surface-warmer)',
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
    const plate = textPlateRect.value;
    const titleStyle =
      state.phase === 'moving' && state.titleStyleTo
        ? state.titleStyleTo
        : state.titleStyleFrom;

    if (!rect || !plate) {
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
      transform: transformRelativeToPlate(rect, plate),
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
    const plate = textPlateRect.value;
    const metaStyle =
      state.phase === 'moving' && state.metaStyleTo
        ? state.metaStyleTo
        : state.metaStyleFrom;

    if (!rect || !plate) {
      return {};
    }

    return {
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
      transform: transformRelativeToPlate(rect, plate),
    };
  });
</script>

<template>
  <!-- The flying clone is split into two teleported layers so the incoming
       article body can sit BETWEEN them: the media plate at a low z-index
       (under the page content, z-index 2), and the text plate at a high
       z-index (over it). Both fade out (Vue leave) at the hand-off. Without
       the split, a single z-900 overlay covered the body until the
       transition finished. -->
  <Teleport to="body">
    <Transition name="media-handoff">
      <div
        v-if="transitionState.active && transitionState.media?.sourceUrl"
        class="ftml-layer ftml-layer--media"
        aria-hidden="true"
      >
        <figure
          class="frame"
          :class="{
            'is-halftone': shouldUseHalftoneOverlay,
            'is-halftone-separate-k': shouldUseHalftoneOverlay,
            'is-plain': !shouldUseHalftoneOverlay,
          }"
          :style="overlayStyle"
        >
          <div v-if="shouldUseHalftoneOverlay" class="frame-halftone">
            <!-- The clone reuses the source's already-loaded image variant
                 (media.sourceUrl is set from the source img's currentSrc in the
                 composable), so it paints from cache with no fresh fetch — that
                 fetch was what made the contrast(1000) halftone render solid
                 black while loading (the Home→Detail black flash). -->
            <img
              class="image"
              :src="transitionState.media.sourceUrl"
              :srcset="transitionState.media.srcSet || undefined"
              sizes="100vw"
              :alt="transitionState.media.altText || ''"
              decoding="async"
            />
            <div class="frame-ink" aria-hidden="true" />
          </div>
          <div
            v-if="shouldUseHalftoneOverlay"
            class="frame-k-layer"
            aria-hidden="true"
          >
            <img
              class="frame-k-image"
              :src="transitionState.media.sourceUrl"
              alt=""
              decoding="async"
            />
          </div>
          <img
            v-else
            class="image"
            :src="transitionState.media.sourceUrl"
            :srcset="transitionState.media.srcSet || undefined"
            sizes="100vw"
            :alt="transitionState.media.altText || ''"
            decoding="async"
          />
        </figure>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="media-handoff">
      <div
        v-if="
          transitionState.active &&
          transitionState.media?.sourceUrl &&
          transitionState.title &&
          transitionState.titleFrom
        "
        class="ftml-layer ftml-layer--text"
        aria-hidden="true"
      >
        <div
          class="text-plate"
          :style="textPlateStyle"
        >
          <div
            v-if="transitionState.meta && transitionState.metaFrom"
            class="meta"
            :style="metaOverlayStyle"
          >
            {{ transitionState.meta }}
          </div>

          <div class="title" :style="titleOverlayStyle">
            {{ transitionState.title }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
  // Two teleported layers straddling the page's article content (z-index 2):
  // the media plate sits under it, the text plate over it. Each is its
  // own fixed stacking context so the page content can render between them.
  .ftml-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }

  .ftml-layer--media {
    z-index: 1;
  }

  .ftml-layer--text {
    z-index: 901;
  }

  // Hand-off cross-fade (Vue leave): the clone fades out over the already-
  // un-hidden destination as the destination's duotone plate fades in. Length
  // is the --motion-duotone-fade-duration token (the composable's reset waits
  // the same). Only the leave is animated — the clone appears instantly at the
  // source on enter.
  .media-handoff-leave-active {
    transition: opacity var(--motion-duotone-fade-duration, 350ms)
      var(--motion-snappy);
  }

  .media-handoff-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .media-handoff-leave-active {
      transition: none;
    }
  }

  // The same moving frame serves both case studies and posts. Case studies
  // keep the current halftone treatment; writing posts fly as plain images.
  // The corner radius animates too, so sharp card corners can morph into a
  // rounded hero plate instead of popping. overflow: hidden clips the content
  // to that rounded box.
  .frame {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    overflow: hidden;
    background: transparent;
    will-change: transform, width, height;
    transition:
      border-radius var(--motion-route-transition-duration)
        var(--motion-snappy),
      width var(--motion-route-transition-duration) var(--motion-snappy),
      height var(--motion-route-transition-duration) var(--motion-snappy),
      transform var(--motion-route-transition-duration) var(--motion-snappy);
  }

  .frame.is-halftone {
    @include halftone-image-box;
  }

  .frame.is-plain {
    background: var(--color-ink);
  }

  .frame-halftone {
    width: 100%;
    height: 100%;
    @include halftone-image-pane;
  }

  .image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .frame.is-halftone .image {
    @include halftone-image-media;
  }

  .frame-ink {
    @include halftone-image-ink;
  }

  .frame.is-halftone-separate-k .image {
    @include halftone-image-media-hues;
  }

  .frame.is-halftone-separate-k .frame-ink {
    @include halftone-image-ink-separate-k-override;
  }

  .frame-k-layer {
    @include halftone-image-k-pane;
  }

  .frame-k-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    @include halftone-image-k-media;
  }

  .frame-k-layer::after {
    @include halftone-image-k-ink;
  }

  // Transition state (2) — flying clone text plate and title.
  // The plate is the animated object; title/meta are positioned inside it.
  .text-plate {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    overflow: hidden;
    background-color: var(--color-surface-warmer);
    border: none;
    will-change: transform, width, height;
    transition:
      background-color var(--motion-route-transition-duration)
        var(--motion-snappy),
      width var(--motion-route-transition-duration) var(--motion-snappy),
      height var(--motion-route-transition-duration) var(--motion-snappy),
      transform var(--motion-route-transition-duration) var(--motion-snappy);
  }

  .title {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    font-family: var(--font-mono);
    font-style: italic;
    @include slip-title;
    transition:
      color var(--motion-route-transition-duration) var(--motion-snappy),
      width var(--motion-route-transition-duration) var(--motion-snappy),
      height var(--motion-route-transition-duration) var(--motion-snappy),
      font-size var(--motion-route-transition-duration) var(--motion-snappy),
      font-weight var(--motion-route-transition-duration) var(--motion-snappy),
      letter-spacing var(--motion-route-transition-duration)
        var(--motion-snappy),
      line-height var(--motion-route-transition-duration) var(--motion-snappy),
      transform var(--motion-route-transition-duration) var(--motion-snappy);
  }

  .meta {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    transition:
      color var(--motion-route-transition-duration) var(--motion-snappy),
      font-size var(--motion-route-transition-duration) var(--motion-snappy),
      font-weight var(--motion-route-transition-duration) var(--motion-snappy),
      letter-spacing var(--motion-route-transition-duration)
        var(--motion-snappy),
      line-height var(--motion-route-transition-duration) var(--motion-snappy),
      transform var(--motion-route-transition-duration) var(--motion-snappy);
  }
</style>
