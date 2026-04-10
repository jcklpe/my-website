<script setup lang="ts">
useSeoMeta({
  title: 'Home',
  description: 'Nuxt SSR frontend for a headless WordPress website.',
});

const { data: posts, error } = await useAsyncData('homepage-posts', () =>
  queryWordPressPosts(),
);

const { data: caseStudies, error: caseStudiesError } = await useAsyncData('homepage-case-studies', () =>
  queryWordPressCaseStudies(),
);

const { data: homePageContent } = await useAsyncData('homepage-content', () =>
  queryHomePageContent(),
);
</script>

<template>
  <div class="home-page">
    <HomeHero
      :mega-text="homePageContent?.megaText ?? 'B.L.U.F.'"
      :title="homePageContent?.title ?? 'Title Text'"
      :subtitle="homePageContent?.subtitle ?? 'Subtitle text'"
    />

    <section class="home-page__menu">
      <PrimaryNav centered />
    </section>

    <HomeVitalInfo
      :tagline="homePageContent?.aboutTagline ?? 'This is the website of Aslan French, design technologist and researcher.'"
      :quick-links="homePageContent?.quickLinks ?? []"
    />

    <section class="home-page__listing">
      <SectionHeading title="Case studies" />

      <EmptyState
        v-if="caseStudiesError"
        message="Case studies are not reachable yet. Once the CMS query path is ready, this section will fill in."
      />

      <PostCardGrid
        v-else-if="caseStudies?.length"
        :items="caseStudies"
        link-base="/case-studies"
        :show-date="false"
      />

      <EmptyState
        v-else
        message="No case studies yet. The archive structure is ready for them."
      />
    </section>

    <section class="home-page__listing">
      <SectionHeading title="Latest writing" />

      <EmptyState
        v-if="error"
        message="WordPress is not reachable yet. Once the CMS stack is running, this page will render fetched content."
      />

      <PostCardGrid v-else-if="posts?.length" :items="posts" link-base="/writing" />

      <EmptyState
        v-else
        message="No posts yet. The frontend query path is ready for them."
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-page__menu {
  padding: $space-3 0 $space-5;
  margin-inline: calc($space-6 * -1);
  padding-inline: $space-6;
  background: linear-gradient(145deg, #1f38c5 0%, #2657eb 58%, #4d72ef 100%);
}

.home-page__listing {
  padding: $space-7 0;
}

@media (max-width: 720px) {
  .home-page__menu {
    margin-inline: calc($space-4 * -1);
    padding-inline: $space-4;
  }
}
</style>
