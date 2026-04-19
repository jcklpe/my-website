<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractClassNames, extractTagText } from '~/utils/block-html';
  import {
    hasSyntaxLanguage,
    highlightCode,
    normalizeCodeLanguage,
  } from '~/utils/syntax-highlighting';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const codeText = computed(() => extractTagText(props.block.renderedHtml, 'code'));
  const language = computed(() => {
    const classLanguage = extractClassNames(props.block.renderedHtml).find(
      (className) =>
        className.startsWith('language-') || className.startsWith('lang-'),
    );

    return normalizeCodeLanguage(
      String(props.block.attributes?.language ?? classLanguage ?? 'text'),
    );
  });
  const hasLanguage = computed(() => hasSyntaxLanguage(language.value));
  const { data: highlightedCode } = await useAsyncData(
    () => `code-block:${props.block.clientId}:${language.value}`,
    () => highlightCode(codeText.value, language.value),
    {
      watch: [codeText, language],
    },
  );
</script>

<template>
  <figure class="wp-block-code code-block" :data-language="language">
    <figcaption v-if="hasLanguage" class="code-language">
      {{ language }}
    </figcaption>
    <div class="code-screen" v-html="highlightedCode" />
  </figure>
</template>
