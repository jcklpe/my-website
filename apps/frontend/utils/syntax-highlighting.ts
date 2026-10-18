import { bundledLanguages, getSingletonHighlighter } from 'shiki';
import type { LanguageRegistration, ThemeRegistration } from 'shiki';
import { phosphor2Theme } from './phosphor2-theme';
import { midnightTheme } from './midnight-theme';
import { signalTheme } from './signal-theme';
import enzoGrammarJson from './enzo-grammar.json';

import type { CodeThemeName } from './code-theme';

const CODE_THEMES: Record<CodeThemeName, ThemeRegistration> = {
  phosphor2: phosphor2Theme,
  midnight: midnightTheme,
  signal: signalTheme,
};

const enzoLanguage: LanguageRegistration = {
  ...(enzoGrammarJson as Omit<LanguageRegistration, 'name'>),
  name: 'enzo', // after spread — overrides the JSON's "Enzo"
};

// Languages not in Shiki's bundled set that we support via custom grammars.
const CUSTOM_LANGUAGES = new Set(['enzo']);

const languageAliases: Record<string, string> = {
  bash: 'shellscript',
  css: 'css',
  enzo: 'enzo',
  'f#': 'fsharp',
  fs: 'fsharp',
  fsharp: 'fsharp',
  html: 'html',
  javascript: 'javascript',
  java: 'java',
  js: 'javascript',
  json: 'json',
  markup: 'html',
  php: 'php',
  plaintext: 'text',
  py: 'python',
  python: 'python',
  rs: 'rust',
  rust: 'rust',
  sass: 'sass',
  scss: 'scss',
  sh: 'shellscript',
  shell: 'shellscript',
  ts: 'typescript',
  tsx: 'tsx',
  txt: 'text',
  typescript: 'typescript',
  vue: 'vue',
  xml: 'xml',
  zsh: 'shellscript',
};

export function normalizeCodeLanguage(value: string | null | undefined) {
  if (!value) {
    return 'text';
  }

  const language = value
    .toLowerCase()
    .replace(/^language-/, '')
    .replace(/^lang-/, '')
    .trim();

  return languageAliases[language] ?? language;
}

export function hasSyntaxLanguage(language: string) {
  return (
    language !== 'text' &&
    (language in bundledLanguages || CUSTOM_LANGUAGES.has(language))
  );
}

export async function highlightCode(source: string, language: string) {
  const normalizedLanguage = normalizeCodeLanguage(language);
  let grammar: string | LanguageRegistration = 'text';
  if (CUSTOM_LANGUAGES.has(normalizedLanguage)) {
    grammar = enzoLanguage;
  } else if (normalizedLanguage in bundledLanguages) {
    grammar = normalizedLanguage;
  }
  const highlighter = await getSingletonHighlighter({
    themes: Object.values(CODE_THEMES),
    langs: [grammar],
  });
  return highlighter.codeToHtml(source, {
    lang: typeof grammar === 'string' ? grammar : grammar.name,
    themes: CODE_THEMES,
    defaultColor: false,
    cssVariablePrefix: '--code-token-',
  });
}

export async function highlightInlineCode(source: string, language: string) {
  const normalizedLanguage = normalizeCodeLanguage(language);
  const grammar = CUSTOM_LANGUAGES.has(normalizedLanguage)
    ? enzoLanguage
    : normalizedLanguage;
  const highlighter = await getSingletonHighlighter({
    themes: Object.values(CODE_THEMES),
    langs: [grammar],
  });
  const html = highlighter.codeToHtml(source, {
    lang: normalizedLanguage,
    themes: CODE_THEMES,
    defaultColor: false,
    cssVariablePrefix: '--inline-code-',
  });
  // Keep only inline token spans; the normal inline-code recipe owns the surface and type size.
  return html.slice(html.indexOf('<code>') + 6, html.lastIndexOf('</code>'));
}
