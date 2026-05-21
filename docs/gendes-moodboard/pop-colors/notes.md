# Pop Colors — branch notes

Branch: `gendes-pop-color.cc`. Brief: `docs/gendes-brief.md`.

Direction in one line: **risograph poster maximalism + psychedelic op-art + neon-on-black, mixed light/dark by section** — joy as a design value, ambition over restraint.

Dialects in the board, and how we use them:

- **Riso / screenprint maximalism** (KISS mag cover, Pepsi sticker-bomb, Weltform, COART, Midweek Mayhem, Summer Salt) — the spine. Overprinted spot inks, halftone dots, misregistration, ALL-CAPS headlines, mono "spec text" labels.
- **Psychedelic / op-art** (mano-dharma, Plastics Nomadic Orchestra) — radial/conic ray fields used as section dividers and chrome, never under body copy.
- **Neon-on-black** (In the Name of Art) — the footer and at least one homepage section glow on near-black.
- **Flat bold vector** (Malika Favre pool series, Wild in der Küche) — the discipline underneath, so loud layouts still resolve.

Key implementation idea: derive ink/surface alpha tokens from base `--color-ink` / `--color-surface`, then implement section worlds as `.skin-*` classes that remap only the bases. Print texture (halftone + grain + op rays) is pure CSS for static-generation safety.

Mood-board media in this folder is gitignored; this notes file is intentionally tracked.
