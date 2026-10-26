# Data Ownership — Kitchen Tools

- This package owns only `kitchen-tools/**` and a user-selected local workspace dir for DB/exports.
- DB file (`kitchen-tools.sqlite`) lives in the workspace, never in the npm package. Package output excludes `*.sqlite`, credentials, Axomai references, Cheezies data, node_modules.
- Imports store original source bytes + kind + receivedAt + verified=false until a structured, reviewed commit marks records verified.
- Pasted text retained as unverified `sources` row; never auto-converted to structured recipes.
- Browser-supplied `verified` flags are ignored for approvals; only server-side reviewed commits set verified.
- Approvals bind exact object id + version; stale approvals fail.
- Exports/backup write only inside workspace; traversal rejected.
- Public mode persists nothing and reads no workspace.
- Schema v2 adds settings and connected-flow records after a consistent pre-migration backup. Runs link exact source versions, calculations, appended document revisions, approvals and tasks.
- Schema v3 adds versioned unfinished job drafts. These remain private local records, are included in workspace JSON metadata and full backups, and never reach the public diagnostic. The event editor uses one draft slot per workspace and rejects stale saves.
- JSON exports preserve original recipe/purchase fields and add workspace metadata. SQLite backup remains the full-fidelity recovery format. Do not publish exports or local private connection settings.
- CulinaryOS exchange is FILE-based: operator explicitly copies an export file; adapter requires matching tenant binding + explicit confirm. No network, no service credentials, no default tenant.
- Local Cheezies pilot (if any) runs at repo root against private files; excluded from package.
