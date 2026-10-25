// Local recipe/purchase lookups (F09).
import type { Db } from './db.js';
import type { Purchase, Recipe } from '../core/types.js';

export function getRecipe(db: Db, id: string): Recipe | null {
  const row = db.raw.prepare('SELECT data FROM recipes WHERE id = ?').get(id) as { data: string } | undefined;
  return row ? (JSON.parse(row.data) as Recipe) : null;
}

export function listRecipes(db: Db): Recipe[] {
  const rows = db.raw.prepare('SELECT data FROM recipes ORDER BY id').all() as Array<{ data: string }>;
  return rows.map((r) => JSON.parse(r.data) as Recipe);
}

export function getPurchasesFor(db: Db, ingredientId: string): Purchase[] {
  const rows = db.raw.prepare('SELECT data FROM purchases WHERE ingredient_id = ? ORDER BY data').all(ingredientId) as Array<{ data: string }>;
  return rows.map((r) => JSON.parse(r.data) as Purchase);
}

export function latestPurchaseByIngredient(db: Db): Map<string, Purchase> {
  const rows = db.raw.prepare('SELECT data FROM purchases').all() as Array<{ data: string }>;
  const map = new Map<string, Purchase>();
  for (const r of rows) {
    const p = JSON.parse(r.data) as Purchase;
    if(p.effectiveDate>new Date().toISOString().slice(0,10))continue;
    const cur = map.get(p.ingredientId);
    if (!cur || p.effectiveDate >= cur.effectiveDate) map.set(p.ingredientId, p);
  }
  return map;
}

export function allRecipes(db: Db): Map<string, Recipe> {
  const m = new Map<string, Recipe>();
  for (const r of listRecipes(db)) m.set(r.id, r);
  return m;
}
