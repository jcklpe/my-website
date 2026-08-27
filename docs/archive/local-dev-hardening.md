# Local Development Hardening
This spike tightens the boundary around the local WordPress environments after a repository credential audit found that the development Compose overlays published CMS and Caddy ports on every host interface. The live public site remains the generated Bunny release; this work affects only local Docker development.

## Goals
- Bind public-CMS, QA-CMS, and local Caddy development ports to the loopback interface.
- Keep real local credentials in ignored `docker/.env`.
- Generate private credentials for a new clone instead of encouraging copied public defaults.
- Preserve existing local credentials and WordPress data without rotation.

## Boundaries
- Do not change the production Compose fallback, which is intentionally capable of accepting public traffic.
- Do not rotate established local CMS credentials automatically; manual credential rotation is outside this spike.
- Do not overwrite an existing `docker/.env`.
- Do not treat example values as secrets. Security comes from an ignored real environment, loopback network binding, and deliberate production configuration.

## Settled Model
The root Docker start commands ensure `docker/.env` exists before Compose runs. On a new clone, a small Node script copies the documented non-secret configuration and replaces password fields with random local values, creating the ignored file with owner-only permissions. On an established clone, the script exits without modifying the existing environment.

Development Compose overlays bind published ports to `127.0.0.1`. Nuxt's accountless Cloudflare Quick Tunnel remains the supported phone-QA path and can reach the CMS through the host's loopback interface without exposing WordPress directly to the LAN.

## Public Documentation Boundary
The repository documents the local network boundary and credential-generation behavior, but it does not record real local credential values. Existing credential state and any optional administrator-password rotation remain private, user-controlled operations outside this archived spike.
