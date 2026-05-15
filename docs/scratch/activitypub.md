# ActivityPub

## Intent

Explore adding ActivityPub support so the site can participate in the Fediverse — allowing followers to receive new posts through Mastodon and compatible clients.

## Key constraints

- **Static deploy compatibility**: ActivityPub requires dynamic server-side endpoints (actor JSON, inbox, outbox). This is fundamentally incompatible with a pure static CDN deployment.
- Any implementation would require one of: a separate lightweight server or serverless function, the WordPress ActivityPub plugin handling federation at the CMS level, or a third-party bridging service.
- The `automattic/wordpress-activitypub` WordPress plugin exists and is actively maintained — worth evaluating for a headless setup.

## Open questions

- Is the WordPress ActivityPub plugin the right approach, or should this be a Nuxt/frontend-side feature?
- If CMS-side: WordPress handles federation and the ActivityPub actor URL would point to the CMS domain, not the Nuxt frontend. Is that acceptable?
- Does this need to wait until there is a real dynamic server path (non-static) for the public frontend?
- Priority relative to other work?

## Rough work items

- Research the WordPress ActivityPub plugin and its behavior in a headless architecture
- Decide whether to pursue CMS-side or frontend-side implementation
- Prototype before committing to an approach
