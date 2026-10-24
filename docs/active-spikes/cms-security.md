# Local CMS Security
attention: live
## Purpose
Patch the local WordPress/PHP stack following the October 2026 PHP remote-code-execution advisories, and reduce the damage a compromised CMS process could do to the host. The public website remains static; no CDN deployment is involved.
## Approach
Back up both CMS databases/uploads and installed plugins before updates. Verify actual running PHP and WordPress versions rather than trusting image tags or repository defaults. Update supported vendor packages, retain loopback-only ports, disable session upload progress, prevent execution from uploads and browser-based source modification, and mount host CMS source read-only during normal service. Keep plugin maintenance explicit and offline through a one-off container. Preserve GraphQL, Gutenberg authoring and uploads.
## Limits
Containers and local bindings reduce exposure but do not prove the host cannot be compromised. This is a bounded patch/containment review, not a forensic audit or an OS/Docker security certification.
## Sources
- https://www.php.net/archive/2026.php#2026-10-21-5
- https://developer.wordpress.org/advanced-administration/security/hardening/
- https://github.com/wpengine/wp-graphql-content-blocks/releases/tag/v4.8.6

## Outcome — 2026-10-24
Both CMS instances now use the patched baseline and normal read-only source mounts. Runtime checks confirmed the safeguards and exposed historical credential drift; actual default administrator, database application and root passwords were replaced and persisted configuration aligned. Public and QA content backups exist before and after changes, with plugin and private configuration recovery material in ignored storage. The active PHP runtime is patched, but this is not evidence of a complete historical compromise assessment. Durable procedures and remaining boundaries are in `docs/cms-security.md`.
