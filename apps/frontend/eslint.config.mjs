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
      // Prettier owns self-closing style; disabling here prevents the
      // Prettier ↔ ESLint fight where each tool undoes the other's fix.
      'vue/html-self-closing': 'off',
    },
  },
  {
    files: ['components/**/*.vue'],
    rules: {
      'vue/no-v-html': 'off',
    },
  },
);
