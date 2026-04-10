<script setup lang="ts">
interface CardItem {
  id: string
  slug: string
  title: string
  excerpt: string
  date?: string
}

withDefaults(defineProps<{
  title: string
  items?: CardItem[] | null
  linkBase: string
  showDate?: boolean
  error?: boolean
  errorMessage: string
  emptyMessage: string
}>(), {
  items: null,
  showDate: true,
  error: false,
})
</script>

<template>
  <section class="home-content-section">
    <SectionHeading :title="title" />

    <EmptyState v-if="error" :message="errorMessage" />

    <PostCardGrid
      v-else-if="items?.length"
      :items="items"
      :link-base="linkBase"
      :show-date="showDate"
    />

    <EmptyState v-else :message="emptyMessage" />
  </section>
</template>

<style lang="scss" scoped>
.home-content-section {
  padding: $space-7 0;
}
</style>
