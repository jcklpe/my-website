<script setup lang="ts">
  import type { CSSProperties } from 'vue';
  import type { WordPressPost } from '~/types/wordpress';

  type BentoCardLayout = 'feature' | 'tile' | 'compact';

  interface BentoPlacement {
    slot: number;
    layout: BentoCardLayout;
    mediaSizes: string;
  }

  const props = defineProps<{
    posts: WordPressPost[];
  }>();
  const listElement = ref<HTMLElement | null>(null);
  const itemOffsets = ref<
    Record<number, { x: number; y: number; scale: number }>
  >({});
  const { bentoPointerStrength, enableBentoPointerField } =
    useHomeMotionDebug();
  const transitionState = useFeaturedMediaTransitionState();
  let pointerX = 0;
  let pointerY = 0;
  let motionFrame = 0;
  let hasPointerPosition = false;
  let reducedMotionQuery: MediaQueryList | null = null;

  const BENTO_POST_COUNT = 10;
  const BENTO_PLACEMENTS: BentoPlacement[] = [
    {
      slot: 1,
      layout: 'feature',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 34vw',
    },
    {
      slot: 2,
      layout: 'tile',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 42vw',
    },
    {
      slot: 3,
      layout: 'tile',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 24vw',
    },
    {
      slot: 4,
      layout: 'tile',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 26vw',
    },
    {
      slot: 5,
      layout: 'tile',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 17vw',
    },
    {
      slot: 6,
      layout: 'tile',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 24vw',
    },
    {
      slot: 7,
      layout: 'compact',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 34vw',
    },
    {
      slot: 8,
      layout: 'compact',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 25vw',
    },
    {
      slot: 9,
      layout: 'compact',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 25vw',
    },
    {
      slot: 10,
      layout: 'compact',
      mediaSizes: '(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 25vw',
    },
  ];

  const bentoPosts = computed(() =>
    props.posts.slice(0, BENTO_POST_COUNT).map((post, index) => ({
      post,
      placement: BENTO_PLACEMENTS[index] ?? BENTO_PLACEMENTS[1],
    })),
  );

  function clearOffsets() {
    itemOffsets.value = {};
  }

  function updateOffsets() {
    motionFrame = 0;
    if (
      !enableBentoPointerField.value ||
      !hasPointerPosition ||
      transitionState.value.active ||
      reducedMotionQuery?.matches
    ) {
      clearOffsets();
      return;
    }

    const items = listElement.value?.querySelectorAll<HTMLElement>('.item');
    if (!items) return;

    const nextOffsets: Record<number, { x: number; y: number; scale: number }> =
      {};
    items.forEach((item, index) => {
      const bounds = item.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = centerX - pointerX;
      const deltaY = centerY - pointerY;
      const radius = Math.max(180, Math.hypot(bounds.width, bounds.height));
      const distanceSquared =
        (deltaX * deltaX + deltaY * deltaY) / (radius * radius);
      const influence = Math.exp(-distanceSquared * 1.8);
      const strength = bentoPointerStrength.value;

      nextOffsets[index] = {
        x: (deltaX / radius) * influence * 3 * strength,
        y: (deltaY / radius) * influence * 2 * strength,
        scale: 1 + influence * 0.0025 * strength,
      };
    });
    itemOffsets.value = nextOffsets;
  }

  function requestUpdate() {
    if (!motionFrame) motionFrame = window.requestAnimationFrame(updateOffsets);
  }

  function trackPointer(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    hasPointerPosition = true;
    requestUpdate();
  }

  function clearPointer() {
    hasPointerPosition = false;
    clearOffsets();
  }

  function itemStyle(index: number): CSSProperties | undefined {
    const offset = itemOffsets.value[index];
    if (!offset) return;
    return {
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${offset.scale})`,
    };
  }

  onMounted(() => {
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('pointermove', trackPointer, { passive: true });
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    document.addEventListener('mouseleave', clearPointer);
  });

  watch(
    [enableBentoPointerField, bentoPointerStrength, transitionState],
    requestUpdate,
  );

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(motionFrame);
    window.removeEventListener('pointermove', trackPointer);
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', requestUpdate);
    document.removeEventListener('mouseleave', clearPointer);
  });
</script>

<template>
  <ul ref="listElement" class="bento-post-list" aria-label="Latest writing">
    <li
      v-for="{ post, placement } in bentoPosts"
      :key="post.id"
      class="item"
      :class="`is-slot-${placement.slot}`"
    >
      <div class="item-depth" :style="itemStyle(placement.slot - 1)">
        <PostCard
          :post="post"
          :layout="placement.layout"
          :media-sizes="placement.mediaSizes"
          :show-excerpt="false"
        />
      </div>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  .bento-post-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .item {
    display: flex;
    min-width: 0;
    min-height: 0;
  }

  .item-depth,
  .item :deep(.post-card) {
    width: 100%;
  }

  .item-depth {
    display: flex;
    min-width: 0;
    min-height: 0;
    will-change: transform;
  }

  @media (prefers-reduced-motion: reduce) {
    .item-depth {
      transform: none !important;
    }
  }

  @include breakpoint(tablet) {
    .bento-post-list {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      grid-template-rows: repeat(10, 4.6rem);
      align-items: stretch;
    }

    .is-slot-1 {
      grid-column: 1 / span 4;
      grid-row: 1 / span 3;
    }

    .is-slot-2 {
      grid-column: 5 / span 2;
      grid-row: 1 / span 2;
    }

    .is-slot-3 {
      grid-column: 5 / span 2;
      grid-row: 3 / span 2;
    }

    .is-slot-4 {
      grid-column: 1 / span 2;
      grid-row: 4 / span 3;
    }

    .is-slot-5 {
      grid-column: 3 / span 2;
      grid-row: 4 / span 3;
    }

    .is-slot-6 {
      grid-column: 5 / span 2;
      grid-row: 5 / span 3;
    }

    .is-slot-7 {
      grid-column: 5 / span 2;
      grid-row: 8 / span 3;
    }

    .is-slot-8 {
      grid-column: 1 / span 2;
      grid-row: 7 / span 2;
    }

    .is-slot-9 {
      grid-column: 3 / span 2;
      grid-row: 7 / span 2;
    }

    .is-slot-10 {
      grid-column: 1 / span 4;
      grid-row: 9 / span 2;
    }
  }

  @include breakpoint(desktop) {
    .bento-post-list {
      grid-template-columns: repeat(12, minmax(0, 1fr));
      grid-template-rows: repeat(8, 4.8rem);
    }

    .is-slot-1 {
      grid-column: 1 / span 4;
      grid-row: 1 / span 4;
    }

    .is-slot-2 {
      grid-column: 5 / span 5;
      grid-row: 1 / span 3;
    }

    .is-slot-3 {
      grid-column: 10 / span 3;
      grid-row: 1 / span 4;
    }

    .is-slot-4 {
      grid-column: 5 / span 3;
      grid-row: 4 / span 3;
    }

    .is-slot-5 {
      grid-column: 8 / span 2;
      grid-row: 4 / span 3;
    }

    .is-slot-6 {
      grid-column: 10 / span 3;
      grid-row: 5 / span 4;
    }

    .is-slot-7 {
      grid-column: 1 / span 4;
      grid-row: 5 / span 2;
    }

    .is-slot-8 {
      grid-column: 1 / span 3;
      grid-row: 7 / span 2;
    }

    .is-slot-9 {
      grid-column: 4 / span 3;
      grid-row: 7 / span 2;
    }

    .is-slot-10 {
      grid-column: 7 / span 3;
      grid-row: 7 / span 2;
    }
  }

  @media (min-width: 1200px) {
    .bento-post-list {
      grid-template-rows: repeat(8, 5.15rem);
    }
  }

  @media (min-width: 1600px) {
    .bento-post-list {
      grid-template-rows: repeat(8, 5.8rem);
    }
  }
</style>
