// F18 core golden tests: costing, conversions, cycles, unknowns, variants, currency, rounding.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { costRecipe } from '../src/core/costing.js';
import { scaleRecipe } from '../src/core/scaling.js';
import { convertQuantity } from '../src/core/conversion.js';
import { comparePurchaseCosts } from '../src/core/purchase.js';
import { buildPrepPlan } from '../src/core/prep.js';
import { buildOrderProposal } from '../src/core/ordering.js';
import type { Purchase, Recipe } from '../src/core/types.js';

const prov = { source: 'test', receivedAt: '2026-01-01T00:00:00Z', verified: true };

function recipe(over: Partial<Recipe> = {}): Recipe {
  return {
    id: 'r1', name: 'Golden Soup', currency: 'USD',
    yieldQty: { amount: '4', unit: 'serving' },
    ingredients: [
      { ingredientId: 'flour', qty: { amount: '0.5', unit: 'kg' } },
      { ingredientId: 'sugar', qty: { amount: '0.25', unit: 'kg' } },
    ],
    subrecipes: [],
    version: 1, provenance: prov, ...over,
  };
}

function purchase(over: Partial<Purchase> = {}): Purchase {
  return {
    id: 'p1', ingredientId: 'flour', currency: 'USD', costCents: 1000,
    usableQty: { amount: '1', unit: 'kg' }, effectiveDate: '2026-01-01',
    version: 1, provenance: prov, ...over,
  };
}

describe('golden costing', () => {
  it('costs flour 500 + sugar 100 = 600, per-unit 150', () => {
    const recipes = new Map([['r1', recipe()]]);
    const pm = new Map([
      ['flour', purchase()],
      ['sugar', purchase({ id: 'p2', ingredientId: 'sugar', costCents: 400 })],
    ]);
    const out = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1' });
    assert.equal(out.knownCents, 600);
    assert.equal(out.unknown.length, 0);
    assert.equal(out.perUnitCents, 150);
    assert.deepEqual(out.coverage, { known: 2, total: 2 });
  });

  it('half-up rounding: 100c/3u for 1u = 33c', () => {
    const recipes = new Map([['r1', recipe({ ingredients: [{ ingredientId: 'x', qty: { amount: '1', unit: 'kg' } }] })]]);
    const pm = new Map([['x', purchase({ id: 'p', ingredientId: 'x', costCents: 100, usableQty: { amount: '3', unit: 'kg' } })]]);
    const out = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1' });
    assert.equal(out.knownCents, 33);
  });

  it('missing purchase stays unknown, never zero', () => {
    const recipes = new Map([['r1', recipe()]]);
    const pm = new Map([['flour', purchase()]]);
    const out = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1' });
    assert.equal(out.knownCents, 500);
    assert.equal(out.unknown.length, 1);
    assert.match(out.unknown[0]!.reason, /no purchase cost/);
    assert.equal(out.perUnitCents, undefined);
  });

  it('unit mismatch is unknown, not guessed', () => {
    const recipes = new Map([['r1', recipe()]]);
    const pm = new Map([
      ['flour', purchase()],
      ['sugar', purchase({ id: 'p2', ingredientId: 'sugar', costCents: 400, usableQty: { amount: '1', unit: 'l' } })],
    ]);
    const out = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1' });
    assert.equal(out.unknown.length, 1);
    assert.match(out.unknown[0]!.reason, /unit mismatch/);
  });

  it('margin only on confirmed variant', () => {
    const r = recipe({ variants: [{ id: 'v1', netPriceCents: 1000, confirmed: true }, { id: 'v2', netPriceCents: 999, confirmed: false }] });
    const recipes = new Map([['r1', r]]);
    const pm = new Map([['flour', purchase()], ['sugar', purchase({ id: 'p2', ingredientId: 'sugar', costCents: 400 })]]);
    const yes = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1', variantId: 'v1' });
    assert.equal(yes.ingredientGrossMarginCents, 850);
    const no = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1', variantId: 'v2' });
    assert.equal(no.ingredientGrossMarginCents, undefined);
    const none = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1' });
    assert.equal(none.ingredientGrossMarginCents, undefined);
  });

  it('packaging reported separately', () => {
    const r = recipe({ packaging: [{ label: 'box', costCents: 50 }] });
    const recipes = new Map([['r1', r]]);
    const pm = new Map([['flour', purchase()], ['sugar', purchase({ id: 'p2', ingredientId: 'sugar', costCents: 400 })]]);
    const out = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1' });
    assert.equal(out.packagingCents, 50);
    assert.equal(out.knownCents, 600);
  });

  it('subrecipe quantities scale cost', () => {
    const sub = recipe({ id: 'sub', yieldQty: { amount: '1', unit: 'kg' }, ingredients: [{ ingredientId: 'flour', qty: { amount: '1', unit: 'kg' } }] });
    const main = recipe({ id: 'main', ingredients: [], subrecipes: [{ recipeId: 'sub', qty: { amount: '0.5', unit: 'kg' } }] });
    const recipes = new Map([['sub', sub], ['main', main]]);
    const pm = new Map([['flour', purchase()]]);
    const out = costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'main' });
    assert.equal(out.knownCents, 500);
  });

  it('detects nested cycles', () => {
    const a = recipe({ id: 'a', ingredients: [], subrecipes: [{ recipeId: 'b', qty: { amount: '1', unit: 'serving' } }] });
    const b = recipe({ id: 'b', ingredients: [], subrecipes: [{ recipeId: 'a', qty: { amount: '1', unit: 'serving' } }] });
    assert.throws(() => costRecipe({ recipes: new Map([['a', a], ['b', b]]), purchasesByIngredient: new Map(), targetRecipeId: 'a' }), /cycle/);
  });

  it('rejects mixed currencies', () => {
    const recipes = new Map([['r1', recipe()]]);
    const pm = new Map([['flour', purchase()], ['sugar', purchase({ id: 'p2', ingredientId: 'sugar', currency: 'EUR', costCents: 400 })]]);
    assert.throws(() => costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1' }), /mixed currencies/);
  });

  it('rejects zero yield', () => {
    const recipes = new Map([['r1', recipe({ yieldQty: { amount: '0', unit: 'serving' } })]]);
    assert.throws(() => costRecipe({ recipes, purchasesByIngredient: new Map(), targetRecipeId: 'r1' }), /> 0/);
  });

  it('rejects negative ingredient qty', () => {
    const recipes = new Map([['r1', recipe({ ingredients: [{ ingredientId: 'flour', qty: { amount: '-1', unit: 'kg' } }] })]]);
    const pm = new Map([['flour', purchase()]]);
    assert.throws(() => costRecipe({ recipes, purchasesByIngredient: pm, targetRecipeId: 'r1' }), /must be >= 0/);
  });
});

describe('scaling/conversion/purchase/prep/order', () => {
  it('scales 4 -> 8 servings doubling quantities', () => {
    const out = scaleRecipe(recipe(), '8');
    assert.equal(out.yieldQty.amount, '8');
    assert.equal(out.ingredients[0]!.qty.amount, '1');
    assert.equal(out.ingredients[1]!.qty.amount, '0.5');
  });

  it('same-unit conversion is identity', () => {
    assert.deepEqual(convertQuantity({ amount: '2.5', fromUnit: 'kg', toUnit: 'kg' }), { amount: '2.5', unit: 'kg', basis: 'same unit' });
  });

  it('defined dimensions convert without density; unrelated dimensions need evidence', () => {
    assert.equal(convertQuantity({ amount: '1', fromUnit: 'kg', toUnit: 'g' }).amount, '1000');
    assert.throws(() => convertQuantity({ amount: '1', fromUnit: 'kg', toUnit: 'ml' }), /explicit factor/);
    const out = convertQuantity({ amount: '1', fromUnit: 'kg', toUnit: 'g', factor: '1000', factorBasis: 'metric' });
    assert.equal(out.amount, '1000');
  });

  it('ranks purchases, rejects mixed units', () => {
    const ranked = comparePurchaseCosts([
      { id: 'a', currency:'USD', costCents: 300, qtyAmount: '1', qtyUnit: 'kg', effectiveDate: '2026-01-01' },
      { id: 'b', currency:'USD', costCents: 500, qtyAmount: '2', qtyUnit: 'kg', effectiveDate: '2026-01-01' },
    ]);
    assert.equal(ranked[0]!.id, 'b');
    assert.throws(() => comparePurchaseCosts([
      { id: 'a', currency:'USD', costCents: 1, qtyAmount: '1', qtyUnit: 'kg', effectiveDate: '2026-01-01' },
      { id: 'b', currency:'USD', costCents: 1, qtyAmount: '1', qtyUnit: 'l', effectiveDate: '2026-01-01' },
    ]), /same unit/);
  });

  it('prep plan: demand 10, batch 4, stock 3 -> 2 batches, make 8', () => {
    const plan = buildPrepPlan(
      [{ recipeId: 'r1', servings: '10', servingUnit: 'serving', yieldPerBatch: '4' }],
      [{ recipeId: 'r1', onHand: '3', unit: 'serving' }],
    );
    assert.equal(plan[0]!.batches, 2);
    assert.equal(plan[0]!.toMake, '8');
  });

  it('order proposal: par 10 hand 3 order 2 -> 5; pack 4 -> 8', () => {
    const [a] = buildOrderProposal([{ ingredientId: 'i', par: '10', onHand: '3', onOrder: '2', unit: 'kg' }]);
    assert.equal(a!.orderQty, '5');
    const [b] = buildOrderProposal([{ ingredientId: 'i', par: '10', onHand: '3', onOrder: '2', unit: 'kg', packSize: '4' }]);
    assert.equal(b!.orderQty, '8');
    assert.equal(b!.packs, 2);
  });
});
