# Guided workspace increment — 0.2.1

Scope: F24 setup/diagnostics, F25 guided job entry and clearer blockers, F26 event UI, plus local unfinished-event storage, AI handoff and printable documents. This is the first expansion increment, not completion of the six-stage roadmap.

## Verified

- 113 automated tests pass, including eight new validation/storage/HTTP/print checks. Server and UI typechecks, production build, scenario consistency and compiled MCP reference checks pass. The 73-workflow library and 14 public tools remain intact.
- Additive schema v3 adds a versioned local `job_drafts` table. Existing workspaces receive a consistent `.pre-v3-...sqlite` backup first; v2 preservation, restart persistence, stale-write rejection and future-schema refusal are tested. The recipes/purchases interchange remains dataVersion v1.
- First-run setup reports actual record counts, unresolved kitchen settings, local runtime and worker state. The public diagnostic discovered tools, retrieved recipe guidance, converted 32 oz to 2 lb, and calculated a synthetic USD 1.00 batch / USD 0.25 portion. It targets a fixed hosted URL and sends no workspace records. This verifies the public MCP service, not installation or permissions in an AI host.
- Actual owned-headless-Chrome interactions at 1440×1000 and 390×844: setup checklist, saving an unfinished event, navigating away/back to resume, exact-cent preview, event creation, required document attachment, exact-revision approval, printable reviewed document, changed-input invalidation and missing-price/allergen blocked review. No page errors. Final evidence: `evidence/guided-browser-021.json` and `guided-*-021.png`.
- Root independently inspected phone and printable screenshots. Follow-up task titles reflect the current run state. Older document revisions print as superseded; unapproved/stale documents print as drafts.

## Method and corrections

Muse authored the isolated event component; root reviewed and integrated it. Backend validation/calculation stays shared with connected workflows. Root corrected a server-type import leaking into UI checking, busy-form edit races, workload confirmation invalidation, task-title synchronization and printable revision labeling. Full test results reflect those corrections.

The initial REA desktop browser call timed out after 300 seconds without a complete capture. Earlier short REA phone/setup captures succeeded. The equivalent complete acceptance sequence was executed through the already installed Playwright Core runtime using an owned Chrome process closed in `finally`. The timeout is not reported as a UI pass. Intermediate synthetic captures/transcripts remain in the development workspace.

## Reproduce

Run `npm run typecheck`, `npm test`, `npm run build`, `npm run check:scenarios` and `npm run test:release`.

For UI acceptance, start a fresh synthetic workspace on port 3196. Run `node scripts/test-guided-browser.mjs` with optional Playwright Core available. `KITCHEN_PLAYWRIGHT_MODULE` can point to an existing module URL, `KITCHEN_CHROME_EXECUTABLE` selects installed Chrome, `KITCHEN_BROWSER_URL` selects a literal loopback target, and `KITCHEN_BROWSER_OUTPUT` selects an evidence folder. No browser dependency is added to ordinary runtime installation. The driver deliberately expects an empty test workspace and records synthetic approvals only. It closes its own browser.

## Compatibility and limits

New event runs need `capacityConfirmed:true`, nonempty task intervals and complete guest/budget evidence before approval. Missing capacity can now be stored as a blocked run. Earlier records are historical; an upgrade does not independently re-verify them. Evidence fields are operator supplied, not supplier verification or identity proof.

One unfinished event slot is stored per local workspace, with optimistic revision checks. It is distinct from immutable review runs. Event money entry currently uses two decimal places; currency precision beyond the toolkit's cents model is not added here. The UI can copy a reviewed selected-run prompt; no embedded model or background generation is introduced. Clipboard permission and native printing remain browser/OS controlled. PDF/image extraction, service-close forms, live POS/CulinaryOS APIs, multi-user hosting and community packs are later roadmap stages.

Native ChatGPT/Claude/Cursor/Gemini/Codex acceptance remains incomplete as recorded in COMPATIBILITY.md. No host approval policy was bypassed. The 387 designed host cases remain NOT_RUN; these UI and deterministic checks do not change that status or certify production reliability.
