<script setup lang="ts">
  useSeoMeta({
    title: 'Case Studies',
    description: 'Evergreen work, project documentation, and research.',
  });

  const { data: caseStudies } = await useAsyncData('case-studies-archive', () =>
    queryWordPressCaseStudies(),
  );
</script>

<template>
  <section class="archive">
    <SectionHeading
      title="Case Studies"
      description="Evergreen work, research, and project documentation."
    />
    <CaseStudyList v-if="caseStudies?.length" :case-studies="caseStudies" />
    <EmptyState v-else message="No case studies yet." />
  </section>
</template>

<style lang="scss" scoped>
  .archive {
    padding: var(--space-8) 0;
  }
</style>
