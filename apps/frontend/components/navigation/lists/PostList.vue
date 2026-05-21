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
    gap: var(--space-5);
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
    --card-accent: var(--color-pop-coral);
  }

  .post-list > li:nth-child(2n) {
    --card-accent: var(--color-pop-aqua);
  }

  .post-list > li:nth-child(3n) {
    --card-accent: var(--color-pop-yellow);
  }

  .post-list > li:nth-child(4n) {
    --card-accent: var(--color-pop-pink);
  }
</style>
