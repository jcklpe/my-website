<script setup lang="ts">
interface CardItem {
  id: string
  slug: string
  title: string
  excerpt: string
  date?: string
}

withDefaults(defineProps<{
  item: CardItem
  linkBase: string
  showDate?: boolean
}>(), {
  showDate: true,
})
</script>

<template>
  <article class="post-card">
    <NuxtLink :to="`${linkBase}/${item.slug}`" class="post-card__link">
      <p v-if="showDate && item.date" class="post-card__meta">{{ item.date }}</p>
      <h3>{{ item.title }}</h3>
      <p class="post-card__excerpt">{{ item.excerpt }}</p>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
.post-card {
  border: 1px solid $color-card-border;
  border-radius: 0;
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
  padding: $space-5;
  color: inherit;
  text-decoration: none;
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
