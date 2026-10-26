# Historical 0.1.1 acceptance - 2026-10-25

This section records the previous release. Latest evidence is in [ACCEPTANCE_022.md](ACCEPTANCE_022.md), with guided-workspace evidence in [ACCEPTANCE_021.md](ACCEPTANCE_021.md) and the original baseline in [ACCEPTANCE_020.md](ACCEPTANCE_020.md). These supersede counts and UI/worker status below.

## Verified
- Server and UI typechecks; production TypeScript/Vite build.
- 76 automated tests across calculations, import transactions, version-bound approvals, durable jobs, file boundaries, backups, tenant-bound exchange and actual MCP transports.
- Public stdio and Streamable HTTP discovery/calls; private tools absent from public discovery.
- Nine separately maintained synthetic costing cases passed after independent review corrected early rounding, compatible unit conversion and batch-versus-serving margins.
- Authorized local Cheezies pilot: 14 recipes imported through the local HTTP preview/commit flow, all 14 costs matched existing source-record calculations, and the source file hash was unchanged. Private inputs/results are outside this package.
- npm audit reported zero known vulnerabilities on 2026-10-25 after updating Zod. This is a point-in-time dependency check.
- Twelve original skills have portable frontmatter; public workflow instructions are compiled from those same files. Default plugin registration exposes public stateless stdio only.
- Hosted release 0.1.1 passed anonymous HTTPS/MCP checks: setup, health/version, nine public tools, original guidance, conversion, complete/partial synthetic costing and private-tool rejection. Endpoint: https://culinaryos-kitchen-tools-production.up.railway.app/mcp
- Private personal plugin created through Plugin Creator; stored release inspected for all twelve skills and the correct no-auth remote connection.

## Not verified
- Browser UI visual/mobile acceptance: the in-app browser was unavailable, extension window creation was unsupported, and native Chrome was minimized with no working activation API in the available tool surface.
- ChatGPT/Claude product installation and plan eligibility; protocol tests are not host-client installation acceptance.
- Live CulinaryOS API access, real supplier invoice verification, physical kitchen acceptance and public directory publication.

## Material limitations
- Import accepts structured JSON/CSV and unverified pasted text. PDF/image interpretation and narrative drafts run in the user's AI client; background model generation is not implemented.
- Source prices remain historical/local records until independently verified. No food-safety, allergen, storage or shelf-life approval is inferred.
- The CulinaryOS adapter validates a portable tenant-bound file contract. It does not automatically translate native ratio blueprints or ambiguous purchase-cost units.
- The local worker must remain running for scheduled jobs. It uses explicit forecast/stock and current recipe approval; no service forecasts are invented.
- Public host limits bound inputs, expansion depth and concurrent HTTP requests. An async timeout does not preempt synchronous CPU execution.

See RELEASE_READINESS.md for public-hosting and directory requirements. This document does not mark those gates complete.
