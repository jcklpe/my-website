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
    <h1>Writing</h1>
    <ul v-if="posts?.length" class="archive-list">
      <li v-for="post in posts" :key="post.id">
        <NuxtLink :to="`/writing/${post.slug}`">{{ post.title }}</NuxtLink>
      </li>
    </ul>
    <p v-else>No posts yet.</p>
  </section>
</template>

<style lang="scss" scoped>
.archive {
  padding: $space-8 0;
}

.archive-list {
  display: grid;
  gap: $space-3;
  padding: 0;
  list-style: none;
}
</style>
