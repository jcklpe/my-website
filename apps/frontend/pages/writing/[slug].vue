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

const postMeta = computed(() =>
  [post.value?.date, post.value?.authorName].filter(Boolean).join(' / '),
)
</script>

<template>
  <div class="route-transition-boundary">
    <article v-if="post" class="post-page">
      <section class="post-page__hero">
        <figure
          v-if="post.featuredMedia?.sourceUrl"
          class="post-page__hero-media"
          :data-shared-media-key="`post:${post.slug}`"
        >
          <img
            :src="post.featuredMedia.sourceUrl"
            :alt="post.featuredMedia.altText || ''"
          >
        </figure>

        <header class="post-page__header">
          <p v-if="postMeta" class="post-page__meta">{{ postMeta }}</p>
          <h1>{{ post.title }}</h1>
          <p v-if="post.excerpt" class="post-page__excerpt">
            {{ post.excerpt }}
          </p>
        </header>
      </section>

      <BlockRenderer class="post-page__content" :blocks="post.blocks" />
    </article>

    <section v-else class="post-page-state" aria-live="polite">
      <p class="post-page-state__meta">
        {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
      </p>
      <h1>
        {{ isLoading ? 'Loading post...' : error ? 'Unable to load post.' : 'Post not found.' }}
      </h1>
      <p class="post-page-state__excerpt">
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
.post-page {
  width: 100%;
  max-width: none;
  min-height: 55vh;
  padding: 0 0 var(--space-9);
  color: var(--color-ink);
  background: var(--color-paper-warm);
}

.post-page__hero {
  position: relative;
  display: grid;
  align-items: end;
  min-height: min(72vh, 44rem);
  margin-bottom: calc(var(--space-8) + var(--space-7));
  isolation: isolate;
  background:
    linear-gradient(135deg, rgba(38, 87, 235, 0.95), rgba(7, 11, 31, 0.98)),
    var(--color-primary);
}

.post-page__hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(7, 11, 31, 0.08), rgba(7, 11, 31, 0.64));
  pointer-events: none;
}

.post-page__header {
  position: relative;
  z-index: 2;
  width: min(72rem, calc(100% - var(--space-6)));
  margin-bottom: calc(var(--space-7) * -1);
  margin-inline: auto;
  padding: var(--space-6);
  background: var(--color-paper-warm);
}

.post-page__meta {
  margin-bottom: var(--space-3);
  color: var(--color-muted);
  font-size: var(--type-step--1);
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-page__excerpt {
  max-width: 42rem;
  margin-top: var(--space-4);
  color: var(--color-ink-80);
  font-size: 1.125rem;
}

.post-page__hero-media {
  position: absolute;
  inset: 0;
  margin: 0;
  overflow: hidden;
}

.post-page__hero-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-page__content {
  width: 100%;
}

.post-page-state {
  max-width: 44rem;
  min-height: 55vh;
  padding: var(--space-8) 0 var(--space-9);
  color: var(--color-ink);
  background: var(--color-paper-warm);
}

.post-page-state__meta {
  color: var(--color-muted);
}
</style>
