<script setup lang="ts">
import type { WordPressCaseStudy, WordPressPost } from '~/types/wordpress'

withDefaults(defineProps<{
  title: string
  kind: 'case-studies' | 'writing'
  items?: WordPressCaseStudy[] | WordPressPost[] | null
  error?: boolean
  errorMessage: string
  emptyMessage: string
}>(), {
  items: null,
  error: false,
})
</script>

<template>
  <section class="home-content-section">
    <SectionHeading :title="title" />

    <EmptyState v-if="error" :message="errorMessage" />

    <CaseStudyGrid
      v-else-if="kind === 'case-studies' && items?.length"
      :case-studies="items as WordPressCaseStudy[]"
    />

    <PostGrid
      v-else-if="items?.length"
      :posts="items as WordPressPost[]"
    />

    <EmptyState v-else :message="emptyMessage" />
  </section>
</template>

<style lang="scss" scoped>
.home-content-section {
  padding: $space-7 0;
}
</style>
