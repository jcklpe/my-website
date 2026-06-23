import type { ThemeRegistration } from 'shiki';

// Midnight atlas — restrained but legible. Blue-gray field, cobalt structure,
// cream data, terminal green strings. All calibrated for #0c112b CRT ground.
export const duskTheme: ThemeRegistration = {
  name: 'dusk',
  type: 'dark',
  colors: {
    'editor.background': '#0c112b',
    'editor.foreground': '#a8b8d8',
    'editor.selectionBackground': '#2657eb22',
    'editor.lineHighlightBackground': '#ffffff06',
  },
  tokenColors: [
    {
      name: 'Comments',
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#6474b0' }, // blue-gray, ~3.8:1 on #0c112b
    },
    {
      name: 'Punctuation',
      scope: [
        'punctuation.definition.string',
        'punctuation.definition.variable',
        'punctuation.definition.parameters',
        'punctuation.definition.array',
      ],
      settings: { foreground: '#7888c4' }, // ~5.5:1
    },
    {
      name: 'Operators',
      scope: ['keyword.operator'],
      settings: { foreground: '#7888c4' },
    },
    {
      name: 'Keywords',
      scope: ['keyword'],
      settings: { foreground: '#7099ff' }, // cobalt
    },
    {
      name: 'Storage',
      scope: ['storage'],
      settings: { foreground: '#7099ff' },
    },
    {
      name: 'Variables',
      scope: ['variable'],
      settings: { foreground: '#a8b8d8' }, // ~8:1
    },
    {
      name: 'Functions',
      scope: ['entity.name.function', 'meta.require', 'support.function.any-method'],
      settings: { foreground: '#c0cce8' }, // ~10:1
    },
    {
      name: 'Classes',
      scope: ['support.class', 'entity.name.class', 'entity.name.type.class'],
      settings: { foreground: '#f7f5ef' },
    },
    {
      name: 'Meta Class',
      scope: ['meta.class'],
      settings: { foreground: '#f7f5ef' },
    },
    {
      name: 'Support Functions',
      scope: ['support.function'],
      settings: { foreground: '#b8c8e4' },
    },
    {
      name: 'Strings',
      scope: ['string', 'constant.other.symbol', 'entity.other.inherited-class'],
      settings: { foreground: '#40d470' }, // terminal green — only warm note
    },
    {
      name: 'Numbers',
      scope: ['constant.numeric'],
      settings: { foreground: '#f7f5ef' },
    },
    {
      name: 'Constants',
      scope: ['constant'],
      settings: { foreground: '#e8e4d8' },
    },
    {
      name: 'Tags',
      scope: ['entity.name.tag'],
      settings: { foreground: '#7099ff' },
    },
    {
      name: 'Attributes',
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#a8b8d8' },
    },
    {
      name: 'Attribute IDs',
      scope: ['entity.other.attribute-name.id', 'punctuation.definition.entity'],
      settings: { foreground: '#7099ff' },
    },
    {
      name: 'Selectors',
      scope: ['meta.selector'],
      settings: { foreground: '#7099ff' },
    },
    {
      name: 'Units',
      scope: ['keyword.other.unit'],
      settings: { foreground: '#f7f5ef' },
    },
    {
      name: 'Colors',
      scope: ['constant.other.color'],
      settings: { foreground: '#40d470' },
    },
    {
      name: 'Escape Characters',
      scope: ['constant.character.escape'],
      settings: { foreground: '#40d470' },
    },
    {
      name: 'Embedded / Interpolation',
      scope: ['punctuation.section.embedded', 'variable.interpolation'],
      settings: { foreground: '#40d470' },
    },
    {
      name: 'Invalid',
      scope: ['invalid.illegal'],
      settings: { foreground: '#f7f5ef', background: '#7099ff' },
    },
  ],
};
