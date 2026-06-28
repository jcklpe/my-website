<script setup lang="ts">
  const props = defineProps<{
    number: number;
    contentHtml: string;
  }>();

  const emit = defineEmits<{
    close: [];
  }>();

  const rootEl = ref<HTMLElement | null>(null);

  onMounted(() => {
    nextTick(() => rootEl.value?.focus());
    document.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') emit('close');
  }
</script>

<template>
  <Teleport to="body">
    <div class="fn-sheet-scrim" aria-hidden="true" @click="emit('close')" />
    <div
      ref="rootEl"
      class="fn-bottom-sheet"
      role="dialog"
      :aria-label="`Footnote ${number}`"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="fn-sheet-handle" aria-hidden="true" />
      <div class="fn-sheet-header">
        <span class="fn-sheet-label">Note {{ number }}</span>
        <button
          class="fn-sheet-close"
          type="button"
          :aria-label="`Close footnote ${number}`"
          @click="emit('close')"
        >
          ×
        </button>
      </div>
      <div class="fn-sheet-content" v-html="contentHtml" />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
  .fn-sheet-scrim {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.35);
    z-index: calc(var(--z-highest) + 1); // above nav (--z-highest = 1000)
    animation: scrim-in 200ms var(--snappy-ease-out) both;

    @media (min-width: 1200px) {
      display: none;
    }
  }

  @keyframes scrim-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .fn-bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 70dvh;
    overflow-y: auto;
    background: var(--color-surface);
    border-radius: 1rem 1rem 0 0;
    padding: 0 var(--space-4) var(--space-5);
    z-index: calc(var(--z-highest) + 2); // above scrim
    outline: none;
    animation: sheet-in 260ms var(--snappy-ease-out) both;

    @media (min-width: 1200px) {
      display: none;
    }
  }

  @keyframes sheet-in {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  .fn-sheet-handle {
    width: 2.5rem;
    height: 4px;
    background: var(--color-ink-08);
    border-radius: 2px;
    margin: var(--space-2) auto var(--space-3);
  }

  .fn-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-ink-08);
  }

  .fn-sheet-label {
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .fn-sheet-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-ink-30);
    font-size: 1.3rem;
    line-height: 1;
    cursor: pointer;
    transition: color 120ms;

    &:hover {
      color: var(--color-primary);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }

  .fn-sheet-content {
    font-size: var(--type-base);
    line-height: 1.55;
    color: var(--color-ink);
  }

  .fn-sheet-content :deep(p) {
    margin: 0 0 var(--space-2);
  }

  .fn-sheet-content :deep(p:last-child) {
    margin-bottom: 0;
  }

  .fn-sheet-content :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin-block: var(--space-2);
  }

  .fn-sheet-content :deep(a) {
    @include rich-link;
  }

  .fn-sheet-content :deep(a:hover),
  .fn-sheet-content :deep(a:focus-visible) {
    @include rich-link-hover;
  }

  @media (prefers-reduced-motion: reduce) {
    .fn-sheet-scrim,
    .fn-bottom-sheet {
      animation: none;
    }

    .fn-sheet-close {
      transition: none;
    }
  }
</style>
