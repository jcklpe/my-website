<script setup lang="ts">
import type { WordPressPost } from '~/types/wordpress'

const props = defineProps<{
  post: WordPressPost
}>()

const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition()
const transitionState = useFeaturedMediaTransitionState()
const postSlug = computed(() => props.post.slug)
const postUrl = computed(() => `/writing/${postSlug.value}`)
const postDate = computed(() => props.post.date)
const mediaTransitionKey = computed(() =>
  `post-${postSlug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
)
const isTitleTransitioning = computed(() =>
  transitionState.value.active && transitionState.value.key === mediaTransitionKey.value,
)
</script>

<template>
  <article class="post-card" data-transition-source>
    <NuxtLink
      v-slot="{ href }"
      :to="postUrl"
      custom
    >
      <a
        :href="href"
        class="post-card__link"
        @click="navigateWithFeaturedMediaTransition($event, postUrl, mediaTransitionKey, post.featuredMedia)"
      >
        <FeaturedMediaFrame
          :media="post.featuredMedia"
          label="Post"
          :transition-key="mediaTransitionKey"
          transition-role="source"
        />

        <div class="post-card__body">
          <p
            v-if="postDate"
            class="post-card__meta"
            :class="{ 'post-card__meta--transition-hidden': isTitleTransitioning }"
            :data-featured-meta-source="mediaTransitionKey"
          >
            {{ postDate }}
          </p>
          <h3 :data-featured-title-source="mediaTransitionKey">
            <span
              :class="{ 'post-card__title-text--transition-hidden': isTitleTransitioning }"
            >
              {{ post.title }}
            </span>
          </h3>
          <p class="post-card__excerpt">{{ post.excerpt }}</p>
        </div>
      </a>
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
  display: inline-block;
  margin-bottom: var(--space-5);
  padding: 0.35em 0.55em;
  background: black;
  color: white;
  font-size: var(--type-step--1);
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-card__meta--transition-hidden {
  opacity: 0;
}

.post-card h3 {
  color: white;
  font-family: var(--font-serif);
  font-size: clamp(1.6rem, 3vw, 2.65rem);
  line-height: 0.95;
  letter-spacing: -0.045em;
  text-shadow: 0 2px 2px rgba(0, 0, 0, 0.28);
}

.post-card h3 span {
  background-color: black;
  box-shadow:
    1.5em 0 0 black,
    -0.25em 0 0 black;
}

.post-card__title-text--transition-hidden {
  opacity: 0;
}

.post-card__excerpt {
  margin-top: var(--space-3);
  color: var(--color-ink-80);
}
</style>
