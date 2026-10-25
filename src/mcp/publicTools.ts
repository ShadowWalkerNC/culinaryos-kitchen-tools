// F08 public tools: stateless only. No DB, secrets, files, persistence, model calls.
import { validateRecipe, validatePurchase, findCycle } from '../core/validation.js';
import { scaleRecipe } from '../core/scaling.js';
import { convertQuantity } from '../core/conversion.js';
import { costRecipe } from '../core/costing.js';
import { comparePurchaseCosts } from '../core/purchase.js';
import { buildPrepPlan } from '../core/prep.js';
import { buildOrderProposal } from '../core/ordering.js';
import type { Purchase, Recipe } from '../core/types.js';
import {WORKFLOW_TEXT} from './workflowText.js';

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
] as const;

export type PublicToolName = (typeof PUBLIC_TOOL_NAMES)[number];

// Original workflow guidance (host writes narrative drafts; F16 skills expand these).
const WORKFLOWS: Record<string, { title: string; steps: string[]; approvals: string }> = {
  onboarding: {
    title: 'Onboarding: set up a workspace',
    steps: ['Create workspace dir', 'Import recipes/purchases via preview then commit', 'Review validation issues', 'Approve records', 'Run first costing'],
    approvals: 'Commits require preview review; approvals bind exact versions.',
  },
  'data-reconciliation': {
    title: 'Data reconciliation: resolve conflicts',
    steps: ['List conflicts from preview', 'Compare current vs incoming versions', 'Correct source data', 'Re-preview and commit'],
    approvals: 'Stale versions fail; re-preview required.',
  },
  'recipe-documentation': {
    title: 'Recipe documentation: draft cards',
    steps: ['Confirm recipe + yield', 'List ingredients with units', 'Export recipe cards (draft)', 'Human review before use'],
    approvals: 'Documents are drafts; approval required before kitchen use.',
  },
  'recipe-scaling': {
    title: 'Recipe scaling',
    steps: ['Confirm current yield', 'Supply target yield', 'Scale via tool', 'Verify units unchanged'],
    approvals: 'Scaled output is a draft until reviewed.',
  },
  'recipe-costing': {
    title: 'Recipe costing',
    steps: ['Supply purchases with usable qty/unit', 'Run cost_recipe', 'Resolve unknown inputs', 'Margin only on confirmed price'],
    approvals: 'Packaging reported separately; margin never labeled net profit.',
  },
  'purchase-price-review': {
    title: 'Purchase price review',
    steps: ['Collect options in same unit', 'Compare unit costs', 'Record effective dates', 'Commit confirmed purchase'],
    approvals: 'Commit requires preview review.',
  },
  'menu-margin-review': {
    title: 'Menu margin review',
    steps: ['Cost recipe fully (no unknowns)', 'Confirm variant net price', 'Compute ingredient gross margin', 'Export cost sheet draft'],
    approvals: 'Margin needs confirmed price; drafts only.',
  },
  'prep-planning': {
    title: 'Prep planning',
    steps: ['Supply demand servings + yield per batch', 'Supply on-hand stock', 'Build plan', 'Review batches'],
    approvals: 'Plan is deterministic draft from supplied inputs.',
  },
  'ordering-proposals': {
    title: 'Ordering proposals',
    steps: ['Supply par, on-hand, on-order', 'Build proposal', 'Round only to supplied pack size', 'Review before ordering'],
    approvals: 'Proposal is a draft; human places orders.',
  },
  'waste-review': {
    title: 'Waste review',
    steps: ['Record observed waste with units', 'Compare vs prep plan', 'Note causes', 'Adjust pars manually'],
    approvals: 'No invented waste; observations only.',
  },
  'sop-drafting': {
    title: 'SOP drafting',
    steps: ['List steps from confirmed practice', 'Mark checks requiring readings', 'Export draft', 'Human approves'],
    approvals: 'Never fabricate safety limits, allergens, readings, or signatures.',
  },
  'daily-close-review': {
    title: 'Daily close review',
    steps: ['Review tasks states', 'Resolve awaiting approvals', 'Record run history', 'Plan tomorrow prep'],
    approvals: 'Close requires completed or explicitly blocked/cancelled tasks.',
  },
};

export function listCapabilities(): { tools: string[]; dataVersion: string; mode: string } {
  return { tools: [...PUBLIC_TOOL_NAMES], dataVersion: 'v1', mode: 'public-stateless' };
}

export function getWorkflow(name: string): { title: string; steps: string[]; approvals: string; instructions:string } {
  const w = WORKFLOWS[name];
  if (!w) throw new Error(`unknown workflow ${name}; available: ${Object.keys(WORKFLOWS).join(', ')}`);
  return {...w,instructions:WORKFLOW_TEXT[name]??''};
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
  list_capabilities: (() => listCapabilities()) as (args: never) => unknown,
  get_workflow: ((args: { name: string }) => getWorkflow(args.name)) as unknown as (args: never) => unknown,
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
