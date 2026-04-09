<script setup lang="ts">
import type { WordPressPost } from '~/types/wordpress'

defineProps<{
  post: WordPressPost
}>()
</script>

<template>
  <article class="post-card">
    <NuxtLink :to="`/writing/${post.slug}`" class="post-card__link">
      <p class="post-card__meta">{{ post.date }}</p>
      <h3>{{ post.title }}</h3>
      <p class="post-card__excerpt">{{ post.excerpt }}</p>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
.post-card {
  border: 1px solid $color-card-border;
  border-radius: 1.5rem;
  background: $color-card-surface;
  backdrop-filter: blur(12px);
}

.post-card__link {
  display: block;
  padding: $space-5;
  color: inherit;
  text-decoration: none;
}

.post-card__meta {
  color: $color-muted;
  font-size: $type-step-1;
}

.post-card__excerpt {
  margin-top: $space-3;
}
</style>
