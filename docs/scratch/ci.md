# CI

## Intent

Add continuous integration for the frontend: lint, typecheck, and production build checks on every push or pull request.

## Key constraints

- Repo is on GitHub; GitHub Actions is the natural choice
- `corepack pnpm check` covers lint + typecheck + editor CSS regeneration — this is the baseline gate
- Production build (`corepack pnpm build`) and static generation (`corepack pnpm static:generate`) both require a running CMS for data; CI build may need to mock or skip the WordPress data fetch
- Node 22 and pnpm 10.18.3 are pinned; CI must respect these via `.nvmrc` and the `packageManager` field

## Open questions

- Should CI run a full production SSR build, a static generate, or just lint + typecheck?
- How should the CMS dependency be handled in CI? Options: mock GraphQL responses, skip data fetching, or spin up a test WordPress instance via Docker
- Branch protection: block merges on lint/typecheck failure?

## Rough work items

- Add `.github/workflows/ci.yml`
- Set up Node + pnpm with corepack in the workflow
- Run `corepack pnpm check` as the baseline gate
- Decide on build/generate step and implement if desired

---

## Developer Convenience Commands

### Single startup command

There's currently no single command to start the public CMS server, the QA/preview server, and the Nuxt frontend all at once. A `dev:all` or `start:all` script in `package.json` that uses `concurrently` or similar to start all three in one terminal would significantly reduce friction during authoring/development sessions.

### Single deploy command

No single command exists to generate the static site and push it to the CDN in one step. A `deploy` or `publish` script that runs static generation followed by the Bunny upload and cache purge would make the publish workflow less error-prone.

These belong in `package.json` scripts, not CI — they're local developer ergonomics. CI automation is separate (see above).
