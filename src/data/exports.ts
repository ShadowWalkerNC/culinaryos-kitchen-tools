// F09 exports + backup: confined to workspace, no traversal.
import { mkdirSync, writeFileSync, lstatSync, existsSync, realpathSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { join, resolve, sep, isAbsolute, relative } from 'node:path';
import type { Db } from './db.js';
import {allRecipes,latestPurchaseByIngredient} from './queries.js';
import {costRecipe} from '../core/costing.js';
import {listConnectedFlows} from '../workflows/connected.js';
import {getRestaurantProfile} from '../workflows/profile.js';

export function assertInside(workspaceRoot: string, rel: string): string {
  if (rel === '' || rel.includes('\0') || isAbsolute(rel) || rel.split(/[\\/]/).includes('..') || rel.includes(':')) throw new Error('path traversal rejected');
  mkdirSync(workspaceRoot, { recursive: true });
  const root = realpathSync(workspaceRoot);
  const abs = resolve(root, rel);
  if (abs === root || !abs.startsWith(root + sep)) throw new Error('path traversal rejected');
  let current=root;
  for (const part of relative(root,abs).split(sep)) { current=join(current,part); if(existsSync(current) && lstatSync(current).isSymbolicLink())throw new Error('symlink/junction path rejected'); }
  return abs;
}

export function exportJson(db: Db, workspaceRoot: string, rel: string): string {
  const abs = assertInside(workspaceRoot, rel);
  const recipes = db.raw.prepare('SELECT data FROM recipes ORDER BY id').all() as Array<{ data: string }>;
  const purchases = db.raw.prepare('SELECT data FROM purchases ORDER BY id').all() as Array<{ data: string }>;
  const payload = JSON.stringify(
    { dataVersion: 'v1', workspaceVersion:2,exportedAt: new Date().toISOString(), recipes: recipes.map((r) => JSON.parse(r.data)), purchases: purchases.map((p) => JSON.parse(p.data)),profile:getRestaurantProfile(db),connectedFlows:listConnectedFlows(db),tasks:db.raw.prepare('SELECT * FROM tasks').all(),approvals:db.raw.prepare('SELECT * FROM approvals').all(),schedules:db.raw.prepare("SELECT * FROM workflows_config WHERE id='default'").all() },
    null,
    2,
  );
  mkdirSync(join(abs, '..'), { recursive: true });
  if (!abs.endsWith('.json')) throw new Error('JSON exports require .json extension');
  writeFileSync(abs, payload, {encoding:'utf8',flag:'wx'});
  return abs;
}

export function exportRecipeCards(db: Db, workspaceRoot: string, rel: string): string {
  const abs = assertInside(workspaceRoot, rel);
  const recipes = db.raw.prepare('SELECT data FROM recipes ORDER BY id').all() as Array<{ data: string }>;
  const lines = ['# Recipe cards (draft — verify before use)', ''];
  for (const r of recipes) {
    const d = JSON.parse(r.data) as { id: string; name: string; yieldQty: { amount: string; unit: string }; ingredients: Array<{ ingredientId: string; qty: { amount: string; unit: string } }> };
    lines.push(`## ${d.name} (${d.id})`, `Yield: ${d.yieldQty.amount} ${d.yieldQty.unit}`, '');
    for (const i of d.ingredients) lines.push(`- ${i.ingredientId}: ${i.qty.amount} ${i.qty.unit}`);
    lines.push('');
  }
  mkdirSync(join(abs, '..'), { recursive: true });
  if (!abs.endsWith('.md')) throw new Error('recipe cards require .md extension');
  writeFileSync(abs, lines.join('\n'), {encoding:'utf8',flag:'wx'});
  return abs;
}

export function backupDb(dbPath: string, workspaceRoot: string, rel: string): string {
  const abs = assertInside(workspaceRoot, rel);
  mkdirSync(join(abs, '..'), { recursive: true });
  if (existsSync(abs)) throw new Error('backup destination already exists');
  const source = new DatabaseSync(dbPath);
  try { source.prepare('VACUUM INTO ?').run(abs); } finally { source.close(); }
  return abs;
}

export function exportCostSheets(db:Db,workspaceRoot:string,rel:string):string {
 const abs=assertInside(workspaceRoot,rel);if(!abs.endsWith('.json'))throw new Error('cost sheets require .json extension');
 const recipes=allRecipes(db),purchasesByIngredient=latestPurchaseByIngredient(db);
 const sheets=[...recipes.values()].map(r=>({recipeId:r.id,version:r.version,source:r.provenance,cost:costRecipe({recipes,purchasesByIngredient,targetRecipeId:r.id}),purchaseVersions:r.ingredients.map(i=>({ingredientId:i.ingredientId,purchaseId:purchasesByIngredient.get(i.ingredientId)?.id,version:purchasesByIngredient.get(i.ingredientId)?.version}))}));
 mkdirSync(join(abs,'..'),{recursive:true});writeFileSync(abs,JSON.stringify({dataVersion:'v1',draft:true,exportedAt:new Date().toISOString(),sheets},null,2),{encoding:'utf8',flag:'wx'});return abs;
}
