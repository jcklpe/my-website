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
</style>
