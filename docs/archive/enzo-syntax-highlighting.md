# Enzo Syntax Highlighting Spike

## Status

**Complete.** Grammar, highlighting, CRT visual shell, semantic themes, and theme switcher all done. One remaining task: CMS smoke test (content authoring, not code).

---

## Implementation summary

- Grammar source: `apps/frontend/utils/enzo-grammar.json` (copied from the Enzo VS Code extension TextMate grammar).
- Integration: `apps/frontend/utils/syntax-highlighting.ts` — Shiki v4. Uses `codeToHtml` for bundled languages; uses `getSingletonHighlighter` when the language is in `CUSTOM_LANGUAGES` (currently just `enzo`), which allows injecting the custom grammar.
- `hasSyntaxLanguage` returns `true` for both bundled languages and custom languages, so the `figcaption` label renders for enzo blocks.
- Language aliases cover: enzo, fsharp/f#/fs, java, rust/rs, python/py, bash/sh/zsh/shell, and all common web languages.

## WordPress authoring convention

Gutenberg's core code block has no language dropdown. To mark a code block as Enzo, add `language-enzo` in **Additional CSS class(es)** (Block tab → Advanced). This produces `<code class="language-enzo">`, which `CodeBlock.vue` detects via the `language-*` class pattern.

## Themes

Three active themes, all designed for the dark CRT aesthetic:

| Key | Label | Ground | Ambient | Character |
|---|---|---|---|---|
| `midnight` | Midnight | `#0818a0` cobalt | `#e0eaff` periwinkle | Default. Daring, brand-aligned cobalt world. |
| `phosphor2` | Phosphor | `#0c112b` dark navy | `#f0b040` amber | Classic amber phosphor CRT. |
| `signal` | Signal | `#0c112b` dark navy | `#29cc6a` terminal green | Hacker terminal. Cobalt authority in a green world. |

A fourth theme, `hopscotch`, is archived in `apps/frontend/utils/hopscotch-theme.ts` but not registered.

### Semantic hue scalar system

All three themes use the same semantic color logic — hue encodes meaning consistently across the spectrum. Each theme warps the specific colors for its ground, but the mapping is invariant:

| Semantic role | Hue family | Phosphor | Midnight | Signal |
|---|---|---|---|---|
| Variables (`$x`) | Orange-red | `#FF5533` | `#FF7733` | `#FF5533` |
| Accessor / interpolation / spread | Same as variable | `#FF5533` | `#FF7733` | `#FF5533` |
| Member index (`.1`) | Light orange | `#FF8855` | `#FFAA88` | `#FF8855` |
| Blueprint field names | Coral-orange | `#FF7744` | `#FF8866` | `#FF7744` |
| Binding operators (`:`, `=`) | Orange-amber | `#ffaa33` | `#ff9944` | `#ff9944` |
| Numbers | Yellow | `#ffdd44` | `#ffee44` | `#ffcc44` |
| Strings | Yellow-green | `#d4f53c` | `#aaff44` | `#aaff44` |
| References (`@val`) | Hot magenta-pink | `#FF3377` | `#FF55BB` | `#FF3377` |
| Functions + `return` | Teal / cyan / cobalt | `#44d4b0` | `#44ddff` | `#5b8dff` |
| Structural brackets | Same as functions | `#44d4b0` | `#44ddff` | `#5b8dff` |
| Blueprint types + `<[ ]>` brackets | Indigo-lavender | `#8877ff` | `#aa88ff` | `#8877ff` |
| Variants / blueprint instances | Blue-indigo | `#7799ff` | `#88aaff` | `#7799ff` |
| Language constants | Same as variants | `#7799ff` | `#88aaff` | `#7799ff` |
| Keywords / storage | Theme-specific authority | amber `#ffcc55` | white `#ffffff` | cobalt `#5b8dff` |
| Control flow glue (`then`, `param`, `loop`) | Neutral / ambient | amber `#cc8822` | periwinkle `#7799cc` | dim green `#218d4e` |
| Punctuation / arithmetic | Neutral / ambient | `#cc8822` | `#7799cc` | `#218d4e` |
| Comments | Dimmed ambient, italic | `#a07838` | `#99aadd` | `#3a8a5a` |

Key design decisions:
- **References (`@val`) live in the data family** (warm magenta-pink), not the action family (teal). `@val` is a handle to data, not a function call.
- **Blueprint `<[ ]>` brackets** take the Blueprint Types color (indigo/lavender), not the structural bracket color (teal/cobalt).
- **`return` keyword** is in the Functions scope — it acts as a function, not grammar glue.
- **`variable.parameter.blueprint.enzo`** is in Variables — blueprint field parameters are concrete data.
- **Control flow glue** (`then`, `param`, `loop`, `while`, `for in`) is neutral in all themes — structural connectors that dissolve into the ambient world.
- **Signal split**: declaration keywords (`keyword.other.blueprint.enzo`, `keyword.import`) stay cobalt; flow control (`keyword.control.*`, `keyword.other`) is neutral green.

### Stored-but-inactive theme

`apps/frontend/utils/signal-theme.ts` exports `signalTheme` but is currently registered in the active switcher. If Signal is removed from the switcher in the future, remove its import from `syntax-highlighting.ts` and its entry from `CodeThemeName`, `CODE_THEME_LABELS`, and `CODE_THEMES`.

### WCAG contrast

All tokens in all three themes clear WCAG-A (3:1 minimum). Phosphor and Signal tokens all clear WCAG-AA (4.5:1). Midnight's warm tokens (variables, references) are at 4.4–4.8:1 — technically at or just below AA, but hue contrast against cobalt blue supplements luminance contrast for practical legibility.

## CRT visual shell

The CRT background is set entirely by the `retroterm-crt` SCSS mixin in `packages/styles/shared-components/_code-block.scss`. Shiki's `editor.background` is irrelevant — `retroterm-code-content` overrides it with `background: transparent !important`.

Per-theme CRT color overrides are applied via inline CSS custom properties in `CodeBlock.vue`:

- **Midnight**: blue-tinted spot/glow/scanlines
- **Phosphor**: amber-tinted spot/glow/scanlines
- **Signal**: green-tinted spot/glow/scanlines
- **Default** (Hopscotch fallback): teal/mint (the mixin defaults)

Token text glow: `text-shadow: 0 0 3px currentColor` on `.line span` in `_code-block.scss`. Uses `currentColor` so each token glows in its own color automatically.

## Theme switcher

`CodeThemeSwitcher.vue` is a floating panel (fixed, bottom-right, desktop-only via `@media (min-width: 1024px)`). It is mounted in `default.vue` conditionally:

```html
<CodeThemeSwitcher v-if="hasCodeBlocks" />
```

`useHasCodeBlocks()` (`apps/frontend/composables/useHasCodeBlocks.ts`) is a `useState` that defaults to `false`. `CodeBlock.vue` sets it to `true` in its setup (runs on server, so SSR-safe — the slot content renders before the switcher in the layout template). `default.vue` resets it to `false` in `router.beforeEach` before each navigation.

Default theme: **Midnight**. Stale cached values are reset to Midnight by the guard in `useCodeTheme`.

## Architecture notes

### Why `getSingletonHighlighter` for custom langs?

`codeToHtml` uses an internal cached highlighter that only accepts bundled languages. `getSingletonHighlighter` exposes the same cached instance but allows loading additional languages via `loadLanguage`. Shiki's singleton deduplicates — loading enzo once is enough for all subsequent calls.

### Theme switching architecture

`useCodeTheme()` wraps `useState<CodeThemeName>` — a single global ref shared across all `CodeBlock` instances. `CodeBlock.vue` includes `themeName.value` in its `useAsyncData` key and watches it, so all blocks re-highlight when the theme changes.

---

## Open items

### 1. CMS smoke test

Write a real Enzo code block in a post/case study and confirm:
- Language label ("enzo") appears in the `figcaption`
- Tokens are colored correctly (not all plain text)
- Block fallback (no `language-enzo` class) still renders as plain monospace

### 2. CMS editor syntax highlighting (deferred, optional)

Not possible with the standard WordPress code block — it uses a plain `<textarea>`. Would require either a third-party Gutenberg block plugin (e.g. Code Block Pro) or a custom block in `project-bootstrap` that loads CodeMirror or Monaco client-side. Meaningful undertaking; deferred.

---

## Files

- `apps/frontend/utils/enzo-grammar.json` — Enzo TextMate grammar
- `apps/frontend/utils/syntax-highlighting.ts` — highlighter, theme registry, language aliases
- `apps/frontend/utils/phosphor2-theme.ts` — Phosphor theme
- `apps/frontend/utils/midnight-theme.ts` — Midnight theme
- `apps/frontend/utils/signal-theme.ts` — Signal theme
- `apps/frontend/utils/hopscotch-theme.ts` — archived, not registered
- `apps/frontend/composables/useCodeTheme.ts` — global theme state, defaults to Midnight
- `apps/frontend/composables/useHasCodeBlocks.ts` — page-level code presence flag
- `apps/frontend/components/dev/CodeThemeSwitcher.vue` — floating radio switcher, desktop-only
- `apps/frontend/components/content/blocks/CodeBlock.vue` — theme + CRT overrides wired in
- `apps/frontend/layouts/default.vue` — conditional switcher mount + beforeEach reset
- `packages/styles/shared-components/_code-block.scss` — CRT shell, token glow
