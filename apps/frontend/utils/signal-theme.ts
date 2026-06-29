import type { ThemeRegistration } from 'shiki';

// Signal: dark navy ground (#0c112b). Terminal green is the WORLD.
//
// Semantic hue scalar warped for the hacker terminal green aesthetic:
//   WARM half (data): orange-red vars | hot-magenta refs | orange binding | amber numbers | yellow-green strings
//   COOL half (structure): brand cobalt functions+brackets+keywords | indigo abstract types | blue-indigo concrete variants
//   NEUTRAL: dim green punctuation + arithmetic (structural noise blends into the terminal world)
//   FLOW: lit terminal green, above comments/punctuation but below cobalt declaration authority
//
// References (@val) are adjacent to variables in the data family — same logic as Phosphor2 and Midnight.
// Cobalt is the "authority" color in the green world: functions, brackets, and grammar keywords all use it.
// Comment ~4.6:1 on #0c112b.
export const signalTheme: ThemeRegistration = {
  name: 'signal',
  type: 'dark',
  colors: {
    'editor.background': '#0c112b',
    'editor.foreground': '#29cc6a',
    'editor.selectionBackground': '#218d4e44',
    'editor.lineHighlightBackground': '#218d4e08',
  },
  tokenColors: [
    {
      name: 'Comments',
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#3a8a5a', fontStyle: 'italic' },
    },

    // ─── Neutral structural noise — dim green fades into the terminal world ───
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
      settings: { foreground: '#218d4e' },
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
      settings: { foreground: '#218d4e' },
    },
    {
      name: 'Type Connectors (or / and)',
      scope: ['keyword.other.or.enzo', 'keyword.other.and.enzo'],
      settings: { foreground: '#218d4e' },
    },

    // ─── Structural brackets — cobalt, authority in the green world ───────────
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
      settings: { foreground: '#5b8dff' },
    },

    // ─── Binding operators — orange, between variable-red and number-amber ────
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
      settings: { foreground: '#ff9944' },
    },

    // ─── Control flow words — lit terminal green, readable structural glue ───
    // then, param, loop, while, for in, if, else, etc. — these connect parts of
    // an expression but don't declare anything. They should read as language
    // syntax, not comments, while staying below cobalt declaration authority.
    {
      name: 'Control Flow Keywords',
      scope: [
        'keyword.control',
        'keyword.control.flow.enzo',
        'keyword.control.param.enzo',
        'keyword.control.enzo',
        'keyword.other',
      ],
      settings: { foreground: '#44d47a' }, // 9.7:1 on #0c112b
    },

    // ─── Declaration keywords — cobalt, structural authority ──────────────────
    // These create or name things (import modules, declare blueprints, storage types).
    // More specific scopes win over the neutral keyword.other rule above.
    {
      name: 'Declaration Keywords',
      scope: [
        'keyword.other.blueprint.enzo',
        'keyword.import',
        'keyword.package',
      ],
      settings: { foreground: '#5b8dff' },
    },
    {
      name: 'Storage modifiers',
      scope: ['storage.type', 'storage.modifier', 'storage'],
      settings: { foreground: '#5b8dff' },
    },

    // ─── Variables — orange-red, most concrete data noun ─────────────────────
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
      settings: { foreground: '#FF5533' },
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
      settings: { foreground: '#FF5533' },
    },

    // ─── Member index (.1) — lighter orange, sub-variable family ─────────────
    {
      name: 'Member Index (sub-variable)',
      scope: ['variable.other.property.numeric.enzo'],
      settings: { foreground: '#FF8855' },
    },

    // ─── Reference values (@val) — hot magenta-pink, data-adjacent ───────────
    {
      name: 'Reference Values',
      scope: [
        'variable.other.reference.enzo',
        'keyword.operator.reference.enzo',
        'keyword.operator.function-reference.enzo',
      ],
      settings: { foreground: '#FF3377' },
    },

    // ─── Functions + return — cobalt, same family as structural brackets ───────
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
      settings: { foreground: '#5b8dff' },
    },

    // ─── Abstract type containers (Status-Effect, Enemy) — indigo ────────────
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
      settings: { foreground: '#8877ff' },
    },

    // ─── Blueprint field names — red-magenta, distinct from variables ─────────
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
      settings: { foreground: '#FF6A9A' },
    },

    // ─── Variants + Blueprint names/delimiters — blue-indigo ─────────────────
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
      settings: { foreground: '#7799ff' },
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
      settings: { foreground: '#7799ff' },
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

    // ─── Numbers — amber-yellow, precise literal ──────────────────────────────
    {
      name: 'Numbers',
      scope: [
        'constant.numeric',
        'constant.numeric.enzo',
        'constant.numeric.integer',
        'constant.numeric.float',
        'constant.numeric.hex',
      ],
      settings: { foreground: '#ffcc44' },
    },

    {
      name: 'Tags',
      scope: ['entity.name.tag'],
      settings: { foreground: '#FF3377' },
    },
    {
      name: 'Attributes',
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#ff9944' },
    },
    {
      name: 'CSS Selectors',
      scope: ['meta.selector'],
      settings: { foreground: '#8877ff' },
    },
    {
      name: 'Units',
      scope: ['keyword.other.unit'],
      settings: { foreground: '#ffcc44' },
    },
    {
      name: 'Escape Characters',
      scope: ['constant.character.escape', 'constant.character'],
      settings: { foreground: '#5b8dff' },
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
      settings: { foreground: '#7799ff' },
    },
    {
      name: 'Invalid',
      scope: ['invalid.illegal'],
      settings: { foreground: '#0c112b', background: '#ff5555' },
    },
  ],
};
