import { z } from 'zod';
import { assertCurrency, assertCents } from './money.js';
import { assertQuantity, formatMicros, MICROS } from './quantity.js';
import { unitRatio } from './conversion.js';
const qty = z.object({ amount: z.string().max(32), unit: z.string().min(1).max(32) }).strict();
const cents = z.number().int().nonnegative().safe();
const id = z.string().min(1).max(200);
export const usableYieldSchema = z.object({ gross: qty, usable: qty, currency: z.string().regex(/^[A-Z]{3}$/).optional(), purchaseCostCents: cents.optional() }).strict();
export const stockSchema = z.object({ lines: z.array(z.object({ id, unit: z.string().min(1).max(32), opening: qty.nullable(), received: qty.nullable(), used: qty.nullable(), waste: qty.nullable(), closing: qty.nullable() }).strict()).min(1).max(1000) }).strict();
export const budgetSchema = z.object({ currency: z.string().regex(/^[A-Z]{3}$/), revenueCents: cents.nullable(), costs: z.array(z.object({ label: id, currency: z.string().regex(/^[A-Z]{3}$/), amountCents: cents.nullable() }).strict()).min(1).max(1000), targetContributionPercent: z.string().max(20).optional() }).strict();
export const capacitySchema = z.object({ resources: z.array(z.object({ id, capacity: z.number().int().positive().safe(), unit: id }).strict()).min(1).max(200), tasks: z.array(z.object({ id, resourceId: id, start: z.iso.datetime({ offset: true }), end: z.iso.datetime({ offset: true }), units: z.number().int().positive().safe(), unit: id }).strict()).max(2000) }).strict();
function safe(n) { if (n > BigInt(Number.MAX_SAFE_INTEGER) || n < -BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error('calculation overflow'); return Number(n); }
function rounded(n, d) { return safe((n * 2n + d) / (2n * d)); }
function unique(ids) { if (new Set(ids).size !== ids.length)
    throw new Error('duplicate identifier'); }
export function calculateUsableYield(input) {
    const p = usableYieldSchema.parse(input);
    const gross = assertQuantity(p.gross, 'gross'), usable = assertQuantity(p.usable, 'usable');
    const [n, d] = unitRatio(p.usable.unit, p.gross.unit);
    const usableNumerator = usable * n;
    if (usableNumerator > gross * d)
        throw new Error('usable quantity exceeds gross quantity');
    const result = { gross: p.gross, usable: p.usable, yieldPercent: formatMicros((usableNumerator * 100n * MICROS + gross * d / 2n) / (gross * d)), usableInGrossUnit: { amount: formatMicros((usableNumerator + d / 2n) / d), unit: p.gross.unit }, basis: 'supplied measured usable yield', rounding: 'half_up' };
    if (p.purchaseCostCents === undefined)
        return result;
    if (!p.currency)
        throw new Error('currency required with purchase cost');
    assertCurrency(p.currency);
    assertCents(p.purchaseCostCents, 'purchase cost');
    return { ...result, currency: p.currency, costCentsPerUsableUnit: rounded(BigInt(p.purchaseCostCents) * MICROS, usable), usableCostBasis: { numeratorCents: (BigInt(p.purchaseCostCents) * MICROS).toString(), denominator: usable.toString(), unit: p.usable.unit } };
}
export function reconcileStock(input) {
    const p = stockSchema.parse(input);
    unique(p.lines.map(x => x.id));
    const lines = p.lines.map(line => {
        const unknown = [];
        const values = [];
        for (const key of ['opening', 'received', 'used', 'waste', 'closing']) {
            const q = line[key];
            if (q === null) {
                unknown.push(key + ': measured quantity missing');
                continue;
            }
            const amount = assertQuantity(q, key, { allowZero: true });
            try {
                const [n, d] = unitRatio(q.unit, line.unit);
                values.push((amount * n + d / 2n) / d);
            }
            catch {
                unknown.push(key + ': incompatible unit; explicit basis required');
            }
        }
        if (unknown.length)
            return { id: line.id, unit: line.unit, status: 'partial', unknown };
        const [o, r, u, w, c] = values;
        const expected = o + r - u - w;
        return { id: line.id, unit: line.unit, status: expected < 0n ? 'conflict' : 'complete', expectedClosing: formatMicros(expected), countedClosing: formatMicros(c), variance: formatMicros(c - expected), unknown: expected < 0n ? ['recorded usage and waste exceed available stock'] : [] };
    });
    return { lines, complete: lines.every(l => l.status === 'complete'), basis: 'opening + received - used - observed waste; variance = counted - expected' };
}
export function calculateEventBudget(input) {
    const p = budgetSchema.parse(input);
    assertCurrency(p.currency);
    unique(p.costs.map(x => x.label));
    let known = 0n;
    const unknown = [];
    for (const c of p.costs) {
        if (c.currency !== p.currency)
            throw new Error('mixed currencies');
        if (c.amountCents === null)
            unknown.push(c.label);
        else
            known += BigInt(assertCents(c.amountCents, c.label));
    }
    const knownCostCents = safe(known);
    const complete = unknown.length === 0;
    let minimumRevenueCents;
    if (p.targetContributionPercent !== undefined) {
        const target = assertQuantity({ amount: p.targetContributionPercent, unit: 'percent' }, 'target', { allowZero: true });
        if (target >= 100n * MICROS)
            throw new Error('target must be below 100 percent');
        if (complete)
            minimumRevenueCents = safe((known * 100n * MICROS + (100n * MICROS - target) - 1n) / (100n * MICROS - target));
    }
    return { currency: p.currency, knownCostCents, unknown, complete, costCoverage: 'supplied categories only; omitted costs are not verified zero', revenueCents: p.revenueCents, ...(complete && p.revenueCents !== null ? { contributionCents: safe(BigInt(p.revenueCents) - known) } : {}), ...(minimumRevenueCents !== undefined ? { minimumRevenueCents, minimumPriceRounding: 'up' } : {}), label: 'contribution against supplied costs, not verified net profit' };
}
export function validatePrepCapacity(input) {
    const p = capacitySchema.parse(input);
    unique(p.resources.map(x => x.id));
    unique(p.tasks.map(x => x.id));
    const conflicts = [];
    for (const task of p.tasks) {
        if (Date.parse(task.end) <= Date.parse(task.start))
            throw new Error('task end must follow start');
        const resource = p.resources.find(r => r.id === task.resourceId);
        if (!resource || resource.unit !== task.unit)
            conflicts.push({ resourceId: task.resourceId, taskIds: [task.id], reason: !resource ? 'resource capacity missing' : 'task/resource units differ' });
    }
    for (const r of p.resources) {
        const tasks = p.tasks.filter(t => t.resourceId === r.id && t.unit === r.unit);
        const times = [...new Set(tasks.flatMap(t => [Date.parse(t.start), Date.parse(t.end)]))].sort((a, b) => a - b);
        for (let i = 0; i < times.length - 1; i++) {
            const start = times[i], end = times[i + 1];
            const active = tasks.filter(t => Date.parse(t.start) < end && Date.parse(t.end) > start);
            const occupied = active.reduce((n, t) => n + BigInt(t.units), 0n);
            if (occupied > BigInt(r.capacity))
                conflicts.push({ resourceId: r.id, start: new Date(start).toISOString(), end: new Date(end).toISOString(), taskIds: active.map(t => t.id), reason: 'simultaneous demand exceeds supplied capacity' });
        }
    }
    return { feasible: conflicts.length === 0, conflicts, checkedTasks: p.tasks.length, basis: 'supplied intervals and capacity; no extra equipment, staff, time or permissions inferred' };
}
//# sourceMappingURL=operations.js.map