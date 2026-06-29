import type { ThemeRegistration } from 'shiki';

// Cobalt ground (#0818a0). Vivid, saturated blue — the world.
// Semantic hue scalar warped for cobalt:
//   WARM data half: cool rose vars | magenta-violet refs | peach binding | yellow numbers | yellow-green strings
//   COOL half (structure): cyan functions+brackets | white grammar keywords | lavender abstract types | periwinkle concrete variants
//   NEUTRAL: dim-periwinkle punctuation (#7799cc) recedes into the cobalt world at 4.4:1 — below the semantic tokens
// Legibility strategy: data colors keep their hue-scalar roles but cool away from Phosphor/Signal's hotter orange-red register.
// All revised semantic tokens clear WCAG-AA against #0818a0.
// Comment 5.6:1 on #0818a0.
export const midnightTheme: ThemeRegistration = {
  name: 'midnight',
  type: 'dark',
  colors: {
    'editor.background': '#0818a0',
    'editor.foreground': '#e0eaff',
    'editor.selectionBackground': '#ffffff30',
    'editor.lineHighlightBackground': '#ffffff08',
  },
  tokenColors: [
    {
      name: 'Comments',
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#99aadd', fontStyle: 'italic' }, // 5.6:1 on #0818a0
    },

    // ─── Neutral structural noise — periwinkle fades into the cobalt world ────
    {
      name: 'Punctuation',
      scope: [
        'punctuation',
        'punctuation.separator',
        'punctuation.terminator',
        'punctuation.definition.string',
        'punctuation.definition.variable',
        'punctuation.separator.enzo',
      ],
      settings: { foreground: '#7799cc' }, // dim periwinkle 4.4:1 — recedes as structural noise
    },
    {
      name: 'Arithmetic and Comparison Operators',
      scope: [
        'keyword.operator.arithmetic',
        'keyword.operator.arithmetic.enzo',
        'keyword.operator.comparison',
        'keyword.operator.comparison.enzo',
        'keyword.operator.logical',
      ],
      settings: { foreground: '#7799cc' }, // dim periwinkle 4.4:1 — recedes as structural noise
    },
    {
      name: 'Type Connectors (or / and)',
      scope: ['keyword.other.or.enzo', 'keyword.other.and.enzo'],
      settings: { foreground: '#7799cc' }, // dim periwinkle 4.4:1 — recedes as structural noise
    },

    // ─── Structural brackets + functions = cyan (the "blue" that reads on cobalt) ──
    {
      name: 'Structural Brackets',
      scope: [
        'punctuation.section',
        'punctuation.section.block',
        'punctuation.section.brackets',
        'punctuation.section.parameters',
        'punctuation.section.arguments',
        'punctuation.section.function.enzo',
        'punctuation.section.function.begin.enzo',
        'punctuation.definition.parameters',
        'punctuation.definition.array',
        'punctuation.section.brackets.begin.enzo',
        'meta.brace.square',
        'meta.brace.round',
      ],
      settings: { foreground: '#44ddff' },
    },

    // ─── Binding operators — electric peach, between variable red and number yellow ───
    {
      name: 'Binding Operators',
      scope: [
        'keyword.operator.assignment',
        'keyword.operator.assignment.enzo',
        'keyword.operator.append.enzo',
        'keyword.operator.rebind.enzo',
        'keyword.operator.destructure.enzo',
        'punctuation.separator.key-value',
      ],
      settings: { foreground: '#FFA66F' },
    },

    // ─── Keywords — white, colorless grammar, maximum authority ──────────────
    {
      name: 'Keywords',
      scope: [
        'keyword.control',
        'keyword.control.flow.enzo',
        'keyword.control.param.enzo',
        'keyword.control.enzo',
        'keyword.other',
        'keyword.other.blueprint.enzo',
        'keyword.import',
        'keyword.package',
        'keyword',
      ],
      settings: { foreground: '#ffffff' },
    },
    {
      name: 'Storage modifiers',
      scope: ['storage.type', 'storage.modifier', 'storage'],
      settings: { foreground: '#ffffff' },
    },

    // ─── Variables — cool rose-red, most concrete data noun ───────────────────
    // Still semantically red, but less orange than Phosphor/Signal so it belongs
    // more naturally to the cobalt Midnight world.
    {
      name: 'Variables',
      scope: [
        'variable',
        'variable.other',
        'variable.other.readwrite',
        'variable.other.local',
        'variable.other.object',
        'variable.other.enzo',
        'variable.function',
        'variable.function.call.enzo',
        'variable.language',
        'variable.parameter',
        'variable.parameter.blueprint.enzo',
      ],
      settings: { foreground: '#FF6A8A' }, // 4.7:1 on #0818a0
    },

    // ─── Accessor dot, interpolation delimiters, spread <> — same as variable ──
    {
      name: 'Accessor and Interpolation Punctuation',
      scope: [
        'punctuation.accessor.enzo',
        'punctuation.section.embedded.begin.enzo',
        'punctuation.section.embedded.end.enzo',
        'punctuation.section.embedded',
        'keyword.operator.spread.begin.enzo',
        'keyword.operator.spread.end.enzo',
      ],
      settings: { foreground: '#FF6A8A' },
    },

    // ─── Member index (.1) — light rose, tracks the variable family ───────────
    {
      name: 'Member Index (sub-variable)',
      scope: ['variable.other.property.numeric.enzo'],
      settings: { foreground: '#FF9AB0' }, // 6.4:1 — clearly lighter than variable
    },

    // ─── Reference values (@val) — cool magenta-violet, data-adjacent ─────────
    // References keep the magenta data-handle lane while cooling away from the
    // old hot pink/orange register.
    {
      name: 'Reference Values',
      scope: [
        'variable.other.reference.enzo',
        'keyword.operator.reference.enzo',
        'keyword.operator.function-reference.enzo',
      ],
      settings: { foreground: '#EE80D8' }, // 5.3:1 on #0818a0
    },

    // ─── Functions + return — cyan, same family as structural brackets ────────
    {
      name: 'Functions',
      scope: [
        'entity.name.function',
        'entity.name.function.call',
        'entity.name.function.call.enzo',
        'entity.name.function.definition.enzo',
        'entity.name.function.property.enzo',
        'entity.name.function.method',
        'support.function',
        'support.function.any-method',
        'meta.require',
        'keyword.control.return.enzo',
      ],
      settings: { foreground: '#44ddff' },
    },

    // ─── Abstract type containers (Status-Effect, Enemy) — lavender-indigo ───
    {
      name: 'Blueprint Types',
      scope: [
        'entity.name.type',
        'entity.name.type.class',
        'entity.name.type.struct',
        'entity.name.type.enum',
        'entity.name.type.interface',
        'entity.name.type.variant-group.enzo',
        'entity.name.type.reference.enzo',
        'entity.name.class',
        'entity.name.namespace',
        'support.class',
        'support.type',
        'support.type.primitive',
        'support.type.number.enzo',
        'support.type.text.enzo',
        'support.type.list.enzo',
        'support.type.function.enzo',
        'entity.other.inherited-class',
        'keyword.other.variants.enzo',
      ],
      settings: { foreground: '#aa88ff' },
    },

    // ─── Blueprint field names (hp:, has-dagger:) — barely off variable rose ──
    {
      name: 'Blueprint Field Names',
      scope: [
        'entity.name.property.blueprint.enzo',
        'meta.object-literal.key',
        'variable.other.property',
        'variable.other.property.enzo',
        'variable.other.object.property',
        'support.variable.property',
        'entity.name.variable.field',
        'variable.other.member',
      ],
      settings: { foreground: '#F090D0' },
    },

    // ─── Variants + Blueprint names/delimiters — periwinkle-blue ─────────────
    // Concrete named values and Blueprint shells: bluer than abstract types.
    {
      name: 'Variants',
      scope: [
        'entity.name.type.variant.enzo',
        'entity.name.type.blueprint.enzo',
        'entity.name.type.blueprint.instantiation.enzo',
        'punctuation.definition.blueprint.begin.enzo',
        'punctuation.definition.blueprint.end.enzo',
        'punctuation.definition.blueprint.angle.enzo',
        'variable.other.enummember',
        'entity.name.constant',
      ],
      settings: { foreground: '#88aaff' },
    },
    {
      name: 'Language Constants',
      scope: [
        'constant.language',
        'constant.language.empty.enzo',
        'constant.language.status.enzo',
        'constant.language.true-false.enzo',
        'support.constant',
      ],
      settings: { foreground: '#88aaff' },
    },

    // ─── Strings — yellow-green, warm data value ──────────────────────────────
    {
      name: 'Strings',
      scope: [
        'string',
        'string.quoted',
        'string.quoted.double.enzo',
        'string.template',
        'constant.other.symbol',
      ],
      settings: { foreground: '#aaff44' },
    },

    // ─── Numbers — yellow, precise literal ───────────────────────────────────
    {
      name: 'Numbers',
      scope: [
        'constant.numeric',
        'constant.numeric.enzo',
        'constant.numeric.integer',
        'constant.numeric.float',
        'constant.numeric.hex',
      ],
      settings: { foreground: '#ffee44' },
    },

    {
      name: 'Tags',
      scope: ['entity.name.tag'],
      settings: { foreground: '#EE80D8' },
    },
    {
      name: 'Attributes',
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#FFA66F' },
    },
    {
      name: 'CSS Selectors',
      scope: ['meta.selector'],
      settings: { foreground: '#aa88ff' },
    },
    {
      name: 'Units',
      scope: ['keyword.other.unit'],
      settings: { foreground: '#ffee44' },
    },
    {
      name: 'Escape Characters',
      scope: ['constant.character.escape', 'constant.character'],
      settings: { foreground: '#44ddff' },
    },
    {
      name: 'Decorators / Annotations',
      scope: [
        'meta.decorator',
        'meta.annotation',
        'punctuation.decorator',
        'storage.type.annotation',
        'entity.name.function.decorator',
      ],
      settings: { foreground: '#88aaff' },
    },
    {
      name: 'Invalid',
      scope: ['invalid.illegal'],
      settings: { foreground: '#0818a0', background: '#ff5555' },
    },
  ],
};
