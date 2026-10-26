# Technical Requirements — Kitchen Tools

Stack: Node >=24 (node:sqlite), strict TypeScript, MCP SDK, Zod, React/Vite UI. Minimal deps.

## Data version v1 (F01–F06)
- Money: integer cents. Currency required on every money-bearing object; mixed currencies rejected.
- Quantity: `{ amount: string decimal, unit: string }`. Internal math via scaled integers (6dp); display rounding only with explicit `rounding` boundary field.
- IDs stable strings; `version` int starts at 1, increments per commit; `provenance: {source, receivedAt, verified: boolean}`.
- Recipe: `{ id, name, currency, yieldQty, ingredients: [{ingredientId, qty}], subrecipes: [{recipeId, qty, yieldRef?}], packaging?: [{label, costCents}], variants?: [{id, netPriceCents?, confirmed: boolean}] }`.
- Purchase: `{ id, ingredientId, costCents, usableQty, unit, effectiveDate, packBasis?, densityGPerMl? }` — pack/density only when supplied.
- Rules: missing cost stays unknown (never 0); never guess pack conversion/density; reject negative/NaN/zero yields; cycle detection on subrecipe graph.

## Costing (F06)
- Result: `{ knownCents, unknown: [{path, reason}], coverage: {known, total}, perUnitCents?, marginCents? }`.
- Margin is confirmed net price minus complete per-serving ingredient cost; omitted for partial costs. Fractional cents remain rational until final batch/serving rounding. Packaging is reported separately as batch `packagingCents`.

## Storage (F09–F10)
- SQLite via node:sqlite. Transactions for every commit; `UPDATE ... WHERE version=?` optimistic checks; preview tokens bind validated payload + expected versions with expiry; commit fails on stale (409-style error).
- Tables: recipes, ingredients, purchases, record_versions, previews, tasks, approvals, runs, leases, workflows_config, sources, events, forecasts.
- Exports/backup confined to selected workspace dir; reject `..`, absolute paths, symlinks.

## MCP (F08–F09, F15)
- Zod schemas per tool; no URL fetch / arbitrary paths / code exec tools.
- Public registration: exactly 14 tools. Local registration adds private records, forecasts, flows, profile, drafts, approvals and run history. `mcp.json` defaults to public stdio only.
- Transports: stdio + Streamable HTTP, compiled to dist/. Separate launch commands.

## HTTP (F14–F15)
- Local: bind 127.0.0.1; serve dist/ui; POST mutations require `X-Session-Token` (generated secret, per boot, file 0600 equivalent); GET /api/session issues token only for exact same-origin (Origin check + Sec-Fetch-Site). Strict Host allowlist (127.0.0.1, localhost + port). 1MB body cap. Calc timeout 5s, concurrency 4. GET /health, /version. Logs: method/path/status/duration only.
- Public: stateless handler, same 1MB/timeout/concurrency bounds, no token, no static UI.

## Jobs (F12)
- Workspace server starts/stops the embedded worker; schedules are explicitly enabled. Standalone worker remains an advanced option. Durable heartbeat exposes failures and next check.
- Lease: `INSERT ... ON CONFLICT` per (schedule, occurrence) / (event id); multi-worker safe.
- Clocks injectable (`{now(): Date, tz: string}`); DST tests use America/New_York spring/fall.
- Bounded retries (max 3, backoff), run history table, failure visible via tasks.

## UI (F11)
- Vite + React, six views, no router dependency (hash tabs). Same-origin `/api/*` calls share domain functions with local MCP.
- Touch targets >=48px, labels on all inputs, keyboard focus visible, aria-live status.

## Adapter (F13)
- `readExportFile(workspaceRoot, tenantId, fileName, confirm)`; validates tenant binding match, rejects traversal, returns parsed v1 records. No network.

## Scripts
- build / typecheck / test / dev / start / mcp / cli / package (see README).
