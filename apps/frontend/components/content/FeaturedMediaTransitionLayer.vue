<script setup lang="ts">
const transitionState = useFeaturedMediaTransitionState()

const overlayRect = computed(() => {
  const state = transitionState.value
  return state.phase === 'moving' && state.to ? state.to : state.from
})

const overlayStyle = computed(() => {
  const rect = overlayRect.value
  const state = transitionState.value

  if (!rect) {
    return {}
  }

  return {
    clipPath: state.phase === 'moving' ? state.mediaClipTo : state.mediaClipFrom,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
  }
})

const titleOverlayRect = computed(() => {
  const state = transitionState.value
  return state.phase === 'moving' && state.titleTo ? state.titleTo : state.titleFrom
})

const titleOverlayStyle = computed(() => {
  const rect = titleOverlayRect.value
  const state = transitionState.value
  const titleStyle = state.phase === 'moving' && state.titleStyleTo
    ? state.titleStyleTo
    : state.titleStyleFrom

  if (!rect) {
    return {}
  }

  return {
    color: titleStyle?.color,
    fontFamily: titleStyle?.fontFamily,
    fontSize: titleStyle?.fontSize,
    fontWeight: titleStyle?.fontWeight,
    letterSpacing: titleStyle?.letterSpacing,
    lineHeight: titleStyle?.lineHeight,
    textShadow: titleStyle?.textShadow,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
  }
})

const titleLabelStyle = computed(() => {
  const state = transitionState.value
  const titleStyle = state.phase === 'moving' && state.titleStyleTo
    ? state.titleStyleTo
    : state.titleStyleFrom

  return {
    backgroundColor: titleStyle?.backgroundColor,
    boxShadow: titleStyle?.boxShadow,
  }
})

const metaOverlayRect = computed(() => {
  const state = transitionState.value
  return state.phase === 'moving' && state.metaTo ? state.metaTo : state.metaFrom
})

const metaOverlayStyle = computed(() => {
  const rect = metaOverlayRect.value
  const state = transitionState.value
  const metaStyle = state.phase === 'moving' && state.metaStyleTo
    ? state.metaStyleTo
    : state.metaStyleFrom

  if (!rect) {
    return {}
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
    transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="transitionState.active && transitionState.media?.sourceUrl"
      class="featured-media-transition-layer"
      aria-hidden="true"
    >
      <figure class="featured-media-transition-layer__frame" :style="overlayStyle">
        <img
          class="featured-media-transition-layer__image"
          :src="transitionState.media.sourceUrl"
          :alt="transitionState.media.altText || ''"
        >
      </figure>

      <div
        v-if="transitionState.title && transitionState.titleFrom"
        class="featured-media-transition-layer__title"
        :style="titleOverlayStyle"
      >
        <span :style="titleLabelStyle">{{ transitionState.title }}</span>
      </div>

      <div
        v-if="transitionState.meta && transitionState.metaFrom"
        class="featured-media-transition-layer__meta"
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

.featured-media-transition-layer__frame {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  overflow: hidden;
  background: transparent;
  transition:
    clip-path var(--motion-route-transition-duration) var(--motion-snappy),
    width var(--motion-route-transition-duration) var(--motion-snappy),
    height var(--motion-route-transition-duration) var(--motion-snappy),
    transform var(--motion-route-transition-duration) var(--motion-snappy);
}

.featured-media-transition-layer__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-media-transition-layer__title {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  color: white;
  font-family: var(--font-serif);
  line-height: 0.95;
  letter-spacing: -0.055em;
  text-shadow: 0 2px 2px rgba(0, 0, 0, 0.35);
  transition:
    color var(--motion-route-transition-duration) var(--motion-snappy),
    font-size var(--motion-route-transition-duration) var(--motion-snappy),
    font-weight var(--motion-route-transition-duration) var(--motion-snappy),
    letter-spacing var(--motion-route-transition-duration) var(--motion-snappy),
    line-height var(--motion-route-transition-duration) var(--motion-snappy),
    text-shadow var(--motion-route-transition-duration) var(--motion-snappy),
    width var(--motion-route-transition-duration) var(--motion-snappy),
    height var(--motion-route-transition-duration) var(--motion-snappy),
    transform var(--motion-route-transition-duration) var(--motion-snappy);
}

.featured-media-transition-layer__title span {
  background-color: black;
  box-shadow:
    3em 0 0 black,
    -0.3em 0 0 black;
  transition:
    background-color var(--motion-route-transition-duration) var(--motion-snappy),
    box-shadow var(--motion-route-transition-duration) var(--motion-snappy);
}

.featured-media-transition-layer__meta {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0.35em 0.55em;
  white-space: nowrap;
  background: black;
  transition:
    color var(--motion-route-transition-duration) var(--motion-snappy),
    font-size var(--motion-route-transition-duration) var(--motion-snappy),
    letter-spacing var(--motion-route-transition-duration) var(--motion-snappy),
    line-height var(--motion-route-transition-duration) var(--motion-snappy),
    width var(--motion-route-transition-duration) var(--motion-snappy),
    height var(--motion-route-transition-duration) var(--motion-snappy),
    transform var(--motion-route-transition-duration) var(--motion-snappy);
}
</style>
