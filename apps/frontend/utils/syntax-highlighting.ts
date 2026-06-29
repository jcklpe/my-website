import {
  bundledLanguages,
  codeToHtml,
  getSingletonHighlighter,
} from 'shiki';
import type { LanguageRegistration, ThemeRegistration } from 'shiki';
import { phosphor2Theme } from './phosphor2-theme';
import { midnightTheme } from './midnight-theme';
import { signalTheme } from './signal-theme';
import enzoGrammarJson from './enzo-grammar.json';

export type CodeThemeName = 'phosphor2' | 'midnight' | 'signal';

export const CODE_THEME_LABELS: Record<CodeThemeName, string> = {
  phosphor2: 'Phosphor',
  midnight: 'Midnight',
  signal: 'Signal',
};

export const CODE_THEME_SURFACES: Record<
  CodeThemeName,
  { background: string; foreground: string; glow: string; scanline: string }
> = {
  phosphor2: {
    background: '#352826',
    foreground: '#FECC55',
    glow: 'rgba(254, 204, 85, 0.12)',
    scanline: 'rgba(254, 204, 85, 0.08)',
  },
  midnight: {
    background: '#2438A4',
    foreground: '#E0EAFF',
    glow: 'rgba(150, 180, 255, 0.16)',
    scanline: 'rgba(150, 180, 255, 0.05)',
  },
  signal: {
    background: '#163A39',
    foreground: '#66FFA9',
    glow: 'rgba(102, 255, 169, 0.12)',
    scanline: 'rgba(102, 255, 169, 0.08)',
  },
};

export const CODE_THEME_DOTS: Record<CodeThemeName, string> = {
  phosphor2: '#FECC55',
  midnight: '#2657eb',
  signal: '#66FFA9',
};

export const CODE_THEME_OPTIONS = (
  Object.keys(CODE_THEME_LABELS) as CodeThemeName[]
).map((name) => ({
  name,
  label: CODE_THEME_LABELS[name],
  dot: CODE_THEME_DOTS[name],
}));

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

export async function highlightCode(
  source: string,
  language: string,
  themeName: CodeThemeName = 'midnight',
) {
  const normalizedLanguage = normalizeCodeLanguage(language);
  const theme = CODE_THEMES[themeName];

  if (CUSTOM_LANGUAGES.has(normalizedLanguage)) {
    const h = await getSingletonHighlighter({
      themes: [theme],
      langs: [enzoLanguage],
    });
    return h.codeToHtml(source, {
      lang: normalizedLanguage,
      theme,
    });
  }

  const shikiLanguage =
    normalizedLanguage in bundledLanguages ? normalizedLanguage : 'text';

  return codeToHtml(source, {
    lang: shikiLanguage,
    theme,
  });
}
