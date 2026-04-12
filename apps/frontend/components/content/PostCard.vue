<script setup lang="ts">
import type { WordPressPost } from '~/types/wordpress'

defineProps<{
  post: WordPressPost
}>()
</script>

<template>
  <article class="post-card">
    <NuxtLink :to="`/writing/${post.slug}`" class="post-card__link">
      <CardMedia
        :media="post.featuredMedia"
        label="Post"
        :transition-key="`post:${post.slug}`"
      />

      <div class="post-card__body">
        <p class="post-card__meta">{{ post.date }}</p>
        <h3>{{ post.title }}</h3>
        <p class="post-card__excerpt">{{ post.excerpt }}</p>
      </div>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
.post-card {
  border: 1px solid $color-card-border;
  background: $color-card-surface;
  box-shadow: $shadow-soft;
  transition:
    transform 240ms $motion-snappy,
    box-shadow 240ms $motion-snappy,
    border-color 240ms $motion-snappy;
}

.post-card:hover {
  border-color: rgba(38, 87, 235, 0.24);
  box-shadow: $shadow-card;
  transform: translateY(-2px);
}

.post-card__link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.post-card__body {
  padding: $space-5;
}

.post-card__meta {
  color: $color-muted;
  font-size: $type-step-1;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.post-card h3 {
  margin-top: $space-3;
}

.post-card__excerpt {
  margin-top: $space-3;
  color: $color-ink-80;
}
</style>
