<script setup lang="ts">
  import { useImageLightbox } from '~/composables/useImageLightbox';
  import {
    scheduleSidenoteLayout,
    truncatedSidenoteUuids,
  } from '~/composables/useSidenoteLayout';
  import {
    useSidenoteExpanded,
    toggleSidenoteExpanded,
  } from '~/composables/useSidenoteExpanded';

  const props = defineProps<{
    number: number;
    contentHtml: string;
    uuid: string;
  }>();

  const teleportTarget = ref<HTMLElement | null>(null);
  const { openImage } = useImageLightbox();
  const { expandedUuid } = useSidenoteExpanded();
  const isExpanded = computed(() => expandedUuid.value === props.uuid);
  // Truncation is detected by the layout pass (correct timing + width context).
  const isTruncated = computed(() =>
    truncatedSidenoteUuids.value.has(props.uuid),
  );

  onMounted(() => {
    const self = document.querySelector<HTMLElement>(
      `.footnote-sidenote[data-uuid="${props.uuid}"]`,
    );
    const marker = document.querySelector<HTMLElement>(
      `sup[data-fn="${props.uuid}"]`,
    );
    const contentFlow = document.querySelector<HTMLElement>('.content-flow');

    if (self && marker && contentFlow) {
      const desired =
        marker.getBoundingClientRect().top -
        contentFlow.getBoundingClientRect().top;
      self.dataset.desiredTop = String(desired);
    }

    teleportTarget.value = contentFlow;
    scheduleSidenoteLayout();
  });

  function handleContentClick(event: MouseEvent) {
    const img = (event.target as Element).closest('img');
    if (!img) return;
    event.preventDefault();
    openImage((img as HTMLImageElement).src, (img as HTMLImageElement).alt);
  }
</script>

<template>
  <Teleport :to="teleportTarget" :disabled="!teleportTarget">
    <aside
      class="footnote-sidenote"
      :class="{ 'is-truncated': isTruncated, 'is-expanded': isExpanded }"
      :data-uuid="uuid"
      role="note"
      :aria-label="`Footnote ${number}`"
    >
      <div class="sidenote-body" @click="handleContentClick">
        <sup class="sidenote-ref" aria-hidden="true">{{ number }}</sup>
        <div class="sidenote-text" v-html="contentHtml" />
      </div>
      <button
        v-if="isTruncated"
        class="sidenote-more-btn"
        :class="{ 'is-open': isExpanded }"
        :aria-expanded="isExpanded"
        :aria-label="
          isExpanded
            ? `Collapse footnote ${number}`
            : `Expand footnote ${number}`
        "
        @click.stop="toggleSidenoteExpanded(uuid)"
      >
        <span class="btn-label">{{ isExpanded ? 'less' : 'more' }}</span
        ><span class="btn-arrow-clip" aria-hidden="true"
          ><span class="btn-arrow">{{ isExpanded ? '↑' : '↓' }}</span></span
        >
      </button>
    </aside>
  </Teleport>
</template>

<style lang="scss" scoped>
  // Absolutely positioned so it occupies zero grid rows — no gap in content flow.
  // Grid-column named lines are resolved from the parent grid; top set by JS.
  .footnote-sidenote {
    position: absolute;
    grid-column: content-end / full-end;
    top: 0;
    // 12% left gap + 65% sidenote + 35% right breathing room — all relative to the
    // grid area width (content-end → full-end), so proportions hold across viewports.
    max-width: 65%;
    padding: 0 var(--space-3) 0 12%;
    opacity: 0;
    transition: opacity 220ms var(--snappy-ease-out);
    pointer-events: none;

    @media (max-width: 1199px) {
      display: none;
    }
  }

  .footnote-sidenote.is-positioned {
    opacity: 1;
    pointer-events: auto;
  }

  // Displaced too far from its marker by stacking — hidden from margin.
  // ParagraphBlock detects this class and falls back to the in-note on desktop.
  .footnote-sidenote.is-overflow {
    display: none;
  }

  // Expanded: match the page ground exactly (texture + gradient) so the note
  // is invisible against the page when the text is short, but stays legible
  // when it overlaps a wide image. Vertical padding gives the text breathing
  // room; left/right are left unchanged to avoid any horizontal position shift.
  .footnote-sidenote.is-expanded {
    background: var(--color-surface-warmer);
    background-size: var(--texture-paper-grid-size);
    padding-top: var(--space-2);
    padding-bottom: 30px;
  }

  // Truncated: only when the note's full height would physically overlap a
  // column obstacle (wide image, full-width block). The layout detects this
  // by comparing scrollHeight against the obstacle's top edge.
  // When expanded (:not(.is-expanded) stops matching), the body grows to full
  // height automatically — no extra CSS needed for the expanded state.
  .footnote-sidenote.is-truncated:not(.is-expanded) .sidenote-body {
    max-height: 8rem;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  }

  .sidenote-more-btn {
    display: flex;
    align-items: center;
    gap: 0.3em;
    width: max-content;
    margin-top: var(--space-1);
    padding: 0;
    border: none;
    background: none;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 0.6em;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 120ms;

    &:hover {
      opacity: 1;
    }
  }

  // Arrow slip: the arrow clips within its container and slides out in its
  // pointing direction, then re-enters from the opposite direction.
  .btn-arrow-clip {
    display: inline-block;
    overflow: hidden;
    height: 1.1em;
    line-height: 1.1em;
    vertical-align: middle;
  }

  .btn-arrow {
    display: block;
  }

  .sidenote-more-btn:not(.is-open):hover .btn-arrow {
    animation: arrow-slip-down 360ms var(--snappy-ease-out) forwards;
  }

  .sidenote-more-btn.is-open:hover .btn-arrow {
    animation: arrow-slip-up 360ms var(--snappy-ease-out) forwards;
  }

  @keyframes arrow-slip-down {
    0% {
      transform: translateY(0);
    }
    42% {
      transform: translateY(130%);
    }
    43% {
      transform: translateY(-130%);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes arrow-slip-up {
    0% {
      transform: translateY(0);
    }
    42% {
      transform: translateY(-130%);
    }
    43% {
      transform: translateY(130%);
    }
    100% {
      transform: translateY(0);
    }
  }

  .sidenote-body {
    display: flex;
    align-items: flex-start;
    gap: 0.3em;
  }

  .sidenote-ref {
    // Always sized as a circle so the pulse animation only changes background/color
    // — no layout dimensions change on pulse, eliminating the reflow jank.
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
    background: transparent;
    margin-top: 0.1em;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 0.65em;
    font-weight: 700;
    line-height: 1;
  }

  .sidenote-text {
    flex: 1;
    min-width: 0;
    font-size: var(--type-base);
    line-height: 1.45;
    color: var(--color-ink-80);
  }

  .sidenote-text :deep(p) {
    margin: 0 0 var(--space-2);
  }

  .sidenote-text :deep(p:last-child) {
    margin-bottom: 0;
  }

  .sidenote-text :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin-top: var(--space-2);
    cursor: zoom-in;
  }

  .sidenote-text :deep(figcaption),
  .sidenote-text :deep(.wp-element-caption) {
    display: block;
    margin-top: var(--space-1);
    color: var(--color-ink-80);
    font-size: inherit;
    font-style: italic;
    line-height: 1.35;
  }

  .sidenote-text :deep(a) {
    @include rich-link;
  }

  .sidenote-text :deep(a:hover),
  .sidenote-text :deep(a:focus-visible) {
    @include rich-link-hover;
  }

  @keyframes sidenote-ref-pulse {
    0%,
    100% {
      background: transparent;
      color: var(--color-primary);
    }
    30% {
      background: var(--color-primary);
      color: white;
    }
  }

  // Pulse: only background and color animate — dimensions are pre-reserved above.
  .footnote-sidenote.is-pulsing .sidenote-ref {
    animation: sidenote-ref-pulse 600ms var(--snappy-ease-out);
  }

  @media (prefers-reduced-motion: reduce) {
    .footnote-sidenote {
      transition: none;
    }

    .footnote-sidenote.is-pulsing .sidenote-ref {
      animation: none;
    }
  }
</style>
