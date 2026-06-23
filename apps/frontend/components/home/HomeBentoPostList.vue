<script setup lang="ts">
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
</script>

<template>
  <ul class="bento-post-list" aria-label="Latest writing">
    <li
      v-for="{ post, placement } in bentoPosts"
      :key="post.id"
      class="item"
      :class="`is-slot-${placement.slot}`"
    >
      <PostCard
        :post="post"
        :layout="placement.layout"
        :media-sizes="placement.mediaSizes"
        :show-excerpt="false"
      />
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

  .item :deep(.post-card) {
    width: 100%;
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
