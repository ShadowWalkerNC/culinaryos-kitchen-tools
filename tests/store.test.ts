// F18 store tests: invalid imports, optimistic concurrency, atomicity, traversal, approvals.
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb, type Db } from '../src/data/db.js';
import { previewImport, commitImport } from '../src/data/imports.js';
import { requestApproval, decideApproval } from '../src/data/tasks.js';
import { exportJson, backupDb, exportRecipeCards } from '../src/data/exports.js';
import { getRecipe } from '../src/data/queries.js';

let db: Db;
let ws: string;

beforeEach(() => {
  ws = mkdtempSync(join(tmpdir(), 'kt-'));
  db = openDb(':memory:');
});

afterEach(() => {
  db.close();
  rmSync(ws, { recursive: true, force: true });
});

const RECIPE = JSON.stringify([{ id: 'r1', name: 'R', currency: 'USD', yieldQty: { amount: '2', unit: 'serving' }, ingredients: [{ ingredientId: 'i1', qty: { amount: '1', unit: 'kg' } }], subrecipes: [] }]);

describe('imports', () => {
  it('preview then commit persists verified record', () => {
    const p = previewImport(db, 'recipe_json', RECIPE);
    assert.equal(p.records, 1);
    const c = commitImport(db, p.token, true);
    assert.deepEqual(c.committed, ['r1']);
    assert.equal(getRecipe(db, 'r1')?.version, 1);
  });

  it('invalid record rejected, nothing previewed', () => {
    assert.throws(() => previewImport(db, 'recipe_json', JSON.stringify([{ id: '', currency: 'XX' }])), /invalid/);
  });

  it('stale commit fails and writes nothing', () => {
    const p1 = previewImport(db, 'recipe_json', RECIPE);
    const p2 = previewImport(db, 'recipe_json', RECIPE);
    commitImport(db, p2.token, true);
    assert.throws(() => commitImport(db, p1.token, true), /STALE_VERSION/);
    assert.equal(getRecipe(db, 'r1')?.version, 1);
  });

  it('multi-record commit is atomic: one invalid fails all', () => {
    const two = JSON.stringify([
      { id: 'ok1', name: 'O', currency: 'USD', yieldQty: { amount: '1', unit: 'serving' }, ingredients: [], subrecipes: [] },
      { id: 'bad', name: '', currency: 'USD', yieldQty: { amount: '0', unit: 'serving' }, ingredients: [], subrecipes: [] },
    ]);
    assert.throws(() => previewImport(db, 'recipe_json', two), /invalid/);
    assert.equal(getRecipe(db, 'ok1'), null);
  });

  it('pasted text retained but never committable', () => {
    const p = previewImport(db, 'pasted_text', 'grandma soup recipe...');
    assert.equal(p.records, 0);
    assert.match(p.missing.join(' '), /unverified/);
    assert.throws(() => commitImport(db, p.token, true), /cannot be committed/);
  });

  it('CSV recipe import works', () => {
    const csv = 'recipe_id,recipe_name,currency,yield_amount,yield_unit,ingredient_id,qty_amount,qty_unit\nr9,Soup,USD,2,serving,i1,1,kg';
    const p = previewImport(db, 'recipe_csv', csv);
    assert.equal(p.records, 1);
    commitImport(db, p.token, true);
    assert.equal(getRecipe(db, 'r9')?.name, 'Soup');
  });

  it('negative purchase rejected', () => {
    assert.throws(() => previewImport(db, 'purchase_json', JSON.stringify([{ id: 'x', ingredientId: 'i', currency: 'USD', costCents: -5, usableQty: { amount: '1', unit: 'kg' }, effectiveDate: '2026-01-01' }])), /invalid/);
  });

  it('commit requires explicit confirm', () => {
    const p = previewImport(db, 'recipe_json', RECIPE);
    assert.throws(() => commitImport(db, p.token, false), /confirm/);
  });
});

describe('approvals', () => {
  it('request binds version; decide ok', () => {
    const p = previewImport(db, 'recipe_json', RECIPE);
    commitImport(db, p.token, true);
    const a = requestApproval(db, 'recipe', 'r1');
    assert.equal(a.objectVersion, 1);
    const d = decideApproval(db, a.id, true);
    assert.equal(d.state, 'approved');
  });

  it('stale approval fails after version bump', () => {
    const p = previewImport(db, 'recipe_json', RECIPE);
    commitImport(db, p.token, true);
    const a = requestApproval(db, 'recipe', 'r1');
    const p2 = previewImport(db, 'recipe_json', RECIPE);
    commitImport(db, p2.token, true);
    assert.throws(() => decideApproval(db, a.id, true), /STALE_VERSION/);
  });
});

describe('exports/backup traversal', () => {
  it('rejects parent traversal', () => {
    assert.throws(() => exportJson(db, ws, '../evil.json'), /traversal/);
    assert.throws(() => exportRecipeCards(db, ws, '../../evil.md'), /traversal/);
    assert.throws(() => backupDb(join(ws, 'x.sqlite'), ws, '../evil.sqlite'), /traversal/);
  });

  it('exports inside workspace', () => {
    const p = previewImport(db, 'recipe_json', RECIPE);
    commitImport(db, p.token, true);
    const f = exportJson(db, ws, 'exports/out.json');
    assert.match(f, /out\.json/);
  });
});
