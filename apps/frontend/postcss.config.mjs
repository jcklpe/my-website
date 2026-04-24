import postcssScss from 'postcss-scss';

/**
 * Use postcss-scss as the PostCSS syntax so it understands SCSS-specific syntax
 * (including // single-line comments) without choking. This is needed because
 * Vite passes Vue SFC <style lang="scss"> blocks through PostCSS for scoped
 * attribute injection before the Sass preprocessor runs, so PostCSS sees raw
 * SCSS. postcss-scss makes it SCSS-aware without actually compiling SCSS — that
 * is still Sass's job.
 */
export default {
  syntax: postcssScss,
};
