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
  <HomeTopRegion>
    <HomeHero
      :mega-text="homePageContent?.megaText ?? 'B.L.U.F.'"
      :title="homePageContent?.title ?? 'Title Text'"
      :subtitle="homePageContent?.subtitle ?? 'Subtitle text'"
    />
  </HomeTopRegion>

  <SiteNav variant="home" />

  <HomeVitalInfo
    :tagline="homePageContent?.aboutTagline ?? 'This is the website of Aslan French, design technologist and researcher.'"
    :quick-links="homePageContent?.quickLinks ?? []"
  />

  <HomeContentSection
    title="Case studies"
    :items="caseStudies"
    link-base="/case-studies"
    :show-date="false"
    :error="Boolean(caseStudiesError)"
    error-message="Case studies are not reachable yet. Once the CMS query path is ready, this section will fill in."
    empty-message="No case studies yet. The archive structure is ready for them."
  />

  <HomeContentSection
    title="Latest writing"
    :items="posts"
    link-base="/writing"
    :error="Boolean(error)"
    error-message="WordPress is not reachable yet. Once the CMS stack is running, this page will render fetched content."
    empty-message="No posts yet. The frontend query path is ready for them."
  />
</template>
