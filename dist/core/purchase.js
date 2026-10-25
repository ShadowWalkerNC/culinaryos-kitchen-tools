// F07 compare_purchase_costs: unit-cost ranking on matching units only.
import { parseMicros } from './quantity.js';
import { assertCurrency, assertCents } from './money.js';
export function comparePurchaseCosts(options) {
    if (options.length === 0)
        throw new Error('at least one option required');
    if (options.length > 500)
        throw new Error('purchase comparison limit exceeded');
    const currencies = new Set(options.map(o => assertCurrency(o.currency)));
    if (currencies.size !== 1)
        throw new Error('mixed currencies');
    const units = new Set(options.map((o) => o.qtyUnit.trim().toLowerCase()));
    if (units.size !== 1)
        throw new Error('all options must share the same unit; convert explicitly first');
    const rows = options.map((o) => {
        assertCents(o.costCents, 'purchase option cost');
        const q = parseMicros(o.qtyAmount, `option ${o.id} qty`);
        if (q <= 0n)
            throw new Error(`option ${o.id} qty must be > 0`);
        const unit = (o.costCents * 1_000_000) / Number(q);
        return { id: o.id, unitCostCentsPerUnit: unit };
    });
    const sorted = [...rows].sort((a, b) => a.unitCostCentsPerUnit - b.unitCostCentsPerUnit);
    return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}
//# sourceMappingURL=purchase.js.map