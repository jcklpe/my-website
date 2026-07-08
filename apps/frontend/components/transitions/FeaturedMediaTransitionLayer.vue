<script setup lang="ts">
  const transitionState = useFeaturedMediaTransitionState();
  const shouldUseHalftoneFallback = useHalftonePerformanceFallback();
  const isBakedHalftoneMedia = computed(
    () => transitionState.value.media?.treatment === 'case-study-halftone',
  );
  const isCaseStudyTransition = computed(() =>
    Boolean(transitionState.value.key?.startsWith('case-study-')),
  );
  // Read the source element's actual ground color at clone-creation time so the
  // strips start matching whichever surface was clicked (home card = off-white,
  // loop nav = off-white, detail hero = cream). The keyframes then animate the
  // color during flight so strips arrive already matching the destination.
  const cloneTitleGroundColor = computed(
    () => transitionState.value.titleGroundColor ?? 'var(--color-surface-warmer)',
  );
  const shouldUseInstantMediaHandoff = computed(
    () =>
      isBakedHalftoneMedia.value &&
      transitionState.value.sourceRole === 'source',
  );

  const shouldUseHalftoneOverlay = computed(() =>
    Boolean(
      transitionState.value.key?.startsWith('case-study-') &&
        !isBakedHalftoneMedia.value,
    ),
  );
  const shouldUseSimplifiedHalftoneOverlay = computed(
    () => shouldUseHalftoneOverlay.value && shouldUseHalftoneFallback.value,
  );
  const shouldRenderHalftoneOverlay = computed(
    () =>
      shouldUseHalftoneOverlay.value && !shouldUseSimplifiedHalftoneOverlay.value,
  );

  const shouldGateCloneReveal = computed(
    () =>
      shouldRenderHalftoneOverlay.value &&
      transitionState.value.sourceRole === 'source',
  );
  const requiredCloneLayers = computed(() =>
    shouldRenderHalftoneOverlay.value ? ['base', 'k'] : ['base'],
  );

  // The clone's halftone is an expensive filter stack (contrast(1000) + blurs +
  // blend layers). On a brand-new forward card→detail element it isn't always
  // rasterized on the first painted frame, so the clone can flash solid black
  // before the effect resolves. Reverse/detail→card flights need an immediate
  // source-to-clone handoff, so the gate only applies to forward halftone
  // flights.
  const cloneMediaReadyFlightId = ref<number | null>(null);
  const cloneLoadedLayersByFlight = new Map<number, Set<string>>();
  const isCloneMediaReady = computed(
    () =>
      !shouldGateCloneReveal.value ||
      cloneMediaReadyFlightId.value === transitionState.value.flightId,
  );

  function markCloneFlightPainted(flightId: number) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (
          transitionState.value.active &&
          transitionState.value.flightId === flightId
        ) {
          cloneMediaReadyFlightId.value = flightId;
        }
      });
    });
  }

  function markCloneLayerLoaded(layer: string, flightId: number) {
    const loadedLayers =
      cloneLoadedLayersByFlight.get(flightId) ?? new Set<string>();

    loadedLayers.add(layer);
    cloneLoadedLayersByFlight.set(flightId, loadedLayers);

    const requiredLayersReady = requiredCloneLayers.value.every((layer) =>
      loadedLayers.has(layer),
    );

    if (!requiredLayersReady) {
      return;
    }

    markCloneFlightPainted(flightId);
  }

  function markAlreadyLoadedCloneLayers(flightId: number) {
    void nextTick(() => {
      if (transitionState.value.flightId !== flightId) {
        return;
      }

      document
        .querySelectorAll<HTMLImageElement>(
          '.ftml-layer--media [data-clone-layer]',
        )
        .forEach((image) => {
          const cloneLayer = image.dataset.cloneLayer;

          if (cloneLayer && image.complete && image.naturalWidth > 0) {
            markCloneLayerLoaded(cloneLayer, flightId);
          }
        });
    });
  }

  watch(
    () => transitionState.value.flightId,
    (flightId) => {
      cloneMediaReadyFlightId.value = null;

      if (!flightId) {
        return;
      }

      cloneLoadedLayersByFlight.delete(flightId);

      if (!shouldGateCloneReveal.value) {
        cloneMediaReadyFlightId.value = flightId;
        return;
      }

      markAlreadyLoadedCloneLayers(flightId);

      // Safety: cached images sometimes complete before the load listener gets
      // a turn. Re-check the actual DOM image state shortly after mount without
      // carrying a ready flag across flights.
      window.setTimeout(() => {
        if (
          transitionState.value.active &&
          transitionState.value.flightId === flightId &&
          shouldGateCloneReveal.value
        ) {
          markAlreadyLoadedCloneLayers(flightId);
        }
      }, 120);
    },
  );

  function onCloneImageLoad(layer: string) {
    const flightId = transitionState.value.flightId;

    if (!flightId) {
      return;
    }

    if (!shouldGateCloneReveal.value) {
      cloneMediaReadyFlightId.value = flightId;
      return;
    }

    markCloneLayerLoaded(layer, flightId);
  }

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
        :class="{
          'is-forward-source': transitionState.sourceRole === 'source',
          'is-instant-handoff': shouldUseInstantMediaHandoff,
          'is-reverse-source': transitionState.sourceRole === 'target',
        }"
        aria-hidden="true"
      >
        <figure
          class="frame"
          :class="{
            'is-halftone': shouldRenderHalftoneOverlay,
            'is-halftone-separate-k': shouldRenderHalftoneOverlay,
            'is-halftone-simplified': shouldUseSimplifiedHalftoneOverlay,
            'is-plain': !shouldRenderHalftoneOverlay,
            'is-media-ready': isCloneMediaReady,
          }"
          :style="overlayStyle"
        >
          <div v-if="shouldRenderHalftoneOverlay" class="frame-halftone">
            <!-- Two complementary fixes for the Home→Detail black flash:
                 (1) The clone reuses the source's already-loaded image VARIANT
                 (media.sourceUrl = the source img's currentSrc, set in the
                 composable) — no fresh network fetch.
                 (2) decoding="sync" forces the (now-cached) image to decode and
                 paint atomically on the FIRST frame. With async decode, a
                 brand-new <img> can paint a frame late even from cache, and the
                 contrast(1000) halftone renders solid black over the empty pane
                 for that frame. sync only works because (1) made it cached;
                 before that the image was still downloading, so sync couldn't
                 help. -->
            <img
              class="image"
              :src="transitionState.media.sourceUrl"
              :srcset="transitionState.media.srcSet || undefined"
              sizes="100vw"
              :alt="transitionState.media.altText || ''"
              decoding="sync"
              data-clone-layer="base"
              @load="onCloneImageLoad('base')"
            />
            <div class="frame-ink" aria-hidden="true" />
          </div>
          <div
            v-if="shouldRenderHalftoneOverlay"
            class="frame-k-layer"
            aria-hidden="true"
          >
            <img
              class="frame-k-image"
              :src="transitionState.media.sourceUrl"
              alt=""
              decoding="sync"
              data-clone-layer="k"
              @load="onCloneImageLoad('k')"
            />
          </div>
          <img
            v-else
            class="image"
            :src="transitionState.media.sourceUrl"
            :srcset="transitionState.media.srcSet || undefined"
            sizes="100vw"
            :alt="transitionState.media.altText || ''"
            decoding="sync"
            data-clone-layer="base"
            @load="onCloneImageLoad('base')"
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
        :class="{
          'is-case-study-transition':
            transitionState.key?.startsWith('case-study-'),
          'is-forward-source': transitionState.sourceRole === 'source',
          'is-reverse-source': transitionState.sourceRole === 'target',
          'is-moving': transitionState.phase === 'moving',
        }"
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
            <SteppedTitleGround
              v-if="isCaseStudyTransition"
              class="title-text"
              :text="transitionState.title"
              :ground-color="cloneTitleGroundColor"
            />
            <span v-else class="title-text">{{ transitionState.title }}</span>
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
    --featured-media-flight-ease: var(--snappy-ease-out);

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
  // is the --duotone-fade-duration token (the composable's reset waits
  // the same). Only the leave is animated — the clone appears instantly at the
  // source on enter.
  .media-handoff-leave-active {
    transition: opacity var(--duotone-fade-duration, 350ms)
      var(--snappy-ease-out);
  }

  .media-handoff-leave-active.is-instant-handoff {
    transition: none;
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
    // Forward halftone flights can stay hidden until their filter has
    // rasterized. Other flights are marked ready immediately so the real source
    // can hand off to the clone without a fixed-frame blink.
    opacity: 0;
    will-change: transform, width, height;
    transition:
      border-radius var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      width var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      height var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      transform var(--featured-media-flight-duration)
        var(--featured-media-flight-ease);
  }

  .frame.is-media-ready {
    opacity: 1;
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
      background-color var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      width var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      height var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      transform var(--featured-media-flight-duration)
        var(--featured-media-flight-ease);
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
      color var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      width var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      height var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      font-size var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      font-weight var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      letter-spacing var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      line-height var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      transform var(--featured-media-flight-duration)
        var(--featured-media-flight-ease);
  }

  .title span {
    display: inline;
  }

  .title .stepped-title-ground {
    display: block;
  }

  .title-ground {
    display: none;
  }

  @include breakpoint(phone) {
    .ftml-layer--text.is-case-study-transition.media-handoff-leave-active {
      transition: none;
    }

    .ftml-layer--text.is-case-study-transition .text-plate {
      overflow: visible;
      background-color: transparent !important;
    }

    .ftml-layer--text.is-case-study-transition .title {
      height: auto !important;
      overflow: visible;
    }

    .title {
      overflow-wrap: anywhere;
      word-break: break-word;
      text-wrap: wrap;
    }

    .ftml-layer--text.is-case-study-transition .title-text {
      position: relative;
      z-index: 1;
    }

    .ftml-layer--text.is-case-study-transition .title-ground {
      display: none;
    }

    .ftml-layer--text.is-case-study-transition.is-moving.is-forward-source
      :deep(.stepped-title-ground__strip) {
      animation: mobile-case-title-ground-enter
        var(--featured-media-flight-duration) linear both;
    }

    .ftml-layer--text.is-case-study-transition.is-moving.is-reverse-source
      :deep(.stepped-title-ground__strip) {
      animation: mobile-case-title-ground-exit
        var(--featured-media-flight-duration) linear both;
    }

    @keyframes mobile-case-title-ground-enter {
      // Hold source color while clone is still over the source textplate,
      // then ease to destination cream so strips arrive already matching.
      // --stepped-title-ground-color is set from the captured source ground color.
      0%,
      30% {
        background-color: var(--stepped-title-ground-color);
      }
      85%,
      100% {
        background-color: var(--color-surface-warmer);
      }
    }

    @keyframes mobile-case-title-ground-exit {
      // sourceRole='target' means detail-hero → home card. Hold cream while
      // over the hero, then ease to --color-surface so strips match on landing.
      0%,
      30% {
        background-color: var(--color-surface-warmer);
      }
      85%,
      100% {
        background-color: var(--color-surface);
      }
    }
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
      color var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      font-size var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      font-weight var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      letter-spacing var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      line-height var(--featured-media-flight-duration)
        var(--featured-media-flight-ease),
      transform var(--featured-media-flight-duration)
        var(--featured-media-flight-ease);
  }
</style>
