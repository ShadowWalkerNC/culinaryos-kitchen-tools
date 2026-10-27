# Clean menu templates

The local **Menus** view and public `format_menu` tool use fixed, text-only layouts. Choose restaurant, cafe/food truck, bakery price list, or prix fixe. Letter and A4 are supported. No images, decorative emoji, external assets, custom HTML or arbitrary styles are accepted.

## Chef workflow

1. Ask your AI client for dishes or copy if needed. Review suggestions before using them as menu content.
2. Choose a preset. Enter confirmed names, short descriptions, prices, explicit currency and section headings. Start with blank sections to create a boilerplate; empty sections remain blocked drafts.
3. Preview. Resolve missing prices, currency and empty sections.
4. Review this exact preview, including any ingredient, provenance and dietary claims.
5. Choose **Print / save PDF** and select the browser's PDF destination, or download the standalone HTML. Changing any field clears review.

The editor currently keeps unsaved work in page memory. Download a reviewed menu before leaving. Menu layout does not verify recipe costs, allergens or clinical suitability. Those require their respective source-based workflows and authorized review.

## Natural-language prompts

- “Format my approved dinner menu in the restaurant template. Use USD and Letter paper.”
- “Turn these confirmed items and prices into a clean food-truck menu.”
- “Use the bakery price-list template, with per-loaf and per-piece unit labels.”
- “Lay out these approved courses as a prix-fixe menu, GBP 45 per person, A4.”

The AI host supplies structured content to `format_menu`; it does not invent a layout each time. Unknown prices are null, never zero. Price amounts use integer cents and two decimal places. Explicit price labels such as “Market price” are supported by the tool; they cannot accompany a monetary price on the same item. Prix-fixe item prices represent supplied supplement prices; label the item or description clearly to avoid confusing them with the overall price. There is no automatic publishing.

## CLI

`kitchen-tools menu --json '{...}'` returns the same HTML, plain text and publication blockers as the public tool, without opening a database or writing files. Use the `format_menu` schema for the JSON input.

## Validation

Run `node --import tsx --test tests/menu-templates.test.ts`, `npm run typecheck`, and `npm run build`. The browser test `scripts/test-menu-browser.mjs` requires installed Playwright Core, Chrome and an explicitly selected loopback synthetic workspace; it checks review invalidation, blocked printing, phone overflow and visible emoji validation. It produces a synthetic PDF for inspecting the print layout. Local checks do not establish hosted or installed-client release acceptance.
