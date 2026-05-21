<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  defineProps<{
    posts: WordPressPost[];
  }>();
</script>

<template>
  <ul class="post-list">
    <li v-for="post in posts" :key="post.id">
      <PostCard :post="post" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  .post-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (min-width: 86rem) {
    .post-list {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  .post-list > li {
    min-width: 0;
    max-width: none;
  }

  // Riso multi-color: each card adopts a different spot ink for its accents.
  .post-list > li:nth-child(5n + 1) {
    --accent: var(--pop-pink);
  }

  .post-list > li:nth-child(5n + 2) {
    --accent: var(--pop-cobalt);
  }

  .post-list > li:nth-child(5n + 3) {
    --accent: var(--pop-violet);
  }

  .post-list > li:nth-child(5n + 4) {
    --accent: var(--pop-flame);
  }

  .post-list > li:nth-child(5n + 5) {
    --accent: var(--pop-cyan);
  }
</style>
