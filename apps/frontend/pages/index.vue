<script setup lang="ts">
useSeoMeta({
  title: 'Home',
  description: 'Nuxt SSR frontend for a headless WordPress portfolio.',
});

const { data: posts, error } = await useAsyncData('homepage-posts', () =>
  queryWordPressPosts(),
);

const { data: homePageContent } = await useAsyncData('homepage-content', () =>
  queryHomePageContent(),
);
</script>

<template>
  <div class="home-page">
    <HomeHero
      :title="homePageContent?.title ?? 'Title Text'"
      :subtitle="homePageContent?.subtitle ?? 'Subtitle text'"
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
