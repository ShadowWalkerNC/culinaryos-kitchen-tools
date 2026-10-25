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
- F08 Public MCP: 9 stateless tools only (list_capabilities, get_workflow, validate_kitchen_data, scale_recipe, convert_quantity, cost_recipe, compare_purchase_costs, build_prep_plan, build_order_proposal).
- F09 Local MCP: adds recipe lookup, preview_import, commit_import, tasks, version-bound approvals, workflows config, export.
- F10 Imports: JSON + CSV + pasted text (unverified until structured); preview then atomic commit; optimistic concurrency; no partial writes.
- F11 UI views: Recipes / Imports / Today / Approvals; accessible, mobile 48px targets, empty/loading/error/success, print/export; synthetic demo fixture labeled; empty app honest.
- F12 Jobs: explicit worker + explicit schedules; cost-import review tasks; daily cutoff prep draft; action-required tasks on missing data; states open/in_progress/awaiting_approval/completed + blocked reason + cancellation/history; version-bound approvals; atomic leases/idempotency; restart recovery, one catch-up, bounded retries; injected clocks + DST; AI placeholder honestly reports not configured.
- F13 CulinaryOS adapter: authorized FILE exchange only; explicit workspace/tenant binding + confirmation; cross-tenant rejection; no repo changes.
- F14 Local HTTP: 127.0.0.1 only, serves built UI, session-secret mutations, strict host/origin, fetch-metadata, 1MB limit, calc timeout/concurrency bounds, health/version, metadata-only logs.
- F15 Public HTTP: stateless only; no DB/secrets/files/payload persistence/model calls.
- F16 Twelve original skills (see docs/IMPLEMENTATION.md list).
- F17 Distribution: MIT, plugin.json 1.0, mcp.json with ${PLUGIN_ROOT}/dist/..., Dockerfile public stateless, Railway config, CI checks, README run/backup/recovery + status matrix.
- F18 Tests: golden costing/conversions, edge cases, concurrency, traversal, approvals, jobs (lease/restart/catch-up/DST), MCP both transports + public isolation, HTTP security.

## Non-goals
- No deployment/push/upload, no production calls, no AI generation dependency, no live CulinaryOS API integration (NOT RUN), no kitchen trials/publication (NOT RUN).
