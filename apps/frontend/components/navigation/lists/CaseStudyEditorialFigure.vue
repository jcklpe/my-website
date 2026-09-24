<script setup lang="ts">
  // Case-hero spike: editorial figure plate. A pasted-in illustration
  // sharing a row with an inset case-study card — the naturalist field-book
  // gesture (reference anatomy: the henry archive's blocks docked beside
  // rows of content). What distinguishes it from a clickable card is
  // structure, not material — no text plate, no ordinal, no hover response,
  // no pointer affordance.
  //
  // The proposed linear duotone preserved thin engraving lines better than
  // the old threshold halftone. Its host-page SVG filter was removed with the
  // unused CSS treatment; if this figure returns, choose an intentional
  // current treatment rather than restoring the broken filter reference.
  //
  // Currently mocked with gitignored temp images under
  // public/temp-editorial-images/; intended material is public-domain
  // Haeckel plates.
  defineProps<{
    src: string;
  }>();
</script>

<template>
  <figure class="editorial-figure">
    <img class="figure-image" :src="src" alt="" loading="lazy" />
  </figure>
</template>

<style lang="scss" scoped>
  // Absolute fill within the (position: relative) figure slot. The plate is
  // compositional material, not content: it must never drive the row's
  // height — the card defines the row, and the plate crops (object-fit:
  // cover) to whatever space the row leaves it. Intrinsic image dimensions
  // contribute nothing to layout. The inset provides the mounting air.
  .editorial-figure {
    margin: 0;
    position: absolute;
    inset: var(--space-4);
    overflow: hidden;
    border: var(--border-window);
    background: var(--color-surface);
    pointer-events: none;
  }

  .figure-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
  }
</style>
