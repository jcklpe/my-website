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
  border: 1px solid rgba(12, 17, 43, 0.16);
  background:
    linear-gradient(90deg, rgba(38, 87, 235, 0.1) 0 0.35rem, transparent 0.35rem),
    var(--color-card-surface);
  box-shadow: var(--shadow-soft);
  transition:
    transform 240ms var(--motion-snappy),
    box-shadow 240ms var(--motion-snappy),
    border-color 240ms var(--motion-snappy);
}

.post-card:hover {
  border-color: rgba(38, 87, 235, 0.34);
  box-shadow: var(--shadow-card);
  transform: translateY(-3px);
}

.post-card__link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.post-card__body {
  padding: var(--space-5);
}

.post-card__meta {
  color: var(--color-primary-heavy);
  font-size: var(--type-step-1);
  font-family: var(--font-sans);
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-card h3 {
  margin-top: var(--space-3);
}

.post-card__excerpt {
  margin-top: var(--space-3);
  color: var(--color-ink-80);
}
</style>
