import { z } from 'zod';
// Fixed text-only templates: no generated images, emoji decoration, arbitrary HTML, fonts or CSS.
const clean = z.string().trim().max(2000).refine(s => !/[\p{Extended_Pictographic}\p{Regional_Indicator}]|[#*0-9]\uFE0F?\u20E3/u.test(s), 'Use plain text without decorative emoji');
const short = clean.refine(s => s.length <= 200, 'Use at most200 characters');
const money = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const MENU_TEMPLATES = [
    { id: 'restaurant', name: 'Restaurant', description: 'Quiet two-column menu with section rules, restrained headings and aligned prices.' },
    { id: 'counter', name: 'Cafe / food truck', description: 'Single-column list with larger item names and clear prices.' },
    { id: 'bakery', name: 'Bakery price list', description: 'Compact two-column list with room for user-supplied unit labels.' },
    { id: 'prix-fixe', name: 'Prix fixe', description: 'Centered course sections with one explicit menu price.' },
];
export const menuSchema = z.object({ templateId: z.enum(['restaurant', 'counter', 'bakery', 'prix-fixe']), paper: z.enum(['Letter', 'A4']), title: short.refine(s => s.length > 0, 'Menu title required'), businessName: short.optional(), subtitle: short.optional(), currency: z.string().regex(/^[A-Z]{3}$/).optional(), locale: z.string().max(80).default('en-US').refine(s => { try {
        new Intl.NumberFormat(s);
        return true;
    }
    catch {
        return false;
    } }, 'Valid display locale required'), menuPriceCents: money.nullable().optional(), footer: clean.optional(), sections: z.array(z.object({ title: short.refine(s => s.length > 0, 'Section title required'), items: z.array(z.object({ name: short.refine(s => s.length > 0, 'Item name required'), description: clean.optional(), priceCents: money.nullable(), priceLabel: short.optional(), unitLabel: short.optional() }).strict()).max(100) }).strict()).min(1).max(20) }).strict();
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
function price(cents, currency, locale) {
    // Integer cents stay exact even near MAX_SAFE_INTEGER; Intl only formats the whole major unit.
    const whole = Number(BigInt(cents) / 100n), fraction = String(BigInt(cents) % 100n).padStart(2, '0');
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).formatToParts(whole);
    return parts.map(p => p.type === 'fraction' ? fraction : p.value).join('');
}
export function formatMenu(input) {
    const p = menuSchema.parse(input), warnings = [];
    const priced = p.menuPriceCents !== undefined && p.menuPriceCents !== null || p.sections.some(s => s.items.some(i => i.priceCents !== null));
    if (priced && !p.currency)
        warnings.push('Supply an explicit currency before publishing monetary prices.');
    if (p.templateId === 'prix-fixe' && (p.menuPriceCents === undefined || p.menuPriceCents === null))
        warnings.push('Prix-fixe menu price has not been supplied.');
    if (!p.sections.some(s => s.items.length))
        warnings.push('This is an empty boilerplate; no dishes have been supplied.');
    for (const section of p.sections)
        if (!section.items.length)
            warnings.push(`Section has no confirmed dishes: ${section.title}`);
    const show = (amount, label) => amount !== null && amount !== undefined ? (p.currency ? price(amount, p.currency, p.locale) : '') : label ?? '';
    const sections = p.sections.map(s => ({ title: s.title, items: s.items.map(i => { if (i.priceCents !== null && i.priceLabel)
            throw Error('Use a monetary price or explicit price label, not both'); if (p.templateId !== 'prix-fixe' && i.priceCents === null && !i.priceLabel)
            warnings.push(`Price unresolved: ${i.name}`); return { ...i, displayPrice: show(i.priceCents, i.priceLabel) }; }) }));
    const text = sections.map(s => s.title + '\n' + s.items.map(i => i.name + (i.displayPrice ? ' — ' + i.displayPrice : '') + (i.unitLabel ? ' / ' + i.unitLabel : '') + (i.description ? '\n' + i.description : '')).join('\n\n')).join('\n\n');
    const html = `<!doctype html><html lang="${escape(p.locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; base-uri 'none'; form-action 'none'"><title>${escape(p.title)}</title><style>*{box-sizing:border-box}body{margin:0;color:#161616;background:#fff;font:11pt/1.4 Georgia,'Times New Roman',serif}.menu{max-width:190mm;margin:auto;padding:12mm}header{text-align:center;border-bottom:1px solid #222;padding-bottom:6mm;margin-bottom:6mm}h1{font-size:27pt;font-weight:400;margin:2mm 0}header p{margin:2mm 0}.sections{column-count:2;column-gap:10mm}section{break-inside:avoid;margin-bottom:7mm}h2{font:600 11pt/1.3 Arial,sans-serif;letter-spacing:.04em;border-bottom:1px solid #bbb;padding-bottom:2mm;margin:0 0 3mm}.item{break-inside:avoid;margin:0 0 3.5mm}.item-line{display:flex;gap:4mm;justify-content:space-between}.item-name{font-weight:600}.price{white-space:nowrap;font-variant-numeric:tabular-nums}.description{font-size:9.5pt;margin:1mm 0;color:#333}.unit{font-size:9pt}footer{border-top:1px solid #bbb;margin-top:7mm;padding-top:3mm;font-size:9pt;white-space:pre-wrap}.counter .sections{column-count:1}.counter h1{font-size:30pt}.counter .item-name,.counter .price{font-size:16pt}.counter .item{margin-bottom:5mm}.bakery .item{margin-bottom:2.5mm}.prix-fixe .sections{column-count:1;text-align:center}.prix-fixe .item-line{justify-content:center}.prix-fixe section{margin-bottom:8mm}.menu-price{font-size:13pt}@page{size:${p.paper};margin:10mm}@media print{.menu{max-width:none;padding:0}}@media screen and (max-width:600px){.menu{padding:6mm}.sections{column-count:1}}</style></head><body><main class="menu ${p.templateId}"><header>${p.businessName ? `<p>${escape(p.businessName)}</p>` : ''}<h1>${escape(p.title)}</h1>${p.subtitle ? `<p>${escape(p.subtitle)}</p>` : ''}${p.templateId === 'prix-fixe' && p.menuPriceCents !== null && p.menuPriceCents !== undefined && p.currency ? `<p class="menu-price">${escape(show(p.menuPriceCents))}</p>` : ''}</header><div class="sections">${sections.map(s => `<section><h2>${escape(s.title)}</h2>${s.items.map(i => `<div class="item"><div class="item-line"><span class="item-name">${escape(i.name)}</span>${i.displayPrice ? `<span class="price">${escape(i.displayPrice)}</span>` : ''}</div>${i.unitLabel ? `<div class="unit">${escape(i.unitLabel)}</div>` : ''}${i.description ? `<p class="description">${escape(i.description)}</p>` : ''}</div>`).join('')}</section>`).join('')}</div>${p.footer ? `<footer>${escape(p.footer)}</footer>` : ''}</main></body></html>`;
    return { template: MENU_TEMPLATES.find(t => t.id === p.templateId), paper: p.paper, currency: p.currency ?? null, contentStatus: 'draft', humanReviewRequired: true, publicationBlockers: warnings, html, plainText: [p.businessName, p.title, p.subtitle, p.templateId === 'prix-fixe' ? show(p.menuPriceCents) : '', text, p.footer].filter(Boolean).join('\n\n'), saved: false, basis: 'Only supplied menu content is formatted. No dishes, prices, dietary claims, emoji, imagery or external assets are generated. Review names, prices and any claims before printing or publishing.' };
}
//# sourceMappingURL=menus.js.map