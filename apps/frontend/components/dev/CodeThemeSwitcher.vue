<script setup lang="ts">
  import { CODE_THEME_LABELS } from '~/utils/syntax-highlighting';

  const { themeName } = useCodeTheme();
</script>

<template>
  <div class="code-theme-switcher">
    <span class="switcher-label">syntax theme</span>
    <label
      v-for="(label, key) in CODE_THEME_LABELS"
      :key="key"
      class="switcher-option"
      :class="{ 'is-active': themeName === key }"
    >
      <input v-model="themeName" type="radio" :value="key" />
      {{ label }}
    </label>
  </div>
</template>

<style lang="scss" scoped>
  .code-theme-switcher {
    display: none;

    @media (min-width: 1024px) {
      display: flex;
    }

    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.65rem 0.9rem 0.75rem;
    background: var(--color-ink);
    border: 1px solid rgba(255, 255, 255, 0.12);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    user-select: none;
  }

  .switcher-label {
    display: block;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.25);
    margin-bottom: 0.1rem;
  }

  .switcher-option {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.45);
    transition: color 0.12s;

    &.is-active {
      color: rgba(255, 255, 255, 0.9);
    }

    &:hover {
      color: rgba(255, 255, 255, 0.75);
    }

    input[type='radio'] {
      margin: 0;
      accent-color: rgba(26, 90, 255, 1);
      cursor: pointer;
    }
  }
</style>
