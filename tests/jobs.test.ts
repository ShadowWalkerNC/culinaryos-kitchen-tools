// F18 jobs tests: duplicates, leases, restart, catch-up, bounded failures, DST.
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { openDb, type Db } from '../src/data/db.js';
import { fixedClock, occurrenceDay } from '../src/jobs/clocks.js';
import { tryAcquireLease } from '../src/jobs/leases.js';
import { handleCostImport, runDailyPrep, catchUpOnce, recoverInterrupted, aiStatus, DEFAULT_WORKER_CONFIG } from '../src/jobs/worker.js';
import { previewImport, commitImport } from '../src/data/imports.js';
import { listTasks } from '../src/data/tasks.js';

let db: Db;
beforeEach(() => { db = openDb(':memory:'); });
afterEach(() => { db.close(); });

const CFG = { ...DEFAULT_WORKER_CONFIG, dailyPrepEnabled: true, costReviewEnabled: true, timezone: 'UTC' };
const RECIPE = JSON.stringify([{ id: 'r1', name: 'R', currency: 'USD', yieldQty: { amount: '2', unit: 'serving' }, ingredients: [{ ingredientId: 'i1', qty: { amount: '1', unit: 'kg' } }], subrecipes: [] }]);

describe('jobs', () => {
  it('duplicate cost-import events create tasks once', () => {
    const p = previewImport(db, 'recipe_json', RECIPE);
    commitImport(db, p.token, true);
    const clock = fixedClock('2026-01-01T10:00:00Z');
    const a = handleCostImport(db, 'evt1', ['i1'], CFG, clock);
    const b = handleCostImport(db, 'evt1', ['i1'], CFG, clock);
    assert.equal(a.created.length, 1);
    assert.equal(b.skipped, true);
    assert.equal(listTasks(db).length, 1);
  });

  it('multi-worker lease: only one acquires', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    assert.equal(tryAcquireLease(db, 'k1', 'w1', 60_000, now), true);
    assert.equal(tryAcquireLease(db, 'k1', 'w2', 60_000, now), false);
  });

  it('daily prep completes with forecast; null forecast -> action-required', () => {
    const clock = fixedClock('2026-01-01T15:00:00Z');
    const ok = runDailyPrep(db, '2026-01-02', { demands: [{ recipeId: 'r1', servings: '10', servingUnit: 'serving', yieldPerBatch: '4' }], stock: [{ recipeId: 'r1', onHand: '0', unit: 'serving' }] }, CFG, clock);
    assert.equal(ok.status, 'completed');
    const miss = runDailyPrep(db, '2026-01-03', null, CFG, clock);
    assert.equal(miss.status, 'action-required');
    assert.match(listTasks(db).map((t) => t.title).join('|'), /action required/);
  });

  it('bounded failures: invalid demand retries then fails visibly', () => {
    const clock = fixedClock('2026-01-01T15:00:00Z');
    const bad = { demands: [{ recipeId: 'r1', servings: 'NaN!', servingUnit: 'serving', yieldPerBatch: '4' }], stock: [{ recipeId: 'r1', onHand: '0', unit: 'serving' }] };
    assert.equal(runDailyPrep(db, '2026-02-01', bad, CFG, clock).status, 'retrying');
    assert.equal(runDailyPrep(db, '2026-02-01', bad, CFG, clock).status, 'retrying');
    const fin = runDailyPrep(db, '2026-02-01', bad, CFG, clock);
    assert.equal(fin.status, 'failed');
    assert.match(listTasks(db).map((t) => t.title).join('|'), /failed/);
  });

  it('missed run catches up once', () => {
    const clock = fixedClock('2026-01-05T15:00:00Z');
    const f = { demands: [{ recipeId: 'r1', servings: '4', servingUnit: 'serving', yieldPerBatch: '4' }], stock: [{ recipeId: 'r1', onHand: '0', unit: 'serving' }] };
    assert.equal(catchUpOnce(db, '2026-01-04', f, CFG, clock).status, 'completed');
    assert.equal(catchUpOnce(db, '2026-01-04', f, CFG, clock).status, 'already-recorded');
  });

  it('restart recovery surfaces interrupted runs', () => {
    const clock = fixedClock('2026-01-01T15:00:00Z');
    const bad = { demands: [{ recipeId: 'r1', servings: 'xx', servingUnit: 'serving', yieldPerBatch: '4' }], stock: [{ recipeId: 'r1', onHand: '0', unit: 'serving' }] };
    runDailyPrep(db, '2026-03-01', bad, CFG, clock);
    const requeued = recoverInterrupted(db, clock);
    assert.deepEqual(requeued, ['2026-03-01']);
  });

  it('disabled schedules skip honestly', () => {
    const clock = fixedClock('2026-01-01T15:00:00Z');
    assert.equal(runDailyPrep(db, '2026-01-02', null, { ...CFG, dailyPrepEnabled: false }, clock).status, 'disabled');
  });

  it('AI placeholder honestly reports not configured', () => {
    assert.equal(aiStatus(CFG).configured, false);
    assert.match(aiStatus(CFG).message, /not configured/);
  });

  it('DST: occurrence days stable across spring forward and fall back (America/New_York)', () => {
    const spring = fixedClock('2026-03-08T06:59:00Z', 'America/New_York'); // 01:59 EST
    assert.equal(occurrenceDay(spring), '2026-03-08');
    spring.advance(2 * 60_000); // 03:01 EDT (skipped hour)
    assert.equal(occurrenceDay(spring), '2026-03-08');
    const fall = fixedClock('2026-11-01T04:30:00Z', 'America/New_York'); // 00:30 EDT
    assert.equal(occurrenceDay(fall), '2026-11-01');
    fall.advance(2 * 3600_000); // ambiguous hour -> 01:30 EST still same day
    assert.equal(occurrenceDay(fall), '2026-11-01');
  });
});
