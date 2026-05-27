<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  defineProps<{
    posts: WordPressPost[];
  }>();
</script>

<template>
  <ul class="post-list">
    <li v-for="(post, index) in posts" :key="post.id" class="post-item">
      <PostCard :post="post" :flip="index % 2 !== 0" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  // Vertical stack — each PostCard manages its own height and stacking.
  .post-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .post-item {
    display: block;
  }
</style>
