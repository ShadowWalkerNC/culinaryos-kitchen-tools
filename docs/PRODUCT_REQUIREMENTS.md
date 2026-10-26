# Product Requirements — CulinaryOS Kitchen Tools (standalone)

Standalone local-first toolkit. Original MIT content. No Axomai/Cheezies data in package.

## Users
- Kitchen operator (local UI + CLI), Creator integrating via MCP.

## Scope: local-first, rules-only
- Deterministic calculations from explicit inputs only. No invented waste, forecast, conversions, densities, safety limits, allergens, signatures.
- Draft documents only; human approval required before use.

## Features (IDs carried across docs)
- F01 Money in integer cents, explicit currency, no mixed currencies.
- F02 Quantities as decimal strings with rational precision; rounding only at documented boundary.
- F03 Recipes: ingredients + optional subrecipes, yields; stable IDs, versions, provenance, verified flags.
- F04 Purchases: cost + usable qty/unit + effective date; supplied density/pack basis explicit.
- F05 Validation: reject negative/NaN/zero yields, detect cycles, never missing cost=0.
- F06 Costing: separates known/unknown/coverage; margin only on confirmed variant net price; packaging separate; never label ingredient margin as net profit.
- F07 Public calculations: scale, convert, cost, compare purchases, prep plan, order proposal.
- F08 Public MCP: 14 stateless tools: the original nine plus workflow search and deterministic yield, stock, event-budget and capacity calculations.
- F09 Local MCP: adds recipe lookup, preview_import, commit_import, tasks, version-bound approvals, workflows config, export.
- F10 Imports: JSON + CSV + pasted text (unverified until structured); preview then atomic commit; optimistic concurrency; no partial writes.
- F11 UI views: Recipes / Imports / Today / Approvals; accessible, mobile 48px targets, empty/loading/error/success, print/export; synthetic demo fixture labeled; empty app honest.
- F12 Jobs: explicit worker + explicit schedules; cost-import review tasks; daily cutoff prep draft; action-required tasks on missing data; states open/in_progress/awaiting_approval/completed + blocked reason + cancellation/history; version-bound approvals; atomic leases/idempotency; restart recovery, one catch-up, bounded retries; injected clocks + DST; AI placeholder honestly reports not configured.
- F13 CulinaryOS adapter: authorized FILE exchange only; explicit workspace/tenant binding + confirmation; cross-tenant rejection; no repo changes.
- F14 Local HTTP: 127.0.0.1 only, serves built UI, session-secret mutations, strict host/origin, fetch-metadata, 1MB limit, calc timeout/concurrency bounds, health/version, metadata-only logs.
- F15 Public HTTP: stateless only; no DB/secrets/files/payload persistence/model calls.
- F16 105 original canonical workflows: 61 baseline mappings, four retained utilities, eight initial additions and 32 specialty workflows; preserve all original identifiers.
- F17 Distribution: MIT, plugin.json 1.0, mcp.json with ${PLUGIN_ROOT}/dist/..., Dockerfile public stateless, Railway config, CI checks, README run/backup/recovery + status matrix.
- F18 Tests: golden costing/conversions, edge cases, concurrency, traversal, approvals, jobs (lease/restart/catch-up/DST), MCP both transports + public isolation, HTTP security.

## 0.2.0 extensions
- F19 Five connected flows link source versions, calculations, draft revisions, exact-revision approvals and tasks. Missing evidence visibly blocks progress.
- F20 Additive workspace migration with consistent pre-migration backup; public mode remains stateless.
- F21 Enabled rules run automatically with the workspace, with health, next check, failures/history and bounded catch-up. No background model provider.
- F22 Explicit location, currency, units, timezone and targets. Allergens distinguish contains, may contain, verified absent and unknown.
- F23 Free source/runtime/plugin/playbook packages and separate client adapters. Untested installs stay visibly unverified.
- F11 now includes Library and Settings, six views total. F12 uses an embedded workspace worker; a separate command is optional.

## Specialty library
F35 (0.2.2): add home/bakery/truck/shop/professional sections with original worked/blocked examples, real tool boundaries, full-page discovery and focused manual playbooks. No new calculator or live-integration capability is implied by a workflow title.

## Non-goals
No live CulinaryOS API integration, background model dependency, physical kitchen certification or automatic external orders/messages/price changes. Publication is authorized; evidence is recorded separately.
