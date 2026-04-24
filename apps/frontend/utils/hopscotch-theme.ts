// Hopscotch-inspired syntax theme for Shiki.
// Based on the original Hopscotch tmTheme by Jan T. Sott.
// Colors are faithful to the original palette; the visual shell
// (background, scanlines, glow) is handled by the retroterm SCSS recipe.
import type { ThemeRegistration } from 'shiki';

export const hopscotchTheme: ThemeRegistration = {
  name: 'hopscotch',
  type: 'dark',
  colors: {
    'editor.background': '#322931',
    'editor.foreground': '#b9b5b8',
    'editor.selectionBackground': '#5c545b',
    'editor.lineHighlightBackground': '#79737533',
  },
  tokenColors: [
    {
      name: 'Comments',
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#9a949880' },
    },
    {
      name: 'Punctuation',
      scope: [
        'punctuation.definition.string',
        'punctuation.definition.variable',
        'punctuation.definition.parameters',
        'punctuation.definition.array',
      ],
      settings: { foreground: '#b9b5b8' },
    },
    {
      name: 'Operators',
      scope: ['keyword.operator'],
      settings: { foreground: '#b9b5b8' },
    },
    {
      name: 'Keywords',
      scope: ['keyword'],
      settings: { foreground: '#c85e7c' },
    },
    {
      name: 'Storage',
      scope: ['storage'],
      settings: { foreground: '#c85e7c' },
    },
    {
      name: 'Variables',
      scope: ['variable'],
      settings: { foreground: '#dd464c' },
    },
    {
      name: 'Functions',
      scope: [
        'entity.name.function',
        'meta.require',
        'support.function.any-method',
      ],
      settings: { foreground: '#1290bf' },
    },
    {
      name: 'Classes',
      scope: ['support.class', 'entity.name.class', 'entity.name.type.class'],
      settings: { foreground: '#fdcc59' },
    },
    {
      name: 'Meta Class',
      scope: ['meta.class'],
      settings: { foreground: '#ffffff' },
    },
    {
      name: 'Methods',
      scope: ['keyword.other.special-method'],
      settings: { foreground: '#1290bf' },
    },
    {
      name: 'Support Functions',
      scope: ['support.function'],
      settings: { foreground: '#149b93' },
    },
    {
      name: 'Strings',
      scope: [
        'string',
        'constant.other.symbol',
        'entity.other.inherited-class',
      ],
      settings: { foreground: '#8fc13e' },
    },
    {
      name: 'Numbers',
      scope: ['constant.numeric'],
      settings: { foreground: '#fd8b19' },
    },
    {
      name: 'Constants',
      scope: ['constant'],
      settings: { foreground: '#fd8b19' },
    },
    {
      name: 'Tags',
      scope: ['entity.name.tag'],
      settings: { foreground: '#dd464c' },
    },
    {
      name: 'Attributes',
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#fd8b19' },
    },
    {
      name: 'Attribute IDs',
      scope: [
        'entity.other.attribute-name.id',
        'punctuation.definition.entity',
      ],
      settings: { foreground: '#1290bf' },
    },
    {
      name: 'Selectors',
      scope: ['meta.selector'],
      settings: { foreground: '#c85e7c' },
    },
    {
      name: 'Units',
      scope: ['keyword.other.unit'],
      settings: { foreground: '#fd8b19' },
    },
    {
      name: 'Colors',
      scope: ['constant.other.color'],
      settings: { foreground: '#149b93' },
    },
    {
      name: 'Regular Expressions',
      scope: ['string.regexp'],
      settings: { foreground: '#149b93' },
    },
    {
      name: 'Escape Characters',
      scope: ['constant.character.escape'],
      settings: { foreground: '#149b93' },
    },
    {
      name: 'Embedded / Interpolation',
      scope: ['punctuation.section.embedded', 'variable.interpolation'],
      settings: { foreground: '#d45f1a' },
    },
    {
      name: 'Headings',
      scope: [
        'markup.heading punctuation.definition.heading',
        'entity.name.section',
      ],
      settings: { foreground: '#1290bf' },
    },
    {
      name: 'Bold',
      scope: ['markup.bold', 'punctuation.definition.bold'],
      settings: { fontStyle: 'bold', foreground: '#fdcc59' },
    },
    {
      name: 'Italic',
      scope: ['markup.italic', 'punctuation.definition.italic'],
      settings: { fontStyle: 'italic', foreground: '#c85e7c' },
    },
    {
      name: 'Code',
      scope: ['markup.raw.inline'],
      settings: { foreground: '#8fc13e' },
    },
    {
      name: 'Inserted',
      scope: ['markup.inserted'],
      settings: { foreground: '#8fc13e' },
    },
    {
      name: 'Deleted',
      scope: ['markup.deleted'],
      settings: { foreground: '#dd464c' },
    },
    {
      name: 'Changed',
      scope: ['markup.changed'],
      settings: { foreground: '#c85e7c' },
    },
    {
      name: 'Invalid / Illegal',
      scope: ['invalid.illegal'],
      settings: { foreground: '#ffffff', background: '#dd464c' },
    },
    {
      name: 'Invalid / Deprecated',
      scope: ['invalid.deprecated'],
      settings: { foreground: '#ffffff', background: '#b33508' },
    },
  ],
};
