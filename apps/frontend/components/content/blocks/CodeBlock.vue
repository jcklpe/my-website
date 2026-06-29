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
    CODE_THEME_OPTIONS,
    hasSyntaxLanguage,
    highlightCode,
    normalizeCodeLanguage,
  } from '~/utils/syntax-highlighting';

  const { themeName } = useCodeTheme();

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
    () => `code-block:${props.block.clientId}:${language.value}:${themeName.value}`,
    () => highlightCode(codeText.value, language.value, themeName.value),
    {
      watch: [codeText, language, themeName],
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
    removeWordPressFrontendClasses(
      extractAttribute(root.value?.attributes, 'class'),
    ),
  );
  const crtStyle = computed(() => {
    if (themeName.value === 'midnight') {
      return {
        '--code-crt-bg': '#0818a0',
        '--code-crt-spot': 'rgba(120, 160, 255, 0.25)',
        '--code-crt-glow': 'rgba(100, 150, 255, 0.15)',
        '--code-crt-scanline': 'rgba(150, 180, 255, 0.03)',
      };
    }
    if (themeName.value === 'phosphor2') {
      return {
        '--code-crt-spot': 'rgba(200, 120, 20, 0.22)',
        '--code-crt-glow': 'rgba(180, 100, 10, 0.10)',
        '--code-crt-scanline': 'rgba(255, 160, 30, 0.07)',
      };
    }
    if (themeName.value === 'signal') {
      return {
        '--code-crt-spot': 'rgba(40, 200, 100, 0.18)',
        '--code-crt-glow': 'rgba(30, 180, 80, 0.09)',
        '--code-crt-scanline': 'rgba(50, 220, 110, 0.06)',
      };
    }
    return undefined;
  });
  const orderedThemeOptions = computed(() => [
    ...CODE_THEME_OPTIONS.filter((option) => option.name === themeName.value),
    ...CODE_THEME_OPTIONS.filter((option) => option.name !== themeName.value),
  ]);
  const setTheme = (nextTheme: (typeof CODE_THEME_OPTIONS)[number]['name']) => {
    themeName.value = nextTheme;
  };
</script>

<template>
  <figure class="code-block" :class="rootClass" :data-language="language" :style="crtStyle">
    <pre
      v-if="highlightedPre"
      :class="highlightedClass"
      v-html="highlightedPre.innerHtml"
    />
    <figcaption v-if="hasLanguage" class="code-language">
      {{ language }}
    </figcaption>
    <div class="code-theme-picker" aria-label="Syntax theme">
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
