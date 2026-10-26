import { z } from 'zod';
import { createHash } from 'node:crypto';
import { newId, transact } from '../data/db.js';
import { allRecipes, latestPurchaseByIngredient } from '../data/queries.js';
import { createTask } from '../data/tasks.js';
import { costRecipe } from '../core/costing.js';
import { buildPrepPlan } from '../core/prep.js';
import { buildOrderProposal } from '../core/ordering.js';
import { budgetSchema, capacitySchema, stockSchema, calculateEventBudget, validatePrepCapacity, reconcileStock } from '../core/operations.js';
import { ALLERGEN_STATES } from './profile.js';
import { buildOrderProposalSchema } from '../mcp/schemas.js';
const key = z.string().min(1).max(200);
const base = { key };
export const connectedFlowSchema = z.discriminatedUnion('kind', [
    z.object({ ...base, kind: z.literal('recipe-release'), recipeId: key }).strict(),
    z.object({ ...base, kind: z.literal('supplier-price-change'), ingredientIds: z.array(key).min(1).max(1000) }).strict(),
    z.object({ ...base, kind: z.literal('daily-service'), day: z.iso.date(), capacity: capacitySchema.optional(), orderLines: buildOrderProposalSchema.shape.lines.optional() }).strict(),
    z.object({ ...base, kind: z.literal('event-planning'), budget: budgetSchema, capacity: capacitySchema, dietary: z.object({ totalGuests: z.number().int().positive().max(100000), guests: z.array(z.object({ id: key, requirements: z.array(key).max(30), allergenStatus: z.enum(ALLERGEN_STATES), evidence: z.object({ source: key, version: key, reviewer: key }).strict().optional() }).strict().refine(g => g.allergenStatus === 'unknown' || g.evidence !== undefined, 'Verified allergen states require source, version and reviewer')).max(100000) }).strict() }).strict(),
    z.object({ ...base, kind: z.literal('service-close'), day: z.iso.date(), stock: stockSchema, wasteConfirmed: z.boolean(), waste: z.array(z.object({ ingredientId: key, amount: z.string().max(32), unit: z.string().min(1).max(32) }).strict()).max(1000) }).strict()
]);
export const attachFlowDocumentSchema = z.object({ id: key, expectedVersion: z.number().int().positive(), kind: z.enum(['recipe-card', 'sop', 'service-brief', 'event-plan', 'supporting-note']), title: z.string().min(1).max(200), body: z.string().min(1).max(100000) }).strict();
export const approveFlowSchema = z.object({ id: key, expectedVersion: z.number().int().positive(), confirm: z.literal(true), reviewer: z.string().trim().min(1).max(200) }).strict();
const digest = (text) => createHash('sha256').update(text).digest('hex');
function decode(r) { return { id: r.id, kind: r.kind, key: r.occurrence, status: r.status, version: r.version, sourceVersions: JSON.parse(r.source_versions), input: JSON.parse(r.input), output: JSON.parse(r.output), documents: JSON.parse(r.documents), taskIds: JSON.parse(r.task_ids), history: JSON.parse(r.history), createdAt: r.created_at, updatedAt: r.updated_at }; }
function stale(db, f) {
    return f.sourceVersions.some(s => {
        if (s.kind === 'forecast') {
            const row = db.raw.prepare('SELECT data FROM forecasts WHERE day=? AND confirmed=1').get(s.id);
            return !row || digest(row.data) !== s.version;
        }
        const row = db.raw.prepare(`SELECT version FROM ${s.kind === 'recipe' ? 'recipes' : 'purchases'} WHERE id=?`).get(s.id);
        return row?.version !== s.version || (s.kind === 'purchase' && s.ingredientId !== undefined && latestPurchaseByIngredient(db).get(s.ingredientId)?.id !== s.id);
    });
}
function status(f) { return f.output.blockers.length ? 'blocked' : f.output.requiredDocuments.some(k => !f.documents.some(d => d.kind === k)) ? 'awaiting_document' : 'awaiting_approval'; }
function save(db, f) { db.raw.prepare('UPDATE connected_flows SET status=?,version=?,documents=?,output=?,history=?,updated_at=? WHERE id=?').run(f.status, f.version, JSON.stringify(f.documents), JSON.stringify(f.output), JSON.stringify(f.history), f.updatedAt, f.id); }
export function listConnectedFlows(db) { return db.raw.prepare('SELECT * FROM connected_flows ORDER BY updated_at DESC LIMIT 200').all().map(row => { const f = decode(row); if (f.status !== 'stale' && stale(db, f)) {
    f.status = 'stale';
    f.version++;
    f.updatedAt = new Date().toISOString();
    f.history.push({ at: f.updatedAt, event: 'Source version changed; documents and approval require renewed review' });
    save(db, f);
} return f; }); }
function current(db, id) { const row = db.raw.prepare('SELECT * FROM connected_flows WHERE id=?').get(id); if (!row)
    throw new Error('unknown workflow run'); const flow = decode(row); if (stale(db, flow)) {
    flow.status = 'stale';
} return flow; }
export function runConnectedFlow(db, input) {
    const p = connectedFlowSchema.parse(input);
    const existing = db.raw.prepare('SELECT id FROM connected_flows WHERE kind=? AND occurrence=?').get(p.kind, p.key);
    const previous = existing ? current(db, existing.id) : undefined;
    if (previous) {
        if (JSON.stringify(previous.input) !== JSON.stringify(p))
            throw new Error('Occurrence key already has different inputs; choose a new key');
        return previous;
    }
    const recipes = allRecipes(db), purchases = latestPurchaseByIngredient(db);
    const sources = [];
    const blockers = [];
    let calculations = {};
    let requiredDocuments = [];
    const captureRecipe = (id, seen = new Set()) => { if (seen.has(id))
        return; seen.add(id); const r = recipes.get(id); if (!r) {
        blockers.push('Missing recipe ' + id);
        return;
    } sources.push({ kind: 'recipe', id: r.id, version: r.version }); for (const ing of r.ingredients) {
        const buy = purchases.get(ing.ingredientId);
        if (buy)
            sources.push({ kind: 'purchase', id: buy.id, version: buy.version, ingredientId: ing.ingredientId });
    } for (const s of r.subrecipes)
        captureRecipe(s.recipeId, seen); };
    const cost = (id) => { captureRecipe(id); const result = costRecipe({ recipes, purchasesByIngredient: purchases, targetRecipeId: id }); for (const u of result.unknown)
        blockers.push(id + ': ' + u.reason); return result; };
    if (p.kind === 'recipe-release') {
        requiredDocuments = ['recipe-card', 'sop'];
        calculations = recipes.has(p.recipeId) ? cost(p.recipeId) : {};
        if (!recipes.has(p.recipeId))
            blockers.push('Import and reconcile the recipe first');
    }
    if (p.kind === 'supplier-price-change') {
        const affected = (id, seen = new Set()) => { if (seen.has(id))
            return false; seen.add(id); const r = recipes.get(id); return Boolean(r && (r.ingredients.some(i => p.ingredientIds.includes(i.ingredientId)) || r.subrecipes.some(s => affected(s.recipeId, seen)))); };
        const results = [...recipes.keys()].filter(id => affected(id)).map(cost);
        if (!results.length)
            blockers.push('No matching recipes; reconcile supplier item identifiers');
        calculations = { affectedRecipes: results, staleDocumentReview: true };
    }
    if (p.kind === 'daily-service') {
        requiredDocuments = ['service-brief'];
        const row = db.raw.prepare('SELECT data FROM forecasts WHERE day=? AND confirmed=1').get(p.day);
        if (!row)
            blockers.push('Missing confirmed forecast and counted stock');
        else {
            sources.push({ kind: 'forecast', id: p.day, version: digest(row.data) });
            const forecast = JSON.parse(row.data);
            for (const d of forecast.demands) {
                captureRecipe(d.recipeId);
                const r = recipes.get(d.recipeId);
                if (!r || !db.raw.prepare("SELECT id FROM approvals WHERE object_type='recipe' AND object_id=? AND object_version=? AND state='approved'").get(d.recipeId, r.version))
                    blockers.push('Current recipe approval missing: ' + d.recipeId);
                if (!forecast.stock.some(s => s.recipeId === d.recipeId))
                    blockers.push('Counted stock missing: ' + d.recipeId);
                if (r) {
                    d.yieldPerBatch = r.yieldQty.amount;
                    if (r.yieldQty.unit !== d.servingUnit)
                        blockers.push('Forecast and recipe yield units differ: ' + d.recipeId);
                }
            }
            calculations = { prep: buildPrepPlan(forecast.demands, forecast.stock), capacity: p.capacity ? validatePrepCapacity(p.capacity) : { feasible: false, reason: 'equipment capacity not supplied' }, ordering: p.orderLines ? buildOrderProposal(p.orderLines.map(l => ({ ingredientId: l.ingredientId, par: l.par, onHand: l.onHand, onOrder: l.onOrder, unit: l.unit, ...(l.packSize !== undefined ? { packSize: l.packSize } : {}) }))) : null };
        }
        if (!p.capacity)
            blockers.push('Missing resource capacities and intervals');
        else if (!validatePrepCapacity(p.capacity).feasible)
            blockers.push('Equipment capacity conflict');
        if (!p.orderLines)
            blockers.push('Missing verified ordering inputs');
    }
    if (p.kind === 'event-planning') {
        requiredDocuments = ['event-plan'];
        const budget = calculateEventBudget(p.budget), capacity = validatePrepCapacity(p.capacity);
        const ids = p.dietary.guests.map(g => g.id);
        if (new Set(ids).size !== ids.length)
            throw new Error('duplicate guest identifiers');
        if (ids.length > p.dietary.totalGuests)
            throw new Error('guest count exceeds total');
        if (ids.length !== p.dietary.totalGuests)
            blockers.push('Guest-level dietary confirmations incomplete');
        if (p.dietary.guests.some(g => g.allergenStatus === 'unknown'))
            blockers.push('Unverified guest/dish allergen status');
        if (!budget.complete || budget.revenueCents === null)
            blockers.push('Event budget incomplete');
        if (!capacity.feasible)
            blockers.push('Event capacity conflict');
        calculations = { budget, capacity, dietary: { totalGuests: p.dietary.totalGuests, confirmedGuestRecords: ids.length, uniqueGuestsWithRequirements: p.dietary.guests.filter(g => g.requirements.length).length } };
    }
    if (p.kind === 'service-close') {
        const variance = reconcileStock(p.stock);
        if (!variance.complete)
            blockers.push('Stock records incomplete or contradictory');
        if (!p.wasteConfirmed)
            blockers.push('Actual waste observations not confirmed');
        for (const w of p.waste) {
            if (!/^\d+(\.\d{1,6})?$/.test(w.amount))
                throw new Error('waste must be a nonnegative measured quantity');
        }
        calculations = { stock: variance, observedWaste: p.waste };
    }
    const at = new Date().toISOString();
    const f = { id: newId('flow'), kind: p.kind, key: p.key, status: '', version: 1, sourceVersions: [...new Map(sources.map(s => [s.kind + ':' + s.id, s])).values()], input: p, output: { blockers: [...new Set(blockers)], requiredDocuments, calculations, actions: ['Draft calculations and local review tasks only; no orders, messages or prices published'] }, documents: [], taskIds: [], history: [{ at, event: 'Draft run created from supplied records' }], createdAt: at, updatedAt: at };
    f.status = status(f);
    return transact(db, () => { const task = createTask(db, `${p.kind}: ${p.key} — ${f.status}`); f.taskIds = [task.id]; if (blockers.length)
        db.raw.prepare('UPDATE tasks SET blocked_reason=? WHERE id=?').run(blockers.join('; '), task.id); db.raw.prepare('INSERT INTO connected_flows VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').run(f.id, f.kind, f.key, f.status, f.version, JSON.stringify(f.sourceVersions), JSON.stringify(f.input), JSON.stringify(f.output), JSON.stringify(f.documents), JSON.stringify(f.taskIds), JSON.stringify(f.history), at, at); return f; });
}
export function attachFlowDocument(db, input) { const p = attachFlowDocumentSchema.parse(input); return transact(db, () => { const f = current(db, p.id); if (f.version !== p.expectedVersion)
    throw new Error('STALE_VERSION workflow changed'); if (f.status === 'stale')
    throw new Error('Source changed; create a renewed run'); if (f.documents.length >= 50)
    throw new Error('Document revision limit; create renewed run'); const at = new Date().toISOString(); f.documents.push({ id: newId('doc'), kind: p.kind, title: p.title, body: p.body, sourceVersions: f.sourceVersions, createdAt: at }); f.version++; f.status = status(f); f.updatedAt = at; f.history.push({ at, event: 'User supplied ' + p.kind + ' draft; approval invalidated' }); save(db, f); return f; }); }
export function approveFlow(db, input) { const p = approveFlowSchema.parse(input); return transact(db, () => { const f = current(db, p.id); if (f.version !== p.expectedVersion)
    throw new Error('STALE_VERSION workflow changed'); if (f.status !== 'awaiting_approval')
    throw new Error('Resolve blockers and attach required drafts before approval'); const at = new Date().toISOString(); f.status = 'completed'; f.version++; f.updatedAt = at; f.history.push({ at, event: 'Package reviewed by ' + p.reviewer + ' for exact recorded source/document versions' }); save(db, f); if (f.input.kind === 'recipe-release') {
    const releasedRecipeId = f.input.recipeId;
    const source = f.sourceVersions.find(s => s.kind === 'recipe' && s.id === releasedRecipeId);
    if (source && !db.raw.prepare("SELECT id FROM approvals WHERE object_type='recipe' AND object_id=? AND object_version=? AND state='approved'").get(source.id, source.version)) {
        db.raw.prepare("INSERT INTO approvals VALUES(?,?,?,?,?,?,?)").run(newId('appr'), 'recipe', source.id, source.version, 'approved', at, at);
    }
} for (const taskId of f.taskIds) {
    const task = db.raw.prepare('SELECT history,cancellation FROM tasks WHERE id=?').get(taskId);
    if (task && !task.cancellation) {
        const history = JSON.parse(task.history);
        history.push({ at, event: 'completed by exact-revision workflow review ' + f.id });
        db.raw.prepare("UPDATE tasks SET state='completed',blocked_reason=NULL,history=?,updated_at=? WHERE id=?").run(JSON.stringify(history), at, taskId);
    }
} return f; }); }
//# sourceMappingURL=connected.js.map