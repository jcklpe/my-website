import { bundledLanguages, codeToHtml } from 'shiki';
import { hopscotchTheme } from './hopscotch-theme';

const languageAliases: Record<string, string> = {
  bash: 'shellscript',
  css: 'css',
  html: 'html',
  javascript: 'javascript',
  js: 'javascript',
  json: 'json',
  markup: 'html',
  php: 'php',
  plaintext: 'text',
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
  return language !== 'text' && language in bundledLanguages;
}

export async function highlightCode(source: string, language: string) {
  const normalizedLanguage = normalizeCodeLanguage(language);
  const shikiLanguage =
    normalizedLanguage in bundledLanguages ? normalizedLanguage : 'text';

  return codeToHtml(source, {
    lang: shikiLanguage,
    theme: hopscotchTheme,
  });
}
