// F18 adapter tests: fixture contract + cross-tenant rejection.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readExportFile } from '../src/adapter/culinaryosFile.js';

describe('culinaryos file adapter', () => {
  it('reads matching-tenant fixture', () => {
    const ws = mkdtempSync(join(tmpdir(), 'kta-'));
    try {
      writeFileSync(join(ws, 'exp.json'), JSON.stringify({ tenantId: 't1', dataVersion: 'v1', recipes: [{ id: 'r',name:'Synthetic recipe',currency:'USD',yieldQty:{amount:'1',unit:'serving'},ingredients:[{ingredientId:'i',qty:{amount:'1',unit:'g'}}],subrecipes:[] }], purchases: [] }));
      const out = readExportFile(ws, 't1', 'exp.json', true);
      assert.equal(out.tenantId, 't1');
      assert.equal(out.recipes.length, 1);
    } finally {
      rmSync(ws, { recursive: true, force: true });
    }
  });

  it('rejects cross-tenant files', () => {
    const ws = mkdtempSync(join(tmpdir(), 'kta-'));
    try {
      writeFileSync(join(ws, 'exp.json'), JSON.stringify({ tenantId: 'other', dataVersion: 'v1', recipes: [], purchases: [] }));
      assert.throws(() => readExportFile(ws, 't1', 'exp.json', true), /cross-tenant/);
    } finally {
      rmSync(ws, { recursive: true, force: true });
    }
  });

  it('requires confirm, explicit tenant, no traversal', () => {
    const ws = mkdtempSync(join(tmpdir(), 'kta-'));
    try {
      writeFileSync(join(ws, 'exp.json'), JSON.stringify({ tenantId: 't1', dataVersion: 'v1', recipes: [], purchases: [] }));
      assert.throws(() => readExportFile(ws, 't1', 'exp.json', false), /confirm/);
      assert.throws(() => readExportFile(ws, 'default', 'exp.json', true), /explicit tenant/);
      assert.throws(() => readExportFile(ws, 't1', '../evil.json', true), /traversal/);
    } finally {
      rmSync(ws, { recursive: true, force: true });
    }
  });
});
