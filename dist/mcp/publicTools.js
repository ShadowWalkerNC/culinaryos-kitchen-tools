// F08 public tools: stateless only. No DB, secrets, files, persistence, model calls.
import { validateRecipe, validatePurchase, findCycle } from '../core/validation.js';
import { scaleRecipe } from '../core/scaling.js';
import { convertQuantity } from '../core/conversion.js';
import { costRecipe } from '../core/costing.js';
import { comparePurchaseCosts } from '../core/purchase.js';
import { buildPrepPlan } from '../core/prep.js';
import { buildOrderProposal } from '../core/ordering.js';
import { listWorkflows, workflowGuidance } from '../workflows/discovery.js';
import { calculateUsableYield, reconcileStock, calculateEventBudget, validatePrepCapacity } from '../core/operations.js';
export const PUBLIC_TOOL_NAMES = [
    'list_capabilities',
    'get_workflow',
    'validate_kitchen_data',
    'scale_recipe',
    'convert_quantity',
    'cost_recipe',
    'compare_purchase_costs',
    'build_prep_plan',
    'build_order_proposal',
    'list_workflows', 'calculate_usable_yield', 'reconcile_stock', 'calculate_event_budget', 'validate_prep_capacity',
];
export function listCapabilities() {
    return { tools: [...PUBLIC_TOOL_NAMES], dataVersion: 'v1', mode: 'public-stateless' };
}
export function getWorkflow(name) {
    return workflowGuidance({ name });
}
export function validateKitchenData(recipes, purchases) {
    const issues = [];
    for (const r of recipes) {
        for (const i of validateRecipe(r))
            issues.push({ path: `${r.id ?? '?'}.${i.path}`, message: i.message });
    }
    for (const p of purchases) {
        for (const i of validatePurchase(p))
            issues.push({ path: `${p.id ?? '?'}.${i.path}`, message: i.message });
    }
    const map = new Map(recipes.map((r) => [r.id, r]));
    const cycle = findCycle(map);
    if (cycle)
        issues.push({ path: 'graph', message: `cycle: ${cycle.join(' -> ')}` });
    return { valid: issues.length === 0, issues, cycle };
}
export const publicHandlers = {
    list_capabilities: (() => listCapabilities()),
    get_workflow: workflowGuidance,
    list_workflows: listWorkflows,
    calculate_usable_yield: calculateUsableYield,
    reconcile_stock: reconcileStock,
    calculate_event_budget: calculateEventBudget,
    validate_prep_capacity: validatePrepCapacity,
    validate_kitchen_data: ((args) => validateKitchenData(args.recipes, args.purchases)),
    scale_recipe: ((args) => scaleRecipe(args.recipe, args.targetYieldAmount)),
    convert_quantity: ((args) => convertQuantity(args)),
    cost_recipe: ((args) => {
        if (new Set(args.recipes.map(r => r.id)).size !== args.recipes.length)
            throw new Error('duplicate recipe ID');
        if (new Set(args.purchasesByIngredient.map(p => p.ingredientId)).size !== args.purchasesByIngredient.length)
            throw new Error('select exactly one dated purchase record per ingredient');
        for (const p of args.purchasesByIngredient) {
            const issues = validatePurchase(p);
            if (issues.length)
                throw new Error(issues[0].message);
        }
        const recipes = new Map(args.recipes.map((r) => [r.id, r]));
        const pm = new Map(args.purchasesByIngredient.map((p) => [p.ingredientId, p]));
        return costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: args.targetRecipeId, ...(args.variantId ? { variantId: args.variantId } : {}) });
    }),
    compare_purchase_costs: ((args) => comparePurchaseCosts(args.options)),
    build_prep_plan: ((args) => buildPrepPlan(args.demand, args.stock)),
    build_order_proposal: ((args) => buildOrderProposal(args.lines)),
};
//# sourceMappingURL=publicTools.js.map