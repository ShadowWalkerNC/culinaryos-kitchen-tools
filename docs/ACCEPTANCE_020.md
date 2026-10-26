# Acceptance evidence — 0.2.0 development release

Recorded 2026-10-25 (America/New_York). Evidence is scoped to the check performed; passing examples do not establish production reliability.

## PASS: local software and original library

- Server/UI typechecks and production build; 105 automated tests. Coverage includes legacy calculations/imports/approvals, public isolation, actual MCP transports, new calculators, migration backup, stale connected-flow revisions, duplicate requests beyond the 200-run display window and worker retry/health behavior.
- 73 original workflows, 61 distinct baseline mappings, all 12 original IDs retained. Every workflow includes inputs, outputs, missing-data handling, tool and approval boundaries, worked and blocked examples.
- All 146 stored examples received an editorial grounding review. Corrections are recorded in `fixtures/workflow-example-reviews.json`. Review is not an independent inference run of each scenario. Independent follow-up corrected markup versus margin, strict target comparison and incomplete event-cost bounds.
- 387 designed cases (five per workflow plus 22 cross-workflow), explicitly NOT_RUN. `npm run check:scenarios` validates canonical consistency. Automated implementation tests are separate from designed host trials.
- `npm run test:release` executes the compiled MCP in an empty temporary directory: 14 public tools, all 73 workflows retrieved with explicit settings, unknown-workflow errors, held-out cost/prep arithmetic, partial costs, measured yield and incomplete event budget. No private workspace is created. Full outputs: `evidence/reference-protocol.json`.
- Browser at 390×844: settings, searched library, reviewed synthetic imports and recipe costing. At 1440×1000: connected recipe release, both required drafts, exact-revision synthetic approval, blocked daily service. No captured page errors. `evidence/browser-*.json` records actions and scope. Final phone navigation was visually inspected after layout fixes.
- Windows launcher started a fresh synthetic local workspace with an automatic idle-worker heartbeat. Dependencies were already installed for that launcher check; the clean production dependency check is a separate package test. The task-refresh test first failed because its selector matched two fields; the corrected selector demonstrated a newly created run appearing immediately in Today tasks. Both captures are preserved.

## Live Axomai comparison

Five connected instruction documents were refreshed live and hash-matched to earlier isolated, answer-key-withheld host trials. Current compiled toolkit calculations matched the earlier cost ($19.10 batch, $1.91 portion) and prep (five batches, 120 produced) results. Unknown-workflow error flags differ. `evidence/comparison-summary.json` contains original findings and method. Vendor instruction snapshots and private trial outputs remain outside the release. This is not a new model-versus-model benchmark or evidence of subscription ROI.

## Publication and installation

Executed publication/deployment receipts belong in `evidence/release-receipt.json`. Saving a Creator plugin, passing protocol tests and installing in a native AI client are distinct checks. See `COMPATIBILITY.md` for the client matrix.

## UNVERIFIED / NOT RUN

- Native ChatGPT, Claude, Cursor, Gemini CLI and Codex installation plus model-driven discovery/calculation acceptance. Configurations and protocol tests do not substitute for product checks.
- All 387 designed host conversations and full output review across providers. Only bounded held-out trials and reference checks described above were executed.
- macOS/Linux launcher execution, physical kitchen trials, supplier verification, public directory submission and live CulinaryOS API integration.
- Production reliability, legal/safety approval, allergen absence and authenticated reviewer identity. Approval records capture a supplied reviewer name and confirmation, not identity proof.

## Practical limits

Enabled local schedules run automatically while the workspace server is open; closing stops processing. Reopening performs bounded catch-up. Documents are drafted in the selected AI host and attached for review. Event/service-close structured inputs currently enter through local MCP; UI can inspect and approve their runs. Imports support structured JSON/CSV and unverified pasted text; PDF/image interpretation remains in the AI host. Public request limits do not preempt synchronous CPU execution. CulinaryOS file exchange requires explicit tenant binding and confirmation.
