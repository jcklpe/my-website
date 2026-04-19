<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const accordion = ref<HTMLElement | null>(null);
  let removeClickListener: (() => void) | null = null;

  onMounted(() => {
    const element = accordion.value;

    if (!element) {
      return;
    }

    const buttons = Array.from(element.querySelectorAll('button'));

    for (const button of buttons) {
      const content = findAccordionContent(button);

      if (!content) {
        continue;
      }

      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(isOpen));
      content.hidden = !isOpen;
    }

    const handleClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest('button');

      if (!(button instanceof HTMLButtonElement) || !element.contains(button)) {
        return;
      }

      const content = findAccordionContent(button);

      if (!content) {
        return;
      }

      const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(shouldOpen));
      content.hidden = !shouldOpen;
    };

    element.addEventListener('click', handleClick);
    removeClickListener = () => element.removeEventListener('click', handleClick);
  });

  onBeforeUnmount(() => {
    removeClickListener?.();
  });

  function findAccordionContent(button: HTMLButtonElement) {
    const controlledId = button.getAttribute('aria-controls');

    if (controlledId) {
      return document.getElementById(controlledId);
    }

    return button.nextElementSibling instanceof HTMLElement
      ? button.nextElementSibling
      : button.parentElement?.nextElementSibling instanceof HTMLElement
        ? button.parentElement.nextElementSibling
        : null;
  }
</script>

<template>
  <section
    ref="accordion"
    class="wp-block-accordion"
    v-html="props.block.renderedHtml"
  />
</template>
