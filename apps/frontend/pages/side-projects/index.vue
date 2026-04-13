<script setup lang="ts">
useSeoMeta({
  title: 'Side Projects',
  description: 'Experiments, prototypes, and smaller builds.',
})
</script>

<template>
  <section class="archive">
    <SectionHeading
      title="Side Projects"
      description="Experiments, prototypes, and smaller builds."
    />
    <EmptyState message="This section is on deck. The route is in place so the nav structure can settle in now." />
  </section>
</template>

<style lang="scss" scoped>
.archive {
  padding: var(--space-8) 0;
}
</style>
