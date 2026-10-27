# 0.2.3 guided entry and recipe conversion acceptance

This is a development release, not production or clinical certification. It preserves 105 canonical workflow IDs and the 547 designed scenario cases; the full model scenario bank remains **NOT_RUN**.

## Implemented

- G01–G03: Twelve ordinary-language starter journeys, four steps each, matching canonical workflows; stateless `get_started` with explicit reported progress; regular-AI fallback and optional uninstalled skill drafts.
- G04: `standardize_recipe_units` preserves originals, distinguishes explicit US/metric/imperial volumes, and blocks ambiguous standards or missing ingredient-specific factors. No stored recipes are overwritten.
- G05: Onboarding and dietary/nutrition instructions explicitly require approved care-facility requirements and authorized review; no Sylvia/Ross private records are imported.
- G06: Public GitHub proposal/problem links, issue forms and maintainer review instructions. No upload executor, automatic installation or malware-free guarantee.
- Three plugin prompt suggestions and an onboarding-skill reference. Actual native client rendering/automatic invocation remains unverified.

## Executed evidence

- TypeScript checks and production build passed.
- All 131 automated tests passed across 21 suites. One intermediate rerun collided with the owned preview on the suite's reserved port; that preview was stopped and the full suite passed cleanly. Scenario-fixture consistency and compiled-package smoke checks passed.
- Reference MCP client discovered 16 public tools, retrieved all 105 workflows, exercised reported-step progression, and converted a synthetic mixed recipe with a visible blocked line. Public mode created no workspace files and did not expose local operations. See [reference output](evidence/reference-protocol.json).
- Real Chrome checks passed on 390px phone and 1440px desktop: all 12 choices, four steps, care boundary, real clipboard copying, missing-skill guidance, public same-origin script under CSP, contribution link and denied-clipboard fallback. No page errors or horizontal overflow. See [browser receipt](evidence/start-browser-023.json).
- Four fresh Axomai instruction loads succeeded. Independent toolkit localization assertions distinguished US/imperial pints and rejected ambiguous flour cups. This is instruction-contract inspection plus toolkit execution; **vendor inference was not executed**. See [comparison scope and observations](evidence/comparison-023.json).

Reproduce: `npm ci`, `npm run typecheck`, `npm run build`, `npm test`, `npm run check:scenarios`, `npm run test:release`, `npm run package`, then `node scripts/smoke-package.mjs package-out/dist/mcp/stdio.js`. Optional browser check: run a synthetic local workspace, set KITCHEN_BROWSER_URL and optional KITCHEN_PLAYWRIGHT_MODULE/KITCHEN_CHROME_EXECUTABLE, then run `node scripts/test-start-browser.mjs`. Comparison reruns require fresh authorized vendor snapshots outside the source tree; proprietary snapshots are never bundled.

## Remaining limits

Native ChatGPT/Claude/Cursor/Gemini/Codex installation and identical model answers are not established by SDK calls or package storage. A host can omit prompt chips or choose not to invoke onboarding. Ask for the guide explicitly if needed. Different AI hosts can produce different narratives. Real kitchen, facility, physical printing, provider action and production acceptance remain separate. No new model provider, toolkit login, mandatory key, database migration or background AI worker was introduced.

Publication and hosted-service verification are recorded in the versioned publication receipt when completed; local test results alone do not establish deployment.
