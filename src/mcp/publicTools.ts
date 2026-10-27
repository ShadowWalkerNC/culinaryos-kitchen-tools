// F08 public tools: stateless only. No DB, secrets, files, persistence, model calls.
import { validateRecipe, validatePurchase, findCycle } from '../core/validation.js';
import { scaleRecipe } from '../core/scaling.js';
import { convertQuantity } from '../core/conversion.js';
import { costRecipe } from '../core/costing.js';
import { comparePurchaseCosts } from '../core/purchase.js';
import { buildPrepPlan } from '../core/prep.js';
import { buildOrderProposal } from '../core/ordering.js';
import type { Purchase, Recipe } from '../core/types.js';
import {listWorkflows,workflowGuidance} from '../workflows/discovery.js';
import {calculateUsableYield,reconcileStock,calculateEventBudget,validatePrepCapacity} from '../core/operations.js';
import {getStarted} from '../workflows/getStarted.js';
import {standardizeRecipeUnits} from '../core/standardize.js';
import {calculateMenuMargins,calculateStaffingBudget,calculateBakeryFormula} from '../core/business.js';
import {formatMenu} from '../core/menus.js';
import {findKitchenHelp} from '../workflows/help.js';

export const PUBLIC_TOOL_NAMES = [
  'find_kitchen_help',
  'format_menu',
  'calculate_menu_margins','calculate_staffing_budget','calculate_bakery_formula',
  'get_started','standardize_recipe_units',
  'list_capabilities',
  'get_workflow',
  'validate_kitchen_data',
  'scale_recipe',
  'convert_quantity',
  'cost_recipe',
  'compare_purchase_costs',
  'build_prep_plan',
  'build_order_proposal',
  'list_workflows','calculate_usable_yield','reconcile_stock','calculate_event_budget','validate_prep_capacity',
] as const;

export type PublicToolName = (typeof PUBLIC_TOOL_NAMES)[number];

export function listCapabilities(): { tools: string[]; dataVersion: string; mode: string } {
  return { tools: [...PUBLIC_TOOL_NAMES], dataVersion: 'v1', mode: 'public-stateless' };
}

export function getWorkflow(name: string) {
  return workflowGuidance({name});
}

export function validateKitchenData(recipes: Recipe[], purchases: Purchase[]): { valid: boolean; issues: Array<{ path: string; message: string }>; cycle: string[] | null } {
  const issues: Array<{ path: string; message: string }> = [];
  for (const r of recipes) {
    for (const i of validateRecipe(r)) issues.push({ path: `${r.id ?? '?'}.${i.path}`, message: i.message });
  }
  for (const p of purchases) {
    for (const i of validatePurchase(p)) issues.push({ path: `${p.id ?? '?'}.${i.path}`, message: i.message });
  }
  const map = new Map(recipes.map((r) => [r.id, r]));
  const cycle = findCycle(map);
  if (cycle) issues.push({ path: 'graph', message: `cycle: ${cycle.join(' -> ')}` });
  return { valid: issues.length === 0, issues, cycle };
}

export const publicHandlers: Record<PublicToolName, (args: never) => unknown> = {
  find_kitchen_help:findKitchenHelp as (args:never)=>unknown,
  format_menu:formatMenu as (args:never)=>unknown,
  calculate_menu_margins:calculateMenuMargins as (args:never)=>unknown,
  calculate_staffing_budget:calculateStaffingBudget as (args:never)=>unknown,
  calculate_bakery_formula:calculateBakeryFormula as (args:never)=>unknown,
  get_started:getStarted as (args:never)=>unknown,
  standardize_recipe_units:standardizeRecipeUnits as (args:never)=>unknown,
  list_capabilities: (() => listCapabilities()) as (args: never) => unknown,
  get_workflow: workflowGuidance as (args: never) => unknown,
  list_workflows:listWorkflows as (args:never)=>unknown,
  calculate_usable_yield:calculateUsableYield as (args:never)=>unknown,
  reconcile_stock:reconcileStock as (args:never)=>unknown,
  calculate_event_budget:calculateEventBudget as (args:never)=>unknown,
  validate_prep_capacity:validatePrepCapacity as (args:never)=>unknown,
  validate_kitchen_data: ((args: { recipes: Recipe[]; purchases: Purchase[] }) => validateKitchenData(args.recipes, args.purchases)) as unknown as (args: never) => unknown,
  scale_recipe: ((args: { recipe: Recipe; targetYieldAmount: string }) => scaleRecipe(args.recipe, args.targetYieldAmount)) as unknown as (args: never) => unknown,
  convert_quantity: ((args: { amount: string; fromUnit: string; toUnit: string; factor?: string; factorBasis?: string }) => convertQuantity(args)) as unknown as (args: never) => unknown,
  cost_recipe: ((args: { recipes: Recipe[]; purchasesByIngredient: Purchase[]; targetRecipeId: string; variantId?: string }) => {
    if(new Set(args.recipes.map(r=>r.id)).size!==args.recipes.length)throw new Error('duplicate recipe ID');
    if(new Set(args.purchasesByIngredient.map(p=>p.ingredientId)).size!==args.purchasesByIngredient.length)throw new Error('select exactly one dated purchase record per ingredient');
    for(const p of args.purchasesByIngredient){const issues=validatePurchase(p);if(issues.length)throw new Error(issues[0]!.message);}
    const recipes = new Map(args.recipes.map((r) => [r.id, r]));
    const pm = new Map(args.purchasesByIngredient.map((p) => [p.ingredientId, p]));
    return costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: args.targetRecipeId, ...(args.variantId ? { variantId: args.variantId } : {}) });
  }) as unknown as (args: never) => unknown,
  compare_purchase_costs: ((args: { options: Parameters<typeof comparePurchaseCosts>[0] }) => comparePurchaseCosts(args.options)) as unknown as (args: never) => unknown,
  build_prep_plan: ((args: { demand: Parameters<typeof buildPrepPlan>[0]; stock: Parameters<typeof buildPrepPlan>[1] }) => buildPrepPlan(args.demand, args.stock)) as unknown as (args: never) => unknown,
  build_order_proposal: ((args: { lines: Parameters<typeof buildOrderProposal>[0] }) => buildOrderProposal(args.lines)) as unknown as (args: never) => unknown,
};
