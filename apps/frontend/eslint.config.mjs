// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    rules: {
      '@stylistic/member-delimiter-style': 'off',
      '@stylistic/semi': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/script-indent': 'off',
      'vue/html-indent': 'off',
    },
  },
  {
    files: ['components/**/*.vue'],
    rules: {
      'vue/no-v-html': 'off',
    },
  },
);
