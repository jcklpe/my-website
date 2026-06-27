import type { InjectionKey, Ref } from 'vue';
import type { GutenbergBlock } from '~/types/wordpress';

export interface FootnoteEntry {
  number: number;
  contentHtml: string;
}

export type FootnoteMap = Record<string, FootnoteEntry>;

export const FOOTNOTE_MAP_KEY: InjectionKey<Ref<FootnoteMap>> =
  Symbol('footnoteMap');

function parseFootnotesHtml(html: string): FootnoteMap {
  const map: FootnoteMap = {};
  let number = 1;

  // WP Core Footnotes block format (WP 6.5+):
  //   <li id="{uuid}">content <a href="#{uuid}-link" aria-label="…">↩︎</a></li>
  // Older WP format used id="fn-{uuid}" and href="#fnref-{uuid}".
  // The (?:fn-)? makes both work. <li> never nests, so lazy-match is safe.
  const liPattern =
    /<li\b[^>]*\bid="(?:fn-)?([a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/li>/gi;

  for (const match of html.matchAll(liPattern)) {
    const uuid = match[1];
    // Strip back-link anchors (↩︎). Two formats:
    //   New WP: <a href="#{uuid}-link" aria-label="Jump to footnote reference N">
    //   Old WP: <a href="#fnref-{uuid}">
    const contentHtml = (match[2] ?? '')
      .replace(
        /<a\b[^>]*(?:href="#[^"]*-link"|href="#fnref-[^"]*")[^>]*>[\s\S]*?<\/a>/gi,
        '',
      )
      .trim();

    map[uuid] = { number: number++, contentHtml };
  }

  return map;
}

export function usePostFootnotes(blocks: Readonly<Ref<GutenbergBlock[]>>) {
  const footnoteMap = computed<FootnoteMap>(() => {
    const footnotesBlock = blocks.value.find(
      (b) => b.name === 'core/footnotes',
    );
    if (!footnotesBlock?.renderedHtml) return {};
    return parseFootnotesHtml(footnotesBlock.renderedHtml);
  });

  // Guard: only provide if no ancestor already did. BlockRenderer is recursive
  // (compositional blocks nest inner BlockRenderers), and we don't want inner
  // instances with empty block lists to override the top-level map.
  const parentMap = inject(FOOTNOTE_MAP_KEY, null);
  if (!parentMap) {
    provide(FOOTNOTE_MAP_KEY, footnoteMap);
  }

  return { footnoteMap };
}

export function useFootnoteMap() {
  return inject(FOOTNOTE_MAP_KEY, null);
}
