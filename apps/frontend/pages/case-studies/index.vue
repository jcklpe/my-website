<script setup lang="ts">
useSeoMeta({
  title: 'Case Studies',
  description: 'Evergreen work, project documentation, and research.',
})

const { data: caseStudies } = await useAsyncData('case-studies-archive', () =>
  queryWordPressCaseStudies(),
)
</script>

<template>
  <section class="archive">
    <SectionHeading
      title="Case Studies"
      description="Evergreen work, research, and project documentation."
    />
    <PostCardGrid
      v-if="caseStudies?.length"
      :items="caseStudies"
      link-base="/case-studies"
      :show-date="false"
    />
    <EmptyState v-else message="No case studies yet." />
  </section>
</template>

<style lang="scss" scoped>
.archive {
  padding: $space-8 0;
}
</style>
