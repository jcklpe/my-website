<script setup lang="ts">
interface CardItem {
  id: string
  slug: string
  title: string
  excerpt: string
  date?: string
}

withDefaults(defineProps<{
  items: CardItem[]
  linkBase: string
  showDate?: boolean
}>(), {
  showDate: true,
})
</script>

<template>
  <ul class="post-card-grid">
    <li v-for="item in items" :key="item.id">
      <PostCard :item="item" :link-base="linkBase" :show-date="showDate" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.post-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: $space-4;
  padding: 0;
  list-style: none;
}

.post-card-grid > li {
  min-width: 0;
}
</style>
