# Deferred Decisions
This doc is for decisions we are intentionally putting a pin in.

"Put a pin in it" means: do not solve this right now, but do not let it vanish into the chat history either. Capture the question, the current context, and the moment when it should be revisited.

This is not a backlog for ordinary tasks. Use it for product, content, design, architecture, or process decisions where the right answer depends on future visual QA, real content, user feedback, or another spike landing first.

Keep entries brief and plain. When a pinned decision becomes active work, move the concrete tasks into the relevant spike todo doc or `TODO.md`, then delete traces of that work from this doc. We want this doc to remain relatively short and clean, not maintain a long history of every single thing that was ever pinned.

## Current Pins
### Animated Title Wrap Hardening
Pinned: 2026-06-23

Decision deferred: whether to add dedicated line/word measurement for titles that participate in featured-media transitions.

Current context: final transition QA is passing, and the new writing archive composition removed the last observed writing title-wrap shiver from the active transition spike. The remaining guidance is to align source/target typography and width first.

Revisit when: a specific future card/list/nav-to-detail title pair visibly shivers after its source and target typography have already been aligned.
