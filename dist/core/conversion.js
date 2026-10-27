import { parseMicros, formatMicros, assertUnit } from './quantity.js';
const mass = { g: 1000000000000n, kg: 1000000000000000n, oz: 28349523125000n, lb: 453592370000000n };
// Factors are picolitres. Explicit names distinguish US customary and UK imperial volume.
const volume = { ml: 1000000000000n, l: 1000000000000000n, 'metric cup': 250000000000000n, 'us cup': 236588236500000n, 'us tbsp': 14786764781250n, 'us tsp': 4928921593750n, 'us fl oz': 29573529562500n, 'us pint': 473176473000000n, 'us quart': 946352946000000n, 'us gallon': 3785411784000000n, 'imperial fl oz': 28413062500000n, 'imperial pint': 568261250000000n, 'imperial quart': 1136522500000000n, 'imperial gallon': 4546090000000000n };
const aliases = { gram: 'g', grams: 'g', kilogram: 'kg', kilograms: 'kg', ounce: 'oz', ounces: 'oz', lbs: 'lb', pound: 'lb', pounds: 'lb', liter: 'l', litre: 'l', liters: 'l', litres: 'l', milliliter: 'ml', millilitre: 'ml', ea: 'each', pieces: 'piece', slices: 'slice', servings: 'serving' };
export function canonicalUnit(unit) { const u = assertUnit(unit).toLowerCase(); return aliases[u] ?? u; }
export function unitRatio(from, to, factor, basis) {
    const a = canonicalUnit(from), b = canonicalUnit(to);
    if (a === b)
        return [1n, 1n];
    for (const table of [mass, volume])
        if (table[a] !== undefined && table[b] !== undefined) {
            if (factor !== undefined) {
                const given = parseMicros(factor, 'factor');
                const difference = given * table[b] - table[a] * 1000000n;
                if ((difference < 0n ? -difference : difference) > table[b])
                    throw new Error('factor conflicts with defined dimensional conversion');
            }
            return [table[a], table[b]];
        }
    if (factor !== undefined) {
        if (!basis?.trim())
            throw new Error('explicit factorBasis required');
        const n = parseMicros(factor, 'factor');
        if (n <= 0n)
            throw new Error('factor must be > 0');
        return [n, 1000000n];
    }
    throw new Error('conversion requires explicit factor and factorBasis; no pack size or density guessed');
}
export function convertQuantity(req) {
    const q = parseMicros(req.amount, 'amount');
    if (q < 0n)
        throw new Error('amount must be >= 0');
    const [n, d] = unitRatio(req.fromUnit, req.toUnit, req.factor, req.factorBasis);
    return { amount: formatMicros((q * n + d / 2n) / d), unit: req.toUnit, basis: req.factorBasis ?? (canonicalUnit(req.fromUnit) === canonicalUnit(req.toUnit) ? 'same unit' : 'defined dimensional conversion') };
}
//# sourceMappingURL=conversion.js.map