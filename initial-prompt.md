## Portfolio site implementation spec
### 1) Project goal
Build a **headless WordPress + Nuxt portfolio site** with these characteristics:

- **Public frontend:** Vue app built with **Nuxt**
- **Rendering:** **SSR enabled** for SEO, first-load performance, and readable initial HTML
- **Navigation feel:** SPA-like client-side routing with page transitions and room for shared-element transitions
- **CMS/admin:** **WordPress headless**
- **Content authoring:** Gutenberg editor
- **Block rendering:** Gutenberg blocks must be translated into **Vue components**, not dumped as one big HTML blob
- **Tooling:** **Vite**, **ESLint**, **Prettier**, **SCSS**
- **Infra:** local-first in **Docker Compose**; optional DDEV later, but Docker Compose is the source of truth
- **Hosting target:** easy deployment to a **Vultr Ubuntu VPS** using Docker Engine / `docker compose`
- **Design:** I will handle the design, and most of the manual styling. I want you to help me build the back of the frontend, and the backend. I will handle the front of the frontend. Design work should all be pretty minimal and unopinionated.

### 2) Architectural decision
Use **Docker Compose as the canonical environment** for both local development and VPS deployment.

Do **not** make DDEV the canonical runtime. DDEV is a strong local tool and supports PHP and Node, but its own docs position it as a **local development solution**, not the primary deployment mechanism. Hosting with DDEV exists, but DDEV says deployment/hosting is not its main purpose and that hosting with DDEV is experimental. Vultr, by contrast, documents standard Docker deployment on Ubuntu 24.04.

So the rule is:

- **Canonical source of truth:** Docker Compose
- **Optional local convenience layer:** DDEV later, only if useful
- **Production on Vultr:** same container model, not “DDEV in production”

### 3) Core stack
#### Frontend
- Nuxt 3
- Vue 3
- SSR enabled
- Vite
- SCSS
- ESLint
- Prettier

Nuxt is the right frontend because it uses **Vite by default**, has **SSR out of the box**, and supports **page and layout transitions** with hooks for more advanced animation. Nuxt also supports prerendering and hybrid rendering later if useful.

#### CMS
- WordPress
- Gutenberg editor
- WPGraphQL
- WPGraphQL Content Blocks
- ACF Pro only for structured metadata where needed
- WPGraphQL for ACF if ACF fields are used

WPGraphQL by itself exposes block-editor content as rendered HTML when querying `content`, while **WPGraphQL Content Blocks** exposes Gutenberg blocks in a more structured way, including nested/flat block handling. **WPGraphQL for ACF** supports both ACF Free and Pro.

### 4) High-level system design
Use four services:

- **proxy**: reverse proxy for local and production routing
- **frontend**: Nuxt SSR app
- **cms**: WordPress admin/API
- **db**: MariaDB

Suggested public routing:

- `https://yourdomain.com` → Nuxt frontend
- `https://cms.yourdomain.com` → WordPress admin + GraphQL endpoint

Suggested local routing:

- `http://portfolio.localhost` → Nuxt
- `http://cms.portfolio.localhost` → WordPress

Nuxt is the public website. WordPress is the authoring backend and content API. WordPress is **not** the public presentation layer. The WordPress REST API is explicitly meant to support separate frontend applications, and WPGraphQL is appropriate here because the requirement is structured block/component rendering rather than plain HTML content fetches.

### 5) Rendering strategy
#### Frontend rendering
- Keep **Nuxt SSR on**
- Initial implementation should run as a normal SSR Node app
- Later, optionally prerender stable routes such as `/`, `/about`, or certain archives

Reason: Nuxt’s SSR gives real HTML on first load, which helps SEO, accessibility, and perceived performance. Nuxt also supports static prerendering and hybrid route rules, so the project can evolve later without changing frameworks.

#### Page transitions
- Use Nuxt page/layout transitions for baseline behavior
- Add shared-element transitions later via native View Transitions and/or JS animation hooks
- Build for graceful degradation, not browser-perfect magic on day one

Nuxt’s transitions system supports global and per-page transitions, and its docs explicitly allow JavaScript hooks for advanced custom transitions.

### 6) Gutenberg-to-Vue rendering model
This is a hard requirement:

**Do not render the post body by injecting one giant `content` HTML string into a single Vue component.**

Instead:

1. Query structured blocks from WordPress using:
   - **WPGraphQL**
   - **WPGraphQL Content Blocks**
2. Reconstruct block hierarchy if needed
3. Render blocks through a **Vue block registry**

Example concept:
- `core/paragraph` → `ParagraphBlock.vue`
- `core/heading` → `HeadingBlock.vue`
- `core/image` → `ImageBlock.vue`
- `core/gallery` → `GalleryBlock.vue`
- `core/quote` → `QuoteBlock.vue`
- `core/list` → `ListBlock.vue`
- `core/group` → `GroupBlock.vue`
- `core/columns` → `ColumnsBlock.vue`
- `core/column` → `ColumnBlock.vue`
- `core/cover` → `CoverBlock.vue`
- `core/spacer` → `SpacerBlock.vue`
- custom portfolio blocks → first-class Vue components

WPGraphQL Content Blocks supports querying flattened block lists and reconstructing hierarchy using `clientId` / `parentClientId` and `flatListToHierarchical`.

#### Fallback rule
Unknown blocks should not break the page.
Fallback behavior:
- render the individual unsupported block with a generic `UnsupportedBlock.vue`
- allow sanitized per-block HTML fallback if necessary
- log the unsupported block name in development
- never fall back to dumping the entire post body as one raw HTML blob

### 7) Content modeling
Use Gutenberg for body content. Use ACF sparingly for structured metadata only.

Recommended content types:

- **post** → writing/blog posts
- **project** or **case_study** → portfolio case studies
- **page** → about, contact, resume, etc.

Use ACF only for fields like:

- project summary
- role
- year
- collaborators
- tools
- outcomes
- external links
- hero metadata
- featured quote
- related content

If ACF is used, expose only necessary field groups to GraphQL. WPGraphQL for ACF adds ACF field groups to the schema when configured to show in GraphQL.

### 8) Styling strategy
Do **not** try to make WordPress editor styling match the full frontend.

Instead, share only the style primitives that matter.

Create a shared SCSS package:

```
/packages/styles
  _tokens.scss
  _mixins.scss
  _typography.scss
  _content-primitives.scss
  _media.scss
  _alignments.scss
```

Consume that package in two places:

- **Nuxt frontend**
- **WordPress block/editor plugin**

What should be shared:

- design tokens
- spacing scale
- typography scale
- mixins
- content primitives
- block alignment semantics like `alignleft`, `alignright`, `alignwide`, `alignfull`

What should not be shared wholesale:

- full page layout
- editor chrome
- frontend-only motion/layout systems

This matches how WordPress editor styles work: editor and frontend styling are related but not identical, block styles and user-applied styles are serialized into block markup, and alignment support is handled through block supports.

### 9) WordPress custom blocks
Custom blocks should live in a **plugin**, not a theme.

WordPress’s own block docs recommend pairing blocks with plugins rather than themes so blocks keep working when themes change.

Implementation rules:

- use `block.json` metadata per block
- allow alignment support only where appropriate
- support only a small, intentional block set
- use custom blocks only where Gutenberg core blocks are insufficient

Build system for blocks:

- use a **custom Vite-based build**, not `wp-scripts`
- generate JS/CSS bundles plus a manifest
- write a PHP helper to enqueue built assets in the editor
- keep the build pipeline simple and explicit

Note: this intentionally departs from WordPress’s officially supported `create-block` / `wp-scripts` path, which is webpack-based. That is acceptable here because the project preference is Vite and WordPress is only the CMS/editor side.

### 10) Repo structure
```
repo/
  docker/
    compose.yaml
    compose.dev.yaml
    compose.prod.yaml
    .env.example

  apps/
    frontend/
      app.vue
      nuxt.config.ts
      pages/
      components/
      components/blocks/
      composables/
      assets/scss/
      plugins/
      server/
      package.json

    cms/
      wp-content/
        themes/
          portfolio-editor-theme/
        plugins/
          portfolio-blocks/
          project-bootstrap/
      Dockerfile
      scripts/

  packages/
    styles/
      _tokens.scss
      _mixins.scss
      _typography.scss
      _content-primitives.scss
      _media.scss
      _alignments.scss

  .editorconfig
  .eslintrc or eslint.config.js
  prettier.config.js
  package.json
  README.md
```

### 11) Local development workflow
#### Local startup
One command should stand up the stack:

```
docker compose -f docker/compose.yaml -f docker/compose.dev.yaml up --build
```

#### Expected local behavior
- WordPress admin reachable
- GraphQL endpoint reachable
- Nuxt dev/SSR app reachable
- shared Docker network resolves service names
- hot reload for frontend
- watch/build for custom block plugin

#### WordPress bootstrap
The coding agent should create an automated first-run bootstrap that:

- installs WordPress
- activates WPGraphQL
- activates WPGraphQL Content Blocks
- optionally activates ACF Pro if license/env is available
- seeds minimal sample content

### 12) Production deployment on Vultr
Deploy to a Vultr Ubuntu 24.04 VPS using Docker Engine and `docker compose`.

Production should run:

- reverse proxy
- Nuxt SSR container
- WordPress container
- MariaDB container
- named volumes for WordPress uploads and DB data

The same Docker architecture should work locally and on Vultr with different env files and compose overrides. Vultr documents Docker Engine installation and container deployment on Ubuntu 24.04.

### 13) Code quality rules
- **ESLint** for JS/TS/Vue
- **Prettier** for formatting
- one shared root config where possible
- SCSS linting optional later
- CI should run:
  - frontend lint
  - block/plugin lint
  - typecheck
  - production build

### 14) Acceptance criteria
-  `docker compose up --build` starts the full stack locally
-  Nuxt serves SSR HTML on first request
-  WordPress is reachable only as CMS/admin/API, not as the primary public site
-  Gutenberg content is fetched as structured block data, not only as one rendered HTML string
-  At minimum, these blocks map to Vue components: paragraph, heading, image, quote, list, group, columns, column, gallery, cover, spacer
-  Unknown blocks fail gracefully at block level
-  Shared SCSS primitives are imported by both Nuxt and the WordPress block/editor code
-  Frontend supports Nuxt page transitions
-  ACF metadata can be queried if enabled
-  Production can be brought up on a Vultr VPS with Docker Compose and env configuration only

### 15) Defaults the coding agent should assume
- Prefer **WPGraphQL + WPGraphQL Content Blocks** over custom REST parsing
- Prefer **Docker Compose** over DDEV as the project baseline
- Prefer **custom blocks in a plugin**
- Prefer **shared SCSS primitives**, not full style parity
- Prefer **SSR-first Nuxt**
- Prefer **minimal ACF usage**
- Prefer **explicit, typed block-to-component mapping**
- Do not optimize for perfect editor/frontend visual parity
