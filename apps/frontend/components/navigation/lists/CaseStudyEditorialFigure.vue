<script setup lang="ts">
  // Case-hero spike: editorial figure plate. A pasted-in illustration
  // sharing a row with an inset case-study card — the naturalist field-book
  // gesture (reference anatomy: the henry archive's blocks docked beside
  // rows of content). What distinguishes it from a clickable card is
  // structure, not material — no text plate, no ordinal, no hover response,
  // no pointer affordance.
  //
  // Treatment: linear duotone only (the settings matrix's "direct" mode).
  // The threshold halftone chain was tried first and destroyed line-art
  // plates — engravings are mostly paper with thin strokes, and the
  // contrast(1000) pass reduced them to sparse inkblots. The linear duotone
  // maps the full tonal range into blue↔cream, so line work survives and
  // the palette is still enforced. The filter def (#halftone-tone-blue-cream)
  // lives on the host page (HomeSelectedWorkSection), same as the card's.
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
    filter: url('#halftone-tone-blue-cream');
  }
</style>
