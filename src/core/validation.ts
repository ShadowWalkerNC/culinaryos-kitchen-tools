// F05 validation: explicit, no guessing.
import { assertCents, assertCurrency } from './money.js';
import { assertQuantity } from './quantity.js';
import type { Purchase, Recipe } from './types.js';

export interface ValidationIssue {
  path: string;
  message: string;
}

export function validateRecipe(r: Recipe): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if(!r||!Array.isArray(r.ingredients)||!Array.isArray(r.subrecipes))return[{path:'recipe',message:'ingredients and subrecipes arrays required'}];
  if(r.ingredients.length>200||r.subrecipes.length>100)return[{path:'recipe',message:'recipe ingredient limit exceeded'}];
  try {
    if (!r.id || typeof r.id !== 'string') issues.push({ path: 'id', message: 'stable id required' });
    if (!r.name || typeof r.name !== 'string') issues.push({ path: 'name', message: 'name required' });
    assertCurrency(r.currency);
  } catch (e) {
    issues.push({ path: 'currency', message: (e as Error).message });
  }
  try {
    assertQuantity(r.yieldQty, 'yieldQty');
  } catch (e) {
    issues.push({ path: 'yieldQty', message: (e as Error).message });
  }
  for (let i = 0; i < r.ingredients.length; i++) {
    const ing = r.ingredients[i]!;
    try {
      if (!ing.ingredientId) throw new Error('ingredientId required');
      assertQuantity(ing.qty, `ingredients[${i}].qty`);
    } catch (e) {
      issues.push({ path: `ingredients[${i}]`, message: (e as Error).message });
    }
  }
  for (let i = 0; i < r.subrecipes.length; i++) {
    const s = r.subrecipes[i]!;
    try {
      if (!s.recipeId) throw new Error('recipeId required');
      assertQuantity(s.qty, `subrecipes[${i}].qty`);
      if (s.recipeId === r.id) throw new Error('self-reference cycle');
    } catch (e) {
      issues.push({ path: `subrecipes[${i}]`, message: (e as Error).message });
    }
  }
  for (const p of r.packaging ?? []) {
    try {
      assertCents(p.costCents, `packaging:${p.label}`);
    } catch (e) {
      issues.push({ path: `packaging:${p.label}`, message: (e as Error).message });
    }
  }
  for(const v of r.variants??[]){try{if(v.netPriceCents!==undefined)assertCents(v.netPriceCents,'variant price');if(typeof v.confirmed!=='boolean')throw new Error('variant confirmation required');}catch(e){issues.push({path:'variant',message:(e as Error).message});}}
  if (!Number.isInteger(r.version) || r.version < 1) issues.push({ path: 'version', message: 'version must be int >= 1' });
  return issues;
}

export function validatePurchase(p: Purchase): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  try {
    assertCurrency(p.currency);
    assertCents(p.costCents, 'costCents');
    assertQuantity(p.usableQty, 'usableQty');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.effectiveDate) || Number.isNaN(Date.parse(p.effectiveDate)) || new Date(p.effectiveDate).toISOString().slice(0,10)!==p.effectiveDate) throw new Error('effectiveDate must be ISO date');
    if (p.packBasis !== undefined && typeof p.packBasis !== 'string') throw new Error('packBasis must be string');
    if (p.densityGPerMl !== undefined && !/^\d+(\.\d{1,6})?$/.test(p.densityGPerMl)) throw new Error('densityGPerMl must be decimal');
  } catch (e) {
    issues.push({ path: p.id, message: (e as Error).message });
  }
  if (!Number.isInteger(p.version) || p.version < 1) issues.push({ path: 'version', message: 'version must be int >= 1' });
  return issues;
}

/** Detect cycles in subrecipe graph. Returns cycle path or null. */
export function findCycle(recipes: Map<string, Recipe>): string[] | null {
  const visited = new Set<string>();
  const stack: string[] = [];
  const inStack = new Set<string>();
  let cycle: string[] | null = null;
  const visit = (id: string): void => {
    if (cycle) return;
    if (inStack.has(id)) {
      cycle = [...stack.slice(stack.indexOf(id)), id];
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    inStack.add(id);
    stack.push(id);
    const r = recipes.get(id);
    if (r) for (const s of r.subrecipes) visit(s.recipeId);
    stack.pop();
    inStack.delete(id);
  };
  for (const id of recipes.keys()) visit(id);
  return cycle;
}
