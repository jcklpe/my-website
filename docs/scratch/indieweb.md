# IndieWeb

Note: check maggie appletons implementation of mentions around the web for a model of how it could work

## Intent

Explore adding IndieWeb protocols to the site — primarily microformats and webmentions — to participate in the open web social graph.

## Key constraints

- **Static deploy compatibility**: webmention *receiving* requires a server-side endpoint. Not directly compatible with a pure static CDN. Would need a third-party service (webmention.io) or a separate lightweight server.
- Webmention *sending* (notifying other sites when you link to them) can be done at publish/deploy time and is compatible with static.
- Microformats (h-card, h-entry) are purely HTML markup additions — fully compatible with static.

## Open questions

- Is webmention receiving worth the added infrastructure complexity?
- Should this wait until the ActivityPub spike is resolved, since they may share infrastructure considerations?
- What is the priority relative to other near-term work?

## Rough work items

- Add h-card microformat markup to the About page
- Add h-entry microformat markup to writing post detail pages
- Evaluate webmention.io or Bridgy for receiving mentions without a custom server
- Add webmention sending to the deploy workflow if desired
- Research whether a WordPress IndieWeb plugin could handle some of this at the CMS level
