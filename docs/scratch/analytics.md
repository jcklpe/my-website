# Analytics

## Intent

Add privacy-respecting analytics to understand site traffic and content engagement without surveillance-style tracking.

## Preferences

- Prefer self-hosted or privacy-first options (Matomo, Plausible, Fathom) over Google Analytics
- Should work with the static CDN deploy model (client-side script is fine; server-side events are not available in static mode)
- Minimize cookie consent friction — ideally cookieless

## Open questions

- Self-hosted (Matomo on the same VPS) vs. a hosted service (Plausible, Fathom)?
- What events matter beyond pageviews? (external link clicks, writing scroll depth, case study engagement)
- Does analytics interact badly with any CSP headers on the CDN?

## Rough work items

- Decide provider
- Add analytics script to Nuxt app (likely a plugin or `useHead` in `app.vue`)
- Verify it does not break static deploy or CSP
- Document setup in README or ops docs
