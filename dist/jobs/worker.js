// F12 durable workflow worker. Rules-only; no external sends; AI placeholder reports not configured.
import { randomUUID, createHash } from 'node:crypto';
import { capacitySchema } from '../core/operations.js';
import { buildOrderProposalSchema } from '../mcp/schemas.js';
import { runConnectedFlow, listConnectedFlows } from '../workflows/connected.js';
import { nowIso, transact } from '../data/db.js';
import { createTask } from '../data/tasks.js';
import { tryAcquireLease, releaseLease } from './leases.js';
import { occurrenceDay, pastCutoff } from './clocks.js';
import { buildPrepPlan } from '../core/prep.js';
import { listRecipes } from '../data/queries.js';
export const DEFAULT_WORKER_CONFIG = {
    timezone: 'UTC',
    dailyCutoff: '14:00',
    dailyPrepEnabled: false,
    costReviewEnabled: false,
};
export function aiStatus(config) {
    return { configured: false, message: 'AI generation not configured; rules-only output produced' };
}
function recordRun(db, schedule, occurrence, status, input, output, attempts, clock) {
    const at = nowIso(() => clock.now());
    db.raw.prepare('INSERT INTO run_history(schedule,occurrence,status,input,output,attempts,recorded_at) VALUES(?,?,?,?,?,?,?)').run(schedule, occurrence, status, JSON.stringify(input), JSON.stringify(output), attempts, at);
    db.raw
        .prepare('INSERT INTO runs (id, schedule, occurrence, status, input, output, attempts, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(schedule, occurrence) DO UPDATE SET status=excluded.status, input=excluded.input, output=excluded.output, attempts=excluded.attempts, updated_at=excluded.updated_at')
        .run(`run_${randomUUID().slice(0, 8)}`, schedule, occurrence, status, JSON.stringify(input), JSON.stringify(output), attempts, at, at);
}
/** Idempotent per eventId: duplicate cost-import events create tasks once. */
export function handleCostImport(db, eventId, ingredientIds, config, clock) {
    if (!config.costReviewEnabled)
        return { created: [], skipped: true };
    const owner = `worker_${randomUUID().slice(0, 8)}`;
    const leaseKey = `cost-import:${eventId}`;
    if (!tryAcquireLease(db, leaseKey, owner, 60_000, clock.now()))
        return { created: [], skipped: true };
    try {
        return transact(db, () => {
            const existing = db.raw.prepare("SELECT id FROM runs WHERE schedule = 'cost-import' AND occurrence = ?").get(eventId);
            if (existing)
                return { created: [], skipped: true };
            const created = [];
            const recipes = listRecipes(db);
            for (const r of recipes) {
                const affected = (id, seen = new Set()) => { if (seen.has(id))
                    return false; seen.add(id); const recipe = recipes.find(x => x.id === id); return Boolean(recipe && (recipe.ingredients.some(i => ingredientIds.includes(i.ingredientId)) || recipe.subrecipes.some(s => affected(s.recipeId, seen)))); };
                if (affected(r.id)) {
                    const t = createTask(db, `Review recipe ${r.id}: purchase cost changed`, { now: () => clock.now() });
                    created.push(t.id);
                }
            }
            recordRun(db, 'cost-import', eventId, 'completed', { ingredientIds }, { created }, 1, clock);
            return { created, skipped: false };
        });
    }
    finally {
        releaseLease(db, leaseKey, owner);
    }
}
/** Daily prep draft for tomorrow. Missing data -> action-required task. Bounded retries. */
export function runDailyPrep(db, occurrence, forecast, config, clock, attempt = 1) {
    const MAX_ATTEMPTS = 3;
    if (!config.dailyPrepEnabled)
        return { status: 'disabled' };
    const owner = `worker_${randomUUID().slice(0, 8)}`;
    if (!tryAcquireLease(db, `daily-prep:${occurrence}`, owner, 120_000, clock.now()))
        return { status: 'lease-lost' };
    try {
        return transact(db, () => {
            const existing = db.raw.prepare('SELECT status, attempts FROM runs WHERE schedule = ? AND occurrence = ?').get('daily-prep', occurrence);
            if (existing?.status === 'completed')
                return { status: 'already-done' };
            if (existing && existing.attempts >= MAX_ATTEMPTS) {
                recordRun(db, 'daily-prep', occurrence, 'failed', { occurrence }, { error: 'bounded retries exhausted' }, existing.attempts, clock);
                return { status: 'failed' };
            }
            if (!forecast) {
                const t = createTask(db, `Prep draft ${occurrence}: missing confirmed forecast, stock or current recipe approval (action required)`, { now: () => clock.now() });
                recordRun(db, 'daily-prep', occurrence, 'completed', { occurrence }, { actionRequired: t.id }, Math.max(attempt, (existing?.attempts ?? 0) + 1), clock);
                return { status: 'action-required', taskId: t.id };
            }
            try {
                const plan = buildPrepPlan(forecast.demands, forecast.stock);
                const t = createTask(db, `Prep draft ${occurrence}: ${plan.length} lines (draft)`, { now: () => clock.now() });
                recordRun(db, 'daily-prep', occurrence, 'completed', { occurrence, forecast }, { plan, task: t.id }, Math.max(attempt, (existing?.attempts ?? 0) + 1), clock);
                return { status: 'completed', taskId: t.id };
            }
            catch (e) {
                const attempts = (existing?.attempts ?? 0) + 1;
                if (attempts >= MAX_ATTEMPTS) {
                    const t = createTask(db, `Prep draft ${occurrence} failed: ${e.message}`, { now: () => clock.now() });
                    recordRun(db, 'daily-prep', occurrence, 'failed', { occurrence }, { error: e.message, task: t.id }, attempts, clock);
                    return { status: 'failed', taskId: t.id };
                }
                recordRun(db, 'daily-prep', occurrence, 'retrying', { occurrence }, { error: e.message }, attempts, clock);
                return { status: 'retrying' };
            }
        });
    }
    finally {
        releaseLease(db, `daily-prep:${occurrence}`, owner);
    }
}
/** Catch up at most one missed occurrence. */
export function catchUpOnce(db, occurrence, forecast, config, clock) {
    const existing = db.raw.prepare('SELECT status FROM runs WHERE schedule = ? AND occurrence = ?').get('daily-prep', occurrence);
    if (existing)
        return { status: 'already-recorded' };
    const r = runDailyPrep(db, occurrence, forecast, config, clock);
    return { status: r.status };
}
/** Restart recovery: mark interrupted (retrying) runs visible and requeue once. */
export function recoverInterrupted(db, clock) {
    const rows = db.raw.prepare("SELECT occurrence FROM runs WHERE schedule = 'daily-prep' AND status = 'retrying'").all();
    const requeued = [];
    for (const r of rows.slice(0, 10)) {
        const at = nowIso(() => clock.now());
        db.raw.prepare("UPDATE runs SET status = 'interrupted', updated_at = ? WHERE schedule = 'daily-prep' AND occurrence = ?").run(at, r.occurrence);
        requeued.push(r.occurrence);
    }
    return requeued;
}
export function todayOccurrence(clock) {
    return occurrenceDay(clock);
}
export function saveForecast(db, day, forecast, confirm, clock) {
    if (confirm !== true)
        throw new Error('forecast and stock require explicit confirmation');
    if (forecast.capacity !== undefined)
        capacitySchema.parse(forecast.capacity);
    if (forecast.orderLines !== undefined)
        buildOrderProposalSchema.shape.lines.parse(forecast.orderLines);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || new Date(day).toISOString().slice(0, 10) !== day)
        throw new Error('valid service date required');
    if (!Array.isArray(forecast.demands) || !Array.isArray(forecast.stock) || forecast.demands.length > 500 || forecast.stock.length > 500)
        throw new Error('bounded forecast and explicit stock records required');
    if (new Set(forecast.demands.map(d => d.recipeId)).size !== forecast.demands.length || new Set(forecast.stock.map(d => d.recipeId)).size !== forecast.stock.length)
        throw new Error('duplicate forecast or stock record');
    buildPrepPlan(forecast.demands, forecast.stock);
    transact(db, () => {
        db.raw.prepare('INSERT INTO forecasts(day,data,confirmed,updated_at) VALUES(?,?,1,?) ON CONFLICT(day) DO UPDATE SET data=excluded.data,confirmed=1,updated_at=excluded.updated_at').run(day, JSON.stringify(forecast), clock.now().toISOString());
        db.raw.prepare("UPDATE runs SET status='interrupted',attempts=0 WHERE schedule='daily-prep' AND occurrence=?").run(day);
    });
}
/** Durable scheduler tick; approvals and complete operational inputs are checked here. */
export function workerTick(db, clock) {
    listConnectedFlows(db);
    const cfgRow = db.raw.prepare("SELECT data FROM workflows_config WHERE id='default'").get();
    const config = { ...DEFAULT_WORKER_CONFIG, ...(cfgRow ? JSON.parse(cfgRow.data) : {}) };
    const localClock = { now: () => clock.now(), tz: config.timezone };
    const today = occurrenceDay(localClock);
    const shift = (day, n) => new Date(Date.parse(day + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10);
    const serviceDay = shift(today, pastCutoff(localClock, config.dailyCutoff) ? 1 : 0);
    const owner = randomUUID();
    if (!tryAcquireLease(db, 'scheduler', owner, 60000, clock.now()))
        return { events: 0, prep: 'leased', serviceDay };
    try {
        let events = 0;
        if (config.costReviewEnabled) {
            const pending = db.raw.prepare("SELECT id,kind,payload FROM events WHERE status='pending' ORDER BY created_at LIMIT 100").all();
            for (const event of pending) {
                const previous = db.raw.prepare("SELECT attempts,updated_at FROM runs WHERE schedule='event-failure' AND occurrence=?").get(event.id);
                if (previous && clock.now().getTime() - Date.parse(previous.updated_at) < Math.min(60000, 2 ** previous.attempts * 1000))
                    continue;
                try {
                    const p = JSON.parse(event.payload);
                    if (event.kind === 'cost-import') {
                        handleCostImport(db, event.id, p.ingredientIds, config, localClock);
                        runConnectedFlow(db, { kind: 'supplier-price-change', key: event.id, ingredientIds: p.ingredientIds });
                    }
                    else {
                        transact(db, () => { const done = db.raw.prepare("SELECT id FROM runs WHERE schedule='recipe-change' AND occurrence=?").get(event.id); if (!done) {
                            const tasks = p.versions.map(v => createTask(db, `Review recipe ${v.id} v${v.version}: recipe card, associated SOPs and training`, { now: () => clock.now() }).id);
                            recordRun(db, 'recipe-change', event.id, 'completed', p, { tasks }, 1, clock);
                        } });
                        for (const v of p.versions)
                            runConnectedFlow(db, { kind: 'recipe-release', key: event.id + ':' + v.id, recipeId: v.id });
                    }
                    db.raw.prepare("UPDATE events SET status='completed' WHERE id=?").run(event.id);
                    events++;
                }
                catch (e) {
                    const attempts = (previous?.attempts ?? 0) + 1;
                    recordRun(db, 'event-failure', event.id, attempts >= 3 ? 'failed' : 'retrying', { kind: event.kind }, { error: e.message }, attempts, clock);
                    if (attempts >= 3) {
                        createTask(db, 'Workflow event ' + event.id + ' failed after three attempts: ' + e.message);
                        db.raw.prepare("UPDATE events SET status='failed' WHERE id=?").run(event.id);
                    }
                }
            }
        }
        if (!config.dailyPrepEnabled)
            return { events, prep: 'disabled', serviceDay };
        const prev = db.raw.prepare("SELECT status,attempts,updated_at FROM runs WHERE schedule='daily-prep' AND occurrence=?").get(serviceDay);
        if (prev?.status === 'retrying' && clock.now().getTime() - Date.parse(prev.updated_at) < Math.min(60000, 2 ** prev.attempts * 1000))
            return { events, prep: 'backoff', serviceDay };
        const saved = db.raw.prepare('SELECT data FROM forecasts WHERE day=? AND confirmed=1').get(serviceDay);
        let forecast = saved ? JSON.parse(saved.data) : null;
        if (forecast) {
            const recipes = listRecipes(db);
            const versions = [];
            let valid = true;
            forecast.demands = forecast.demands.map(d => {
                const recipe = recipes.find(r => r.id === d.recipeId);
                const approval = recipe && db.raw.prepare("SELECT id FROM approvals WHERE object_type='recipe' AND object_id=? AND object_version=? AND state='approved'").get(recipe.id, recipe.version);
                if (!recipe || !approval || recipe.yieldQty.unit !== d.servingUnit || !forecast.stock.some(s => s.recipeId === d.recipeId)) {
                    valid = false;
                    return d;
                }
                versions.push({ id: recipe.id, version: recipe.version });
                return { ...d, yieldPerBatch: recipe.yieldQty.amount };
            });
            forecast.sourceVersions = versions;
            if (!valid)
                forecast = null;
        }
        const result = runDailyPrep(db, serviceDay, forecast, config, localClock);
        const fingerprint = createHash('sha256').update(JSON.stringify(forecast ?? { missing: true })).digest('hex').slice(0, 16);
        runConnectedFlow(db, { kind: 'daily-service', key: 'scheduled:' + serviceDay + ':' + fingerprint, day: serviceDay, ...(forecast?.capacity ? { capacity: forecast.capacity } : {}), ...(forecast?.orderLines ? { orderLines: forecast.orderLines } : {}) });
        return { events, prep: result.status, serviceDay };
    }
    finally {
        releaseLease(db, 'scheduler', owner);
    }
}
//# sourceMappingURL=worker.js.map