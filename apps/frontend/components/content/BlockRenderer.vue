<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { usePostFootnotes } from '~/composables/usePostFootnotes';

  const props = defineProps<{
    blocks: GutenbergBlock[];
    parentClientId?: string | null;
  }>();

  // Provide the footnote map for all descendant ParagraphBlock instances.
  // The composable guards against nested BlockRenderers overriding this with
  // an empty map (compositional blocks like Group render inner BlockRenderers).
  usePostFootnotes(toRef(props, 'blocks'));
</script>

<template>
  <div class="content-flow">
    <BlockChildren :blocks="blocks" :parent-client-id="parentClientId" />
  </div>
</template>
