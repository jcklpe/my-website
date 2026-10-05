import { Parser } from 'htmlparser2';
import {
  highlightInlineCode,
  normalizeCodeLanguage,
  hasSyntaxLanguage,
} from './syntax-highlighting';

interface InlineSnippet {
  start: number;
  contentStart: number;
  end: number;
  language: string;
  text: string;
  hasMarkup: boolean;
}

export async function highlightInlineCodeHtml(html: string) {
  if (!/<code\b/i.test(html)) return html;

  const snippets: InlineSnippet[] = [];
  let active: InlineSnippet | null = null;
  let preDepth = 0;
  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === 'pre') preDepth++;
      if (active) {
        active.hasMarkup = true;
        return;
      }
      if (
        name !== 'code' ||
        preDepth ||
        'data-inline-highlighted' in attributes
      )
        return;

      const classLanguage = attributes.class
        ?.split(/\s+/)
        .find(
          (name) => name.startsWith('language-') || name.startsWith('lang-'),
        );
      active = {
        start: parser.startIndex,
        contentStart: parser.endIndex + 1,
        end: 0,
        language: normalizeCodeLanguage(
          attributes['data-code-language'] || classLanguage || 'enzo',
        ),
        text: '',
        hasMarkup: false,
      };
    },
    ontext(text) {
      if (active) active.text += text;
    },
    oncomment() {
      if (active) active.hasMarkup = true;
    },
    onclosetag(name, implied) {
      if (name === 'pre') preDepth = Math.max(0, preDepth - 1);
      if (name !== 'code' || !active) return;
      active.end = parser.startIndex;
      // Preserve authored nested formatting and malformed/unclosed code rather than flattening it into tokens.
      if (!implied && !active.hasMarkup && hasSyntaxLanguage(active.language))
        snippets.push(active);
      active = null;
    },
  });
  parser.end(html);

  const replacements = await Promise.all(
    snippets.map(async (snippet) => ({
      ...snippet,
      tokens: await highlightInlineCode(snippet.text, snippet.language),
    })),
  );
  let result = html;
  for (const snippet of replacements.reverse()) {
    const opening = html.slice(snippet.start, snippet.contentStart - 1);
    result =
      result.slice(0, snippet.start) +
      opening +
      ' data-inline-highlighted="true">' +
      snippet.tokens +
      result.slice(snippet.end);
  }
  return result;
}
