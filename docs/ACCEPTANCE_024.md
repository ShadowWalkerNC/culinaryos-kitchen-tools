# Installable public community release0.2.4

## Fixes

The0.2.3 public remote ZIP incorrectly copied a stdio declaration pointing at dist/mcp/stdio.js without packaging that server. SDK tests against the full source/runtime package did not catch this smaller package defect. The public plugin now uses the existing hosted service, and a dedicated actual-package smoke check rejects local commands and missing-runtime dependencies.

A native Codex0.164.0-alpha.11.1 probe also rejected the connection's extensions field. The minimal remote declaration now contains only type and url. The server remains public/no-authentication, verified by anonymous calls. A Codex Git marketplace now resolves the actual root plugin; explicit installed/enabled state is checked rather than inferred from cached skills.

The onboarding skill routes care-facility paperwork to the separately installed Ross Manor specialist, checking actual tools and its privacy/current-source approval rules. No facility menu, source photo, count or private data store is included in this public package. A live specialist status check reported a local renderer and a non-hosted web backend; this is a routing integration, not a hosted clinical service or automatic data synchronization.

## Evidence

-134 tests across21 suites passed; strict types and build passed. Added checks cover marketplace resolution, the public connection declaration and specialist routing. Public tools have accurate read-only/idempotent/non-destructive metadata; private write operations retain their existing registration and approval behavior.
- The supported Codex CLI installed kitchen-tools@open-kitchen-toolkit0.2.4 and reported installed:true and enabled:true. A direct MCP client using its installed manifest discovered16 tools, retrieved12 starter journeys and obtained32oz=2lb. This is a connection/calculation check, not proof of native model execution.
- Native discovery succeeded after the metadata fix. An actual native convert_quantity call was then denied with “MCP tool call requires approval, but approval policy is never.” No host policy was changed or bypassed. Native tool execution remains blocked in that unattended configuration; interactive testers must use their host's normal connection/tool approval controls. Accurate read-only metadata does not grant authority.
- Existing105 workflow IDs and547 explicitly NOT_RUN scenario cases are preserved. No claim of broad model equivalence, clinical suitability or production reliability is made.

Run npm run typecheck, npm run build, npm test, npm run check:scenarios, npm run test:release and npm run package. Check the package with node scripts/smoke-remote-package.mjs package-out --offline. Build ZIPs with python scripts/package-downloads.py OUTPUT_DIRECTORY, extract the remote ZIP to an isolated directory and run the same smoke script against that actual extracted directory without --offline. The installed source and public Git-backed installation are separately checked in the publication receipt.

## Public scope

Public GitHub source, a directly installable community marketplace, download ZIPs and the hosted service are separate from an OpenAI directory listing. Directory publication requires verified publisher identity, listing/policy materials, applicable portal checks and approval. The personal account plugin retains its original identity and private audience. Codex installation does not establish ChatGPT website/mobile installation. See INSTALL.md for the exact client routes and a reproducible test prompt.
