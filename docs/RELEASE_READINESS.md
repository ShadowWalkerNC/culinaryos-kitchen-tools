# Release readiness

This is a hosted 0.1.1 development release. The public HTTPS MCP endpoint passed anonymous protocol checks. A private personal plugin was created; it is not a public directory listing.

## Hosted release
- Setup: https://culinaryos-kitchen-tools-production.up.railway.app
- MCP: https://culinaryos-kitchen-tools-production.up.railway.app/mcp
- Private plugin: https://chatgpt.com/plugins/plugins_6ade6883fbe48191b7d6651289203e6d
- Deployment: `81446391-02d6-406a-ad17-14d29ab2620e` in the isolated Railway project `e1ffe896-3ac0-4be4-8cc1-9961e8c5bead`.
- Anonymous HTTPS checks passed on 2026-10-25: health/version/setup, MCP discovery, original workflow retrieval, conversion, complete/partial synthetic costing and private-tool rejection. Run `node scripts/smoke-remote.mjs` to repeat.
- Plugin storage was inspected after creation: twelve skills and the remote no-auth connection were retained. This is not evidence of installation in every AI client.

## Implemented
- Twelve original workflows, nine stateless public tools and an opt-in local workspace.
- Recipe/purchase preview and atomic commit, source retention, immutable version history.
- Deterministic costing, compatible dimensional conversions, partial-cost reporting and per-serving gross margins.
- Local tasks, version-bound approvals, confirmed service forecasts, durable events and a separately started rules worker.
- Portable source/runtime package, MIT license, Docker and Railway configuration.

## Still required for public directory submission
- Confirm publisher identity and provide the intended public website, support page, privacy policy and terms URLs. These have not been invented in the manifest.
- Create and verify a listing icon, record and host a walkthrough, and populate supported review cases and publication metadata.
- Complete host-specific connection tests and applicable developer verification, review scans and attestations. Package export is not directory approval.

## Acceptance not established by local tests
- ChatGPT/Claude product installation, current account-plan eligibility and desktop/mobile UI acceptance.
- Live CulinaryOS tenant/API integration. The adapter reads an explicitly authorized tenant-bound file only.
- Current supplier invoice accuracy, food-safety approval and real kitchen trials.
- Hosting cost, uptime or service capacity guarantees. The free endpoint still needs funded infrastructure.
- Railway config-as-code currently works but the CLI reports retirement on 2026-12-01. Migrate `railway.toml` before that date.

No production application, private restaurant records or payment system is changed by this package.
