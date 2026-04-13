<script setup lang="ts">
import type { WordPressPost } from '~/types/wordpress'

defineProps<{
  posts: WordPressPost[]
}>()
</script>

<template>
  <ul class="post-grid">
    <li v-for="post in posts" :key="post.id">
      <PostCard :post="post" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--space-4);
  padding: 0;
  list-style: none;
}

.post-grid > li {
  min-width: 0;
}
</style>
