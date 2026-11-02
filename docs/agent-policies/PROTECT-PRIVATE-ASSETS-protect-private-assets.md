---
id: PROTECT-PRIVATE-ASSETS
type: operational
scope: "Agent handling of credentials, licensed assets, uploads and private reference sources."
status: adopted
authority: "Aslan: authorized migration of existing AGENTS obligations in this chat on 2026-11-02."
revised: "2026-11-02"
depends_on: ["ADOPT-POLICIES"]
related_to: []
---
# Protect private assets
Keep credentials, real `.env` files, private plugin zips, and uploads out of Git.

Optional private context remains external; local reference assets live in the gitignored root `reference-materials/` folder. Discover both through `.reference-paths.local.json` at the repository root, a gitignored JSON object mapping descriptive keys to file/directory paths. `context` identifies the external context/index; `references` identifies `reference-materials` relative to this repository. Additional descriptive keys may identify other external locations. Use `.reference-paths.example.json` as the generic example; machine-specific paths belong in the local file.

Parse the file strictly as JSON data, resolve relative values from the configuration's directory, and read only locations needed for the current task. Never source/execute it or load unrelated credential-bearing `.env` files. If it is missing or a required path is inaccessible, report that specific gap and continue work that does not depend on the missing context. Pointers do not grant access or permission.

Keep reference sources in `reference-materials/` out of Git; the folder is also excluded from formatting and Docker build contexts. Gitignore is not access control and does not untrack files or erase history. Select public-safe reasoning deliberately; private source availability does not authorize copying it into public docs or shared artifacts.

Legacy `temp-ref-assets/` and `temp-reference-assets/` path mentions in historical evidence resolve relative to the configured `references` root, now `reference-materials/`. Preserve those provenance mentions; current work uses the configured root rather than recreating either legacy folder.
