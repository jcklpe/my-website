<script setup lang="ts">
  interface GroundLine {
    key: string;
    style: Record<string, string>;
  }

  interface LineBox {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }

  const props = withDefaults(
    defineProps<{
      groundColor?: string;
      padBlockEm?: number;
      padInlineEm?: number;
      text: string;
    }>(),
    {
      groundColor: 'var(--color-surface-warmer)',
      padBlockEm: 0.3,
      padInlineEm: 0.52,
    },
  );

  const rootElement = ref<HTMLElement | null>(null);
  const textElement = ref<HTMLElement | null>(null);
  const isPhoneViewport = ref(false);
  const groundLines = ref<GroundLine[]>([]);
  const rootStyle = computed(() => ({
    '--stepped-title-ground-color': props.groundColor,
  }));

  let animationFrame = 0;
  let phoneQuery: MediaQueryList | null = null;
  let resizeObserver: ResizeObserver | null = null;

  function mergeLineBoxes(rects: DOMRect[]): LineBox[] {
    const sortedRects = [...rects].sort((a, b) =>
      Math.abs(a.top - b.top) > 1 ? a.top - b.top : a.left - b.left,
    );
    const lines: LineBox[] = [];

    sortedRects.forEach((rect) => {
      const centerY = rect.top + rect.height / 2;
      const matchingLine = lines.find(
        (line) => centerY >= line.top - 1 && centerY <= line.bottom + 1,
      );

      if (!matchingLine) {
        lines.push({
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          top: rect.top,
        });
        return;
      }

      matchingLine.bottom = Math.max(matchingLine.bottom, rect.bottom);
      matchingLine.left = Math.min(matchingLine.left, rect.left);
      matchingLine.right = Math.max(matchingLine.right, rect.right);
      matchingLine.top = Math.min(matchingLine.top, rect.top);
    });

    return lines;
  }

  function measureLines() {
    const root = rootElement.value;
    const text = textElement.value;
    const textNode = text?.firstChild;

    if (!isPhoneViewport.value || !root || !text || !textNode) {
      groundLines.value = [];
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const computedStyle = getComputedStyle(root);
    const fontSize = Number.parseFloat(computedStyle.fontSize) || 16;
    const padInline = props.padInlineEm * fontSize;
    const padBlock = props.padBlockEm * fontSize;
    const range = document.createRange();

    range.selectNodeContents(text);

    const rects = Array.from(range.getClientRects()).filter(
      (rect) => rect.width > 0.5 && rect.height > 0.5,
    );

    range.detach();

    groundLines.value = mergeLineBoxes(rects).map((line, index) => ({
      key: `${index}-${line.left}-${line.top}-${line.right}`,
      style: {
        height: `${line.bottom - line.top + padBlock * 2}px`,
        left: `${line.left - rootRect.left - padInline}px`,
        top: `${line.top - rootRect.top - padBlock}px`,
        width: `${line.right - line.left + padInline * 2}px`,
      },
    }));
  }

  function scheduleMeasure() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    animationFrame = requestAnimationFrame(() => {
      animationFrame = 0;
      measureLines();
    });
  }

  function syncPhoneViewport() {
    isPhoneViewport.value = phoneQuery?.matches ?? false;
    scheduleMeasure();
  }

  watch(
    () => [
      props.groundColor,
      props.padBlockEm,
      props.padInlineEm,
      props.text,
    ],
    scheduleMeasure,
    { flush: 'post' },
  );

  onMounted(() => {
    phoneQuery = window.matchMedia('(max-width: 767px)');
    syncPhoneViewport();

    phoneQuery.addEventListener('change', syncPhoneViewport);

    scheduleMeasure();

    resizeObserver = new ResizeObserver(scheduleMeasure);

    if (rootElement.value) {
      resizeObserver.observe(rootElement.value);
    }

    if ('fonts' in document) {
      void document.fonts.ready.then(scheduleMeasure);
    }
  });

  onBeforeUnmount(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    resizeObserver?.disconnect();
    phoneQuery?.removeEventListener('change', syncPhoneViewport);
  });
</script>

<template>
  <span
    ref="rootElement"
    class="stepped-title-ground"
    :style="rootStyle"
  >
    <span
      v-if="isPhoneViewport"
      class="stepped-title-ground__strips"
      aria-hidden="true"
    >
      <span
        v-for="line in groundLines"
        :key="line.key"
        class="stepped-title-ground__strip"
        :style="line.style"
      />
    </span>
    <span ref="textElement" class="stepped-title-ground__text">
      {{ text }}
    </span>
  </span>
</template>

<style lang="scss" scoped>
  .stepped-title-ground {
    position: relative;
    display: block;
    overflow: visible;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    overflow-wrap: inherit;
    text-wrap: inherit;
    white-space: inherit;
    word-break: inherit;
  }

  .stepped-title-ground__strips {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: none;
    pointer-events: none;
    user-select: none;
  }

  .stepped-title-ground__strip {
    position: absolute;
    display: block;
    background-color: var(--stepped-title-ground-color);
  }

  .stepped-title-ground__text {
    position: relative;
    z-index: 1;
  }

  @include breakpoint(phone) {
    .stepped-title-ground__strips {
      display: block;
    }
  }
</style>
