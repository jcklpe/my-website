# Local CMS Security And Maintenance
## Runtime Boundary
The public website is static. Local WordPress runs in Docker with Apache/PHP, and both CMS ports plus the development Caddy port bind only to `127.0.0.1`. Do not use the production Compose overlay for local authoring; it publishes ports on all interfaces. Phone previews expose Nuxt, not WordPress administration.

Normal CMS containers mount host `wp-content` read-only, with a separate writable uploads mount. The Docker socket, repository root and user home are not mounted. Apache denies PHP-like uploads, ignores uploaded `.htaccess` files, and disables PHP execution in uploads. XML-RPC, configuration-file requests, directory listing and TRACE are blocked. CMS containers use `no-new-privileges` and drop `NET_RAW`. These reduce exposure and host write access; they do not make a compromised container harmless. CMS database contents and uploads are still writable, and containers retain network access.

PHP disables session upload progress before request parsing, following the October 2026 PHP advisories. Browser-based plugin/theme installation, updates and code editing are disabled. CLI maintenance remains available. WordPress content editing and media uploads remain enabled. Startup fails if bootstrap fails rather than serving an incompletely configured CMS.

The CMS receives only its own database/bootstrap variables, not the entire Docker environment file or database root password. The installer administrator password is removed before Apache starts. Caddy's development environment contains only domain names. Keep the private `docker/.env` owner-readable/writable (`0600`) and out of Git. Changing that file alone does not change existing database users or WordPress passwords: credentials must also be changed in the running application/database and aligned with its persisted configuration.

## Patched Baseline — 2026-10-24
- PHP 8.3.36, from the digest-pinned official `wordpress:7.1.3-php8.3-apache` image. Dockerfile also checks the minimum PHP patch level.
- WordPress 7.1.3 on both local instances. Existing core volumes are independent of the image: rebuilding alone does not update their WordPress files.
- WPGraphQL 2.25.0, WPGraphQL Content Blocks 4.8.9 and ACF Pro 6.8.10. Project plugins and the editor theme are repository-owned code.
- The private ACF bootstrap ZIP was refreshed from the updated vendor-installed package. Keep it current when upgrading ACF; do not commit licensed packages.

Sources: [PHP security advisory and follow-up](https://www.php.net/archive/2026.php), [WordPress hardening](https://developer.wordpress.org/advanced-administration/security/hardening/), [Content Blocks releases](https://github.com/wpengine/wp-graphql-content-blocks/releases).

## Routine Updates
Back up before maintenance with `corepack pnpm backup:cms:public` and `corepack pnpm backup:cms:qa`. Back up installed plugin files separately when updating plugins; the standard content backups contain the database and uploads, not plugin code. Private backups contain credentials and content and must stay outside Git. Restoring an older database can restore weak WordPress administrator passwords; rerun credential checks after a restore.

The two instances share plugin/theme files. Stop both web services while modifying them. Use a one-off maintenance container, which temporarily has writable source mounts but publishes no ports. Never use the maintenance overlay with `up` or `--service-ports`.

```bash
cms=(docker compose -f docker/compose.yaml -f docker/compose.dev.yaml -f docker/compose.cms-dev.yaml)
"${cms[@]}" stop cms cms_dev
"${cms[@]}" -f docker/compose.maintenance.yaml run --rm --no-deps --entrypoint wp cms plugin update --all --allow-root
"${cms[@]}" -f docker/compose.maintenance.yaml run --rm --no-deps --entrypoint wp cms core update --allow-root
"${cms[@]}" -f docker/compose.maintenance.yaml run --rm --no-deps --entrypoint wp cms core update-db --allow-root
"${cms[@]}" -f docker/compose.maintenance.yaml run --rm --no-deps --entrypoint wp cms_dev core update --allow-root
"${cms[@]}" -f docker/compose.maintenance.yaml run --rm --no-deps --entrypoint wp cms_dev core update-db --allow-root
"${cms[@]}" up -d cms cms_dev
```

Check Content Blocks' official GitHub releases separately: its installed update status did not report the available release during this audit. Install the reviewed release ZIP through the same maintenance container. Premium updates require the configured vendor entitlement. Update the bootstrap version pins in `docker/.env.example`, local `docker/.env`, Compose defaults and this baseline after verification; bootstrap never downgrades an already-installed plugin to a pin.

PHP updates require selecting a patched official image tag/digest in `apps/cms/Dockerfile`, updating the minimum-version check if needed, rebuilding both CMS images and recreating both containers. A digest pin makes builds reproducible but deliberately does not follow new patches automatically. Do not treat `docker compose build --pull` against the same digest as a PHP security update.

## First-Time Provisioning
The normal read-only mounts require installing plugins before starting web service on a new checkout/volume. After `corepack pnpm setup:docker-env`, build the CMS images and start the databases, then run bootstrap with writable source in one-off containers:

```bash
cms=(docker compose -f docker/compose.yaml -f docker/compose.dev.yaml -f docker/compose.cms-dev.yaml)
"${cms[@]}" build --pull cms cms_dev
"${cms[@]}" up -d --wait db db_dev
"${cms[@]}" -f docker/compose.maintenance.yaml run --rm --no-deps cms true
"${cms[@]}" -f docker/compose.maintenance.yaml run --rm --no-deps cms_dev true
"${cms[@]}" up -d cms cms_dev proxy
```

## Verification
Check actual PHP through Apache as well as CLI; confirm upload progress is disabled and browser file modifications are blocked. Run WordPress core checksums, WPGraphQL checksums, plugin version/update checks and `apache2ctl configtest`. ACF and GitHub-only plugins need their vendor release provenance rather than assuming WordPress.org checksums exist. The Docker-supplied `wp-config-docker.php` can produce an extra-file warning during core verification.

Confirm that the PHP worker cannot write `wp-content`, plugins or themes, but can write uploads; test uploaded PHP returns 403 and ordinary media still loads, removing test files afterward. Check both GraphQL endpoints, representative frontend routes, CMS login/editor and all loopback port bindings after restart. Review Docker Desktop and macOS updates separately: patching PHP does not update the host or its container runtime.
