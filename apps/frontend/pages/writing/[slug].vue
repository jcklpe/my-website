<script setup lang="ts">
import type { WordPressPost } from '~/types/wordpress'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const {
  data: post,
  error,
  status,
} = await useAsyncData<WordPressPost | null>(
  () => `post:${slug.value}`,
  () => queryWordPressPostBySlug(slug.value),
  {
    dedupe: 'cancel',
    watch: [slug],
  },
)

const isLoading = computed(() => status.value === 'idle' || status.value === 'pending')

function scrollToPageTop() {
  if (import.meta.client) {
    window.scrollTo({ left: 0, top: 0 })
  }
}

onMounted(scrollToPageTop)
watch(slug, () => nextTick(scrollToPageTop))

useSeoMeta({
  title: () => post.value?.title ?? 'Post',
  description: () => post.value?.excerpt ?? '',
})
</script>

<template>
  <div class="route-transition-boundary">
    <article v-if="post" class="post-shell">
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

    <section v-else class="post-shell post-shell--state" aria-live="polite">
      <p class="post-date">
        {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
      </p>
      <h1>
        {{ isLoading ? 'Loading post...' : error ? 'Unable to load post.' : 'Post not found.' }}
      </h1>
      <p class="post-excerpt">
        {{
          isLoading
            ? 'Fetching this post from WordPress.'
            : error
              ? 'The CMS request failed. Try refreshing, or check whether WordPress is running.'
              : `No post exists for "${slug}".`
        }}
      </p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.post-shell {
  max-width: 54rem;
  min-height: 55vh;
  padding: var(--space-8) 0 var(--space-9);
  color: var(--color-ink);
}

.post-header {
  margin-bottom: var(--space-7);
}

.post-shell--state {
  max-width: 44rem;
}

.post-date {
  color: var(--color-muted);
}

.post-excerpt {
  max-width: 42rem;
  font-size: 1.125rem;
}

.post-hero-media {
  margin: 0 0 var(--space-7);
}

.post-hero-media img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
</style>
