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
  import {
    CODE_THEME_BLOCK_STYLES,
    CODE_THEME_OPTIONS,
  } from '~/utils/code-theme';

  const { themeName, setTheme } = useCodeTheme();

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const codeText = computed(() =>
    extractTagText(props.block.renderedHtml, 'code'),
  );
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
  const highlightedStyle = computed(() =>
    extractAttribute(highlightedPre.value?.attributes, 'style'),
  );
  const root = computed(
    () =>
      extractRootElement(props.block.renderedHtml, 'figure') ??
      extractRootElement(props.block.renderedHtml, 'pre'),
  );
  const rootClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(root.value?.attributes, 'class'),
    ),
  );
  const crtStyle = computed(() => CODE_THEME_BLOCK_STYLES[themeName.value]);
  const orderedThemeOptions = computed(() => [
    ...CODE_THEME_OPTIONS.filter((option) => option.name === themeName.value),
    ...CODE_THEME_OPTIONS.filter((option) => option.name !== themeName.value),
  ]);
</script>

<template>
  <figure
    class="code-block"
    :class="rootClass"
    :data-language="language"
    :style="crtStyle"
  >
    <pre
      v-if="highlightedPre"
      :class="highlightedClass"
      :style="highlightedStyle"
      v-html="highlightedPre.innerHtml"
    />
    <figcaption v-if="hasLanguage" class="code-language">
      {{ language }}
    </figcaption>
    <div class="code-theme-picker" role="group" aria-label="Syntax theme">
      <button
        v-for="option in orderedThemeOptions"
        :key="option.name"
        type="button"
        class="theme-option"
        :class="{ 'is-active': themeName === option.name }"
        :style="{ '--theme-dot': option.dot }"
        :aria-label="`Use ${option.label} syntax theme`"
        :aria-pressed="themeName === option.name"
        @click="setTheme(option.name)"
      >
        <span class="theme-dot" aria-hidden="true" />
      </button>
    </div>
  </figure>
</template>

<style lang="scss" scoped>
  .code-block {
    @include code-block;
  }
</style>
