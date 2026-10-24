# Local CMS Security — Tasks
attention: live
## Background
The running PHP 8.3.31 predates the critical October fixes. Public core is 7.1.3, QA core 7.1.2; dependency defaults are older than the installed versions.
## General Principles
Keep credentials, database exports and licensed plugin packages outside Git. Back up before mutation and verify the runtime after restart. Do not expose WordPress to the LAN or deploy the public site.
## Current State Overview
Both instances run WordPress 7.1.3 and PHP 8.3.36. All installed third-party plugins are current as checked 2026-10-24. Normal host source mounts are read-only; uploads remain writable and non-executable. One-off maintenance is documented in `docs/cms-security.md`. Default administrator and application/root database credentials were rotated in both instances; private environment and persisted configuration are aligned. No public deployment.

## To Do
## Ready For Human QA
- Confirm normal Gutenberg editing and a real media upload after logging back in if needed. CLI/HTTP checks pass; no visual editor check is claimed.
## Done
- Patch PHP and update WordPress/plugins from their official sources. — Completed: PHP 8.3.36, WordPress 7.1.3, WPGraphQL 2.25.0, Content Blocks 4.8.9 and ACF Pro 6.8.10 on both instances. The private ACF bootstrap package is also refreshed.
- Restrict host writes and unnecessary PHP/HTTP entry points while retaining authoring. — Completed: read-only host source, separate uploads, PHP/upload-progress safeguards, disabled browser code modifications and XML-RPC, narrower service environments, no-new-privileges and NET_RAW removal. Generated replacements for default credentials are retained privately; no secret values enter Git.
- Verify versions, integrity, GraphQL, uploads, local bindings and restart persistence; document maintenance. — Core checksums, WPGraphQL checksums, Apache config/runtime, worker source-write denial, uploaded-PHP denial, ordinary uploads, both GraphQL block queries, database checks and recreation pass. PHP verified through Apache as well as CLI. Home, Side Projects and Building Enzo return HTTP 200 with one h1 after starting the local frontend. Project checks pass with two existing v-html warnings. Core checksums report only the known Docker wp-config-docker.php extra file. Maintenance and limits documented; interactive editor QA remains for the user.
- Back up both CMS databases/uploads and installed plugin files before changes. — Completed 2026-10-24 under ignored `.backups/cms/`. Fresh public and QA content backups also completed after hardening; private recovery storage is owner-only.
