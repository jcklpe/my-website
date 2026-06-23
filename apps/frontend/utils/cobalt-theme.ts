import type { ThemeRegistration } from 'shiki';

// Blueprint on ink — brand cobalt as the structural color.
// All token values are calibrated for the CRT ground (#0c112b).
// Comments ~3.8:1, punctuation ~6:1, main text ~12:1.
export const cobaltTheme: ThemeRegistration = {
  name: 'cobalt',
  type: 'dark',
  colors: {
    'editor.background': '#0c112b',
    'editor.foreground': '#c8d4ff',
    'editor.selectionBackground': '#2657eb33',
    'editor.lineHighlightBackground': '#ffffff08',
  },
  tokenColors: [
    {
      name: 'Comments',
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#6474b0' }, // blue-gray muted, ~3.8:1 on #0c112b
    },
    {
      name: 'Punctuation',
      scope: [
        'punctuation.definition.string',
        'punctuation.definition.variable',
        'punctuation.definition.parameters',
        'punctuation.definition.array',
      ],
      settings: { foreground: '#8090c8' }, // ~6:1 — structural but neutral
    },
    {
      name: 'Operators',
      scope: ['keyword.operator'],
      settings: { foreground: '#8090c8' },
    },
    {
      name: 'Keywords',
      scope: ['keyword'],
      settings: { foreground: '#7099ff' }, // cobalt, ~7:1
    },
    {
      name: 'Storage',
      scope: ['storage'],
      settings: { foreground: '#7099ff' },
    },
    {
      name: 'Variables',
      scope: ['variable'],
      settings: { foreground: '#c8d4ff' }, // ~12:1
    },
    {
      name: 'Functions',
      scope: ['entity.name.function', 'meta.require', 'support.function.any-method'],
      settings: { foreground: '#a8c4ff' }, // ~10:1
    },
    {
      name: 'Classes',
      scope: ['support.class', 'entity.name.class', 'entity.name.type.class'],
      settings: { foreground: '#ffffff' },
    },
    {
      name: 'Meta Class',
      scope: ['meta.class'],
      settings: { foreground: '#ffffff' },
    },
    {
      name: 'Support Functions',
      scope: ['support.function'],
      settings: { foreground: '#a8c4ff' },
    },
    {
      name: 'Strings',
      scope: ['string', 'constant.other.symbol', 'entity.other.inherited-class'],
      settings: { foreground: '#40d470' }, // brand terminal green, brightened for CRT
    },
    {
      name: 'Numbers',
      scope: ['constant.numeric'],
      settings: { foreground: '#f7f5ef' }, // brand cream — data pops
    },
    {
      name: 'Constants',
      scope: ['constant'],
      settings: { foreground: '#f7f5ef' },
    },
    {
      name: 'Tags',
      scope: ['entity.name.tag'],
      settings: { foreground: '#7099ff' },
    },
    {
      name: 'Attributes',
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#a8c4ff' },
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
