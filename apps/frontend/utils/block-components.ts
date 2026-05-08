import { defineAsyncComponent, type Component } from 'vue';
import type { GutenbergBlock } from '~/types/wordpress';

type BlockComponentModule = {
  default: Component;
};

type BlockComponentLoader = () => Promise<BlockComponentModule>;

const contentShellLoaders: Record<string, BlockComponentLoader> = {
  BlockChildren: () => import('~/components/content/BlockChildren.vue'),
  BlockRenderer: () => import('~/components/content/BlockRenderer.vue'),
  FloatBreakoutGroup: () =>
    import('~/components/content/FloatBreakoutGroup.vue'),
  UnsupportedBlock: () => import('~/components/content/UnsupportedBlock.vue'),
};

export const blockComponentLoaders: Record<string, BlockComponentLoader> = {
  'core/paragraph': () =>
    import('~/components/content/blocks/ParagraphBlock.vue'),
  'core/heading': () => import('~/components/content/blocks/HeadingBlock.vue'),
  'core/image': () => import('~/components/content/blocks/ImageBlock.vue'),
  'core/quote': () => import('~/components/content/blocks/QuoteBlock.vue'),
  'core/list': () => import('~/components/content/blocks/ListBlock.vue'),
  'core/group': () => import('~/components/content/blocks/GroupBlock.vue'),
  'core/columns': () => import('~/components/content/blocks/ColumnsBlock.vue'),
  'core/column': () => import('~/components/content/blocks/ColumnBlock.vue'),
  'core/gallery': () => import('~/components/content/blocks/GalleryBlock.vue'),
  'core/spacer': () => import('~/components/content/blocks/SpacerBlock.vue'),
  'core/separator': () =>
    import('~/components/content/blocks/SeparatorBlock.vue'),
  'core/code': () => import('~/components/content/blocks/CodeBlock.vue'),
  'core/preformatted': () =>
    import('~/components/content/blocks/PreformattedBlock.vue'),
  'core/table': () => import('~/components/content/blocks/TableBlock.vue'),
  'core/pullquote': () =>
    import('~/components/content/blocks/PullquoteBlock.vue'),
  'core/embed': () => import('~/components/content/blocks/EmbedBlock.vue'),
  'core/html': () => import('~/components/content/blocks/HtmlBlock.vue'),
  'core/buttons': () => import('~/components/content/blocks/ButtonsBlock.vue'),
  'core/button': () => import('~/components/content/blocks/ButtonBlock.vue'),
  'core/media-text': () =>
    import('~/components/content/blocks/MediaTextBlock.vue'),
  'core/audio': () => import('~/components/content/blocks/AudioBlock.vue'),
  'core/video': () => import('~/components/content/blocks/VideoBlock.vue'),
  'core/file': () => import('~/components/content/blocks/FileBlock.vue'),
  'core/details': () => import('~/components/content/blocks/DetailsBlock.vue'),
  'core/accordion': () =>
    import('~/components/content/blocks/AccordionBlock.vue'),
  'my-website/mega-gallery': () =>
    import('~/components/content/blocks/MegaGalleryBlock.vue'),
};

export const blockComponentRegistry = Object.fromEntries(
  Object.entries(blockComponentLoaders).map(([blockName, loader]) => [
    blockName,
    defineAsyncComponent(loader),
  ]),
) as Record<string, Component>;

const warmedModuleKeys = new Set<string>();

function warmModule(key: string, loader: BlockComponentLoader) {
  if (warmedModuleKeys.has(key)) {
    return;
  }

  warmedModuleKeys.add(key);

  void loader().catch(() => {
    warmedModuleKeys.delete(key);
  });
}

function warmContentShellModules() {
  for (const [moduleName, loader] of Object.entries(contentShellLoaders)) {
    warmModule(`content-shell:${moduleName}`, loader);
  }
}

function warmBlockComponentNames(blockNames: Iterable<string>) {
  for (const blockName of new Set(blockNames)) {
    const loader = blockComponentLoaders[blockName];

    if (!loader) {
      continue;
    }

    warmModule(`block:${blockName}`, loader);
  }
}

export function warmContentBlockModules(
  blocks: GutenbergBlock[] | null | undefined,
) {
  if (!import.meta.client) {
    return;
  }

  warmContentShellModules();
  warmBlockComponentNames(blocks?.map((block) => block.name) ?? []);
}
