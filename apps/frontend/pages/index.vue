<script setup lang="ts">
useSeoMeta({
  title: 'Home',
  description: 'Nuxt SSR frontend for a headless WordPress portfolio.',
})

const { data: posts, error } = await useAsyncData('homepage-posts', () =>
  queryWordPressPosts(),
)

const { data: homePageContent } = await useAsyncData('homepage-content', () =>
  queryHomePageContent(),
)
</script>

<template>
  <div class="home-page">
    <HomeHero
      :eyebrow="homePageContent?.eyebrow ?? 'My Website'"
      :title="homePageContent?.title ?? 'Portfolio foundation, ready for your design work.'"
      :intro="homePageContent?.intro ?? 'The frontend is SSR-first, block-aware, and set up so styling can stay in your hands while content modeling and data plumbing stay predictable.'"
    />

    <section class="home-page__listing">
      <SectionHeading
        title="Latest writing"
        description="Sample content will appear here once WordPress is bootstrapped."
      />

      <EmptyState
        v-if="error"
        message="WordPress is not reachable yet. Once the CMS stack is running, this page will render fetched content."
      />

      <PostCardGrid v-else-if="posts?.length" :posts="posts" />

      <EmptyState
        v-else
        message="No posts yet. The frontend query path is ready for them."
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-page__listing {
  padding-bottom: $space-8;
}
</style>
