<script setup lang="ts">
useSeoMeta({
  title: 'Writing',
  description: 'Writing archive powered by WordPress block data.',
})

const { data: posts } = await useAsyncData('writing-archive', () =>
  queryWordPressPosts(),
)
</script>

<template>
  <section class="archive">
    <SectionHeading
      title="Writing"
      description="Date-driven notes, essays, and updates."
    />
    <PostGrid
      v-if="posts?.length"
      :posts="posts"
    />
    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
.archive {
  padding: $space-8 0;
}
</style>
