<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { usePostFootnotes } from '~/composables/usePostFootnotes';
  import { CODE_THEME_SURFACES } from '~/utils/syntax-highlighting';

  const props = defineProps<{
    blocks: GutenbergBlock[];
    parentClientId?: string | null;
  }>();

  // Provide the footnote map for all descendant ParagraphBlock instances.
  // The composable guards against nested BlockRenderers overriding this with
  // an empty map (compositional blocks like Group render inner BlockRenderers).
  usePostFootnotes(toRef(props, 'blocks'));

  const { themeName } = useCodeTheme();
  const inlineCodeStyle = computed(() => {
    const surface = CODE_THEME_SURFACES[themeName.value];

    return {
      '--inline-code-bg': surface.background,
      '--inline-code-color': surface.foreground,
      '--inline-code-glow': surface.glow,
      '--inline-code-scanline': surface.scanline,
    };
  });
</script>

<template>
  <div class="content-flow" :style="inlineCodeStyle">
    <BlockChildren :blocks="blocks" :parent-client-id="parentClientId" />
  </div>
</template>
