# Implementation — Kitchen Tools

## Layout
- `src/core/` money, quantity, validation, costing, scaling, conversion, purchase, prep, ordering (F01–F07)
- `src/data/` db, imports, tasks, approvals, exports (F09–F10)
- `src/jobs/` clocks, leases, worker (F12)
- `src/mcp/` schemas, publicTools, localTools, stdio, httpStream (F08–F09, F15)
- `src/server/` localHttp, publicHttp, security (F14–F15)
- `src/cli/` cli.ts (F09–F10, backup, worker)
- `src/adapter/` culinaryosFile.ts (F13)
- `ui/` React/Vite six views (F11)
- `skills/*/` 73 original MIT workflows; searchable catalog in `src/workflows/catalog.ts` (F16)
- `src/workflows/` connected runs, settings, discovery (F19–F22)
- `src/core/operations.ts` yield, stock, event budget, capacity
- `launchers/`, `clients/`, `src/distribution.ts` platform entry points/adapters (F23)
- `tests/` node:test suites (F18)

## Preserved identifiers (F16)
onboarding, data-reconciliation, recipe-documentation, recipe-scaling, recipe-costing, purchase-price-review, menu-margin-review, prep-planning, ordering-proposals, waste-review, sop-drafting, daily-close-review.

## Stage acceptance (honest)
- [x] Docs written (F01–F18 traced)
- [x] Core deterministic + golden tests
- [x] SQLite atomic commits + concurrency tests
- [x] Jobs lease/restart/catch-up/DST tests
- [x] MCP stdio + Streamable HTTP, public isolation tests
- [x] Local HTTP security tests (host/origin/size)
- [x] UI builds, 4 views, demo fixture labeled
- [x] Adapter fixture + cross-tenant rejection
- [x] `npm run build`, `typecheck`, `test` pass
- [x] Anonymous hosted HTTPS/MCP release checks; private personal plugin created and stored components inspected.
- Current evidence: ACCEPTANCE_020.md. Native AI-client installation, kitchen trials, directory publication and live CulinaryOS integration remain unverified; browser acceptance has now been performed.
