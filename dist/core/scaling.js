// F07 scaling: scale recipe quantities by targetYield / currentYield.
import { parseMicros, formatMicros, scaleMicros, assertQuantity } from './quantity.js';
export function scaleRecipe(recipe, targetYieldAmount) {
    const current = parseMicros(recipe.yieldQty.amount, 'yieldQty.amount');
    const target = parseMicros(targetYieldAmount, 'targetYield');
    if (current <= 0n)
        throw new Error('current yield must be > 0');
    if (target <= 0n)
        throw new Error('target yield must be > 0');
    const scaled = {
        ...recipe,
        yieldQty: { amount: formatMicros(target), unit: recipe.yieldQty.unit },
        ingredients: recipe.ingredients.map((i) => {
            const m = assertQuantity(i.qty, 'qty');
            return { ...i, qty: { amount: formatMicros(scaleMicros(m, target, current)), unit: i.qty.unit } };
        }),
        subrecipes: recipe.subrecipes.map((s) => {
            const m = assertQuantity(s.qty, 'qty');
            return { ...s, qty: { amount: formatMicros(scaleMicros(m, target, current)), unit: s.qty.unit } };
        }),
    };
    return scaled;
}
//# sourceMappingURL=scaling.js.map