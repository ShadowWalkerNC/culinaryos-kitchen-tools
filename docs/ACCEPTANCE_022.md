# Specialty library expansion — 0.2.2

The library expands from 73 to 105 original MIT workflows. All existing identifiers and 61 baseline mappings remain intact. The 32 additions are listed in `fixtures/library-expansion-022.json`:

| Section | Added workflows | Examples |
|---|---:|---|
| Home Kitchen | 7 | Pantry meal plans, grocery budgets, leftover candidates, freezer inventories, household calendars, troubleshooting, shared meal components |
| Bakery | 8 | Baker's percentages, starter flour/water accounting, measured dough yield, preorders, oven slots, display counts, cake specifications, batch traceability |
| Food Truck | 6 | Loadout, throughput, documented power/water constraints, contingency records, commissary handoff, actual event settlement |
| Small Shop | 6 | Reorder rounds, deli replenishment, markdown proposals, pack pricing, combo costing, cash close |
| Professional Kitchen | 5 | Production batch records, handovers, service bottlenecks, equipment downtime and station pickup timing |

## Validation scope

- 122 automated tests cover the existing engine/workspace plus pagination, section counts, supported tool declarations, specialty playbooks, numerical example keys and action/safety truthfulness. Typechecks, production build and canonical scenario checks pass.
- The compiled MCP reference client retrieves all 105 workflows, including the second page; public tools remain 14 and public mode creates no private workspace. These are actual protocol checks, not native AI-client installation or narrative generation trials.
- The scenario bank now contains 547 designed cases: five per workflow plus 22 retained cross-workflow cases. All remain explicitly NOT_RUN. Adding designed cases does not imply model-host conversations were executed.
- All 64 new worked/blocked output pairs received author review and independent root editorial review. Eighteen workflows needed root corrections. `fixtures/specialty-review-022.json` records those changes; the combined example ledger distinguishes review from execution.
- Corrections include full-week household demand, ungrounded price suggestions, unknown-date freezer ranking, uncertain handling logs, incomplete cost/profit distinctions, unperformed packing/sign-off claims and overlapping attended staff tasks. Numerical keys and capacity-conflict checks independently cover representative arithmetic.

## Discovery and downloads

The private UI loads every metadata page, rather than stopping at 100. It rejects duplicate, inconsistent or truncated responses. A section selector and search include aliases; “mom and pop” finds the small-shop additions, and apostrophe/hyphen variants are normalized for search. Existing workflow lookup IDs are unchanged.

The public service offers a full playbook plus five allowlisted specialty downloads at `/playbooks/home-kitchen.md`, `/playbooks/bakery.md`, `/playbooks/food-truck.md`, `/playbooks/small-shop.md` and `/playbooks/professional-kitchen.md`. Unknown slugs return 404; the route is not an arbitrary file reader. These manual playbooks supply guidance only, without live saving, calculation or automation.

Eight browser checks passed with no page errors. Evidence is in `docs/evidence/library-browser-022.json` and the section screenshots. `scripts/test-library-browser.mjs` exercises actual two-page loading, all five sections, worked/blocked guide rendering, mom-and-pop search and last-page original workflow retrieval on phone/desktop. Root visually inspected the home/bakery phone screenshots. The driver uses optional installed Playwright Core and an owned Chrome process; ordinary runtime dependencies are unchanged. The initial browser run exposed an ambiguous nested select label; the UI now uses an explicit label/control association. The failed capture is retained outside release artifacts.

## Boundaries

These are original skills and templates, not 32 new deterministic calculators or external integrations. Guides identify host-drafted arithmetic requiring review when no suitable tool is called. Recipe/purchase validators do not validate arbitrary cashbooks, household logs or electrical specifications.

Household tasks request only relevant settings. No adult/child portion multipliers, shelf-life limits, cooking temperatures, electrical approval, medical suitability, prices, staff or signatures are invented. Handling logs alone do not establish safe reuse. Unknown allergen evidence remains unknown. Operational procedures need appropriate verified sources and review.

Native client acceptance, full 547-case model trials, physical kitchen validation and production reliability remain incomplete. No background model, toolkit login, automatic purchase, payment, message or menu-price execution is introduced.
