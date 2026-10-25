# Data Ownership — Kitchen Tools

- This package owns only `kitchen-tools/**` and a user-selected local workspace dir for DB/exports.
- DB file (`kitchen-tools.sqlite`) lives in the workspace, never in the npm package. Package output excludes `*.sqlite`, credentials, Axomai references, Cheezies data, node_modules.
- Imports store original source bytes + kind + receivedAt + verified=false until a structured, reviewed commit marks records verified.
- Pasted text retained as unverified `sources` row; never auto-converted to structured recipes.
- Browser-supplied `verified` flags are ignored for approvals; only server-side reviewed commits set verified.
- Approvals bind exact object id + version; stale approvals fail.
- Exports/backup write only inside workspace; traversal rejected.
- Public mode persists nothing and reads no workspace.
- CulinaryOS exchange is FILE-based: operator explicitly copies an export file; adapter requires matching tenant binding + explicit confirm. No network, no service credentials, no default tenant.
- Local Cheezies pilot (if any) runs at repo root against private files; excluded from package.
