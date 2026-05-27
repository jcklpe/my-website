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
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .post-list > li {
    flex: 1 1 250px;
    min-width: 250px;
    max-width: none;
  }
</style>
