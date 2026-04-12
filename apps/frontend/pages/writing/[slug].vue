<script setup lang="ts">
const route = useRoute()

const { data: post, error } = await useAsyncData(`post:${route.params.slug}`, () =>
  queryWordPressPostBySlug(String(route.params.slug)),
)

if (!post.value) {
  throw createError({
    statusCode: error.value ? 502 : 404,
    statusMessage: error.value
      ? 'Unable to load content from WordPress'
      : 'Post not found',
  })
}

useSeoMeta({
  title: post.value.title,
  description: post.value.excerpt,
})
</script>

<template>
  <article class="post-shell">
    <header class="post-header">
      <p class="post-date">{{ post?.date }}</p>
      <h1>{{ post?.title }}</h1>
      <p class="post-excerpt">{{ post?.excerpt }}</p>
    </header>

    <figure
      v-if="post?.featuredMedia?.sourceUrl"
      class="post-hero-media"
      :data-shared-media-key="`post:${post.slug}`"
    >
      <img
        :src="post.featuredMedia.sourceUrl"
        :alt="post.featuredMedia.altText || ''"
      >
    </figure>

    <BlockRenderer v-if="post" :blocks="post.blocks" />
  </article>
</template>

<style lang="scss" scoped>
.post-shell {
  max-width: 54rem;
  min-height: 55vh;
  padding: $space-8 0 $space-9;
  color: $color-ink;
}

.post-header {
  margin-bottom: $space-7;
}

.post-date {
  color: $color-muted;
}

.post-excerpt {
  max-width: 42rem;
  font-size: 1.125rem;
}

.post-hero-media {
  margin: 0 0 $space-7;
}

.post-hero-media img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
</style>
