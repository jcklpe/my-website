<script setup lang="ts">
  import ImageBlock from './blocks/ImageBlock.vue';
  import EmbedBlock from './blocks/EmbedBlock.vue';
  import PullquoteBlock from './blocks/PullquoteBlock.vue';
  import QuoteBlock from './blocks/QuoteBlock.vue';
  import VideoBlock from './blocks/VideoBlock.vue';
  import type { GutenbergBlock } from '~/types/wordpress';

  const props = defineProps<{
    leadBlock: GutenbergBlock;
    blocks: GutenbergBlock[];
    allBlocks: GutenbergBlock[];
    alignment: 'alignleft' | 'alignright';
  }>();

  const leadComponent = computed(() => {
    switch (props.leadBlock.name) {
      case 'core/embed':
        return EmbedBlock;
      case 'core/video':
        return VideoBlock;
      case 'core/quote':
        return QuoteBlock;
      case 'core/pullquote':
        return PullquoteBlock;
      default:
        return ImageBlock;
    }
  });
</script>

<template>
  <section class="float-breakout-flow" :class="alignment">
    <component :is="leadComponent" :block="leadBlock" :all-blocks="allBlocks" />

    <div class="float-breakout-wrapping-content">
      <!-- Pass the full flat list as `blocks` (so container blocks among
           the wrapping content can find their descendants) and the specific
           wrapping subset as `render-blocks`. -->
      <BlockChildren
        :blocks="allBlocks"
        :render-blocks="blocks"
        :parent-client-id="leadBlock.parentClientId"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
  .float-breakout-wrapping-content {
    :deep(> :first-child) {
      margin-top: 0;
    }
  }
</style>
