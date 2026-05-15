# Shop

## Intent

Eventually replace the current Shopify-based shop with a WooCommerce-backed shop that shares the project's WordPress + Nuxt architecture.

## Key constraints

- Far future — not a near-term priority
- Shop subdomain likely `shop.aslanfrench.work` (or similar); preserve this pattern in Caddy config planning
- Should not over-couple commerce to the editorial site
- Static generation is not appropriate for a shop (cart, checkout, and auth are inherently dynamic)
- WooCommerce + WPGraphQL for cart/checkout needs evaluation — maturity and headless support are unclear

## Open questions

- WooCommerce REST vs. GraphQL for cart and checkout from Nuxt?
- Should the shop be a separate Nuxt app or share the current frontend monorepo?
- Payment: Stripe via WooCommerce, or a simpler hosted checkout?
- How does this interact with the existing Docker Compose + Caddy infrastructure?

## Rough work items

- Research WooCommerce + WPGraphQL data access patterns for a headless frontend
- Decide shop architecture (shared vs. separate Nuxt app)
- Plan subdomain routing and Caddy config
- Prototype cart/checkout flow
