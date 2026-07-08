<script setup lang="ts">
  import { useImageLightbox } from '~/composables/useImageLightbox';

  defineProps<{
    number: number;
    contentHtml: string;
    forceDesktopVisible?: boolean;
    isLeaving?: boolean;
  }>();

  const emit = defineEmits<{
    close: [];
  }>();

  const rootEl = ref<HTMLElement | null>(null);
  const { openImage } = useImageLightbox();

  onMounted(() => {
    nextTick(() => {
      rootEl.value?.focus();
      document.addEventListener('keydown', handleKeydown);
    });
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') emit('close');
  }

  function handleContentClick(event: MouseEvent) {
    const img = (event.target as Element).closest('img');
    if (!img) return;
    event.preventDefault();
    openImage((img as HTMLImageElement).src, (img as HTMLImageElement).alt);
  }
</script>

<template>
  <aside
    ref="rootEl"
    class="footnote-in-note"
    :class="{ 'is-desktop-visible': forceDesktopVisible, 'is-leaving': isLeaving }"
    role="note"
    :aria-label="`Footnote ${number}`"
    tabindex="-1"
  >
    <span class="in-note-label">Note {{ number }}</span>
    <div class="in-note-content" @click="handleContentClick" v-html="contentHtml" />
  </aside>
</template>

<style lang="scss" scoped>
  .footnote-in-note {
    position: relative;
    display: block;
    overflow: hidden;
    margin-block: 0;
    padding: var(--space-2) var(--space-3) var(--space-3);
    border-left: 3px solid var(--color-primary);
    background: var(--color-surface-faint);
    outline: none;
    animation: in-note-enter 200ms var(--snappy-ease-out) both;

    @include content-flow-child {
      grid-column: content;
    }

    // Hidden on desktop — FootnoteSidenote handles the margin display there.
    @media (min-width: 1200px) {
      display: none;
    }

    // Shown on desktop when the matching sidenote is overflow-displaced.
    &.is-desktop-visible {
      @media (min-width: 1200px) {
        display: block;
      }
    }
  }

  .footnote-in-note.is-leaving {
    animation: in-note-leave 160ms var(--snappy-ease-in) both;
  }

  @keyframes in-note-enter {
    from {
      opacity: 0;
      transform: translateY(-12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes in-note-leave {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  .in-note-label {
    display: block;
    margin-bottom: var(--space-2);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    user-select: none;
  }

  .in-note-content {
    font-size: var(--type-base);
    line-height: 1.55;
    color: var(--color-ink);
  }

  .in-note-content :deep(p) {
    margin: 0 0 var(--space-2);
  }

  .in-note-content :deep(p:last-child) {
    margin-bottom: 0;
  }

  .in-note-content :deep(figure) {
    max-width: 100%;
    margin: var(--space-2) 0 0;
  }

  .in-note-content :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin-block: var(--space-2);
    cursor: zoom-in;
  }

  .in-note-content :deep(figcaption),
  .in-note-content :deep(.wp-element-caption) {
    display: block;
    margin-top: var(--space-2);
    color: var(--color-ink-80);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: italic;
    line-height: 1.55;
    letter-spacing: 0.02em;
  }

  .in-note-content :deep(a) {
    @include rich-link;
  }

  .in-note-content :deep(a:hover),
  .in-note-content :deep(a:focus-visible) {
    @include rich-link-hover;
  }

  @media (prefers-reduced-motion: reduce) {
    .footnote-in-note,
    .footnote-in-note.is-leaving {
      animation: none;
    }
  }
</style>
