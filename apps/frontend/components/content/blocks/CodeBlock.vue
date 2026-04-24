<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractClassNames,
    extractRootElement,
    extractTagText,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';
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
  const highlightedPre = computed(() =>
    extractRootElement(highlightedCode.value, 'pre'),
  );
  const highlightedClass = computed(() =>
    extractAttribute(highlightedPre.value?.attributes, 'class'),
  );
  const root = computed(
    () =>
      extractRootElement(props.block.renderedHtml, 'figure') ??
      extractRootElement(props.block.renderedHtml, 'pre'),
  );
  const rootClass = computed(() =>
    removeWordPressFrontendClasses(extractAttribute(root.value?.attributes, 'class')),
  );
</script>

<template>
  <figure class="code-block" :class="rootClass" :data-language="language">
    <figcaption v-if="hasLanguage" class="code-language">
      {{ language }}
    </figcaption>
    <pre
      v-if="highlightedPre"
      :class="highlightedClass"
      v-html="highlightedPre.innerHtml"
    />
  </figure>
</template>

<style lang="scss" scoped>
  .code-block.alignwide {
    width: min(calc(100vw - var(--space-6)), 75vw, var(--article-wide));
    max-width: none;
    margin-inline: auto;
  }

  .code-block.alignfull {
    width: 100vw;
    max-width: none;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
  }
</style>
