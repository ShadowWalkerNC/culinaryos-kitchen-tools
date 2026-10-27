# Guided restaurant and kitchen work - 0.2.3

The plugin is the primary interface. The existing MCP engine provides deterministic calculations and optional local records; no additional AI-provider account, key or model subscription is introduced by the toolkit. Provider requirements still apply.

G01: Activating/asking for help routes through the existing onboarding skill. Three plugin starter prompts and twelve detailed starter journeys cover home cooking, restaurant costing, recipes, conversion, food trucks, bakery, care menus, service, bar, shops, catering and marketing. Ask **Show me how to use Open Kitchen Toolkit** if a client does not show suggestions. Native prompt-chip rendering and automatic onboarding depend on the client and are not certified by package storage.

G02: Each journey has four steps and canonical workflow links. `get_started` lists them or returns a selected journey and next incomplete step from explicitly reported completion. It is stateless: reported completion is not verified execution or a saved task. Actual local connected flows retain their existing evidence and approval controls. The AI guides the conversation and uses actual tools when available.

G03: If no matching skill exists, the host AI can answer with sources/uncertainty as appropriate and offer an original reusable draft. Missing skills are not an artificial restriction on ordinary AI knowledge. A draft is not installed, published, approved or granted new tool permissions.

G04: Recipe conversion preserves original lines, requests explicit volume standards and blocks missing measured density/packing factors. See UNIT_CONVENTIONS.md. This increment adds no currency exchange, temperature conversion or nutrient calculator.

G05: Care menus use de-identified counts, supplied facility specifications and authorized clinical review. No default renal/cardiac diet prescriptions, resident database or implicit transfer from Sylvia/Ross paperwork is introduced. Home cooking can proceed without commercial targets or a local workspace.

G06: Public contribution links lead to GitHub issue forms for skill proposals and workflow problems. Text/code is reviewed under CONTRIBUTING.md before inclusion in a versioned release. No arbitrary upload backend, automatic installation or malware-free certification is promised.

Validation: independent unit cases, source/build regression suite, reference MCP calls, phone/desktop browser interactions and bounded vendor contract comparisons. Designed scenario cases remain separate from executed results. See ACCEPTANCE_023.md for actual results.
