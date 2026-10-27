import { z } from 'zod';
import { createHash } from 'node:crypto';
import { newId, transact } from '../data/db.js';
import { STARTERS } from './getStarted.js';
import { WORKFLOW_CATALOG } from './catalog.js';
import { publicHandlers, PUBLIC_TOOL_NAMES } from '../mcp/publicTools.js';
const key = z.string().trim().min(1).max(200);
export const sourceRefSchema = z.object({ kind: z.enum(['recipe', 'purchase', 'forecast', 'culinaryos-snapshot']), id: key, version: z.union([z.number().int().positive(), key]) }).strict();
export const createJobSchema = z.object({ templateId: key, owner: key.optional(), dueAt: z.iso.datetime({ offset: true }).optional(), timezone: z.string().max(100).optional(), inputs: z.record(z.string().max(500), z.string().max(10000).nullable()).default({}), sourceRefs: z.array(sourceRefSchema).max(1000).default([]) }).strict();
function hash(v) { return createHash('sha256').update(JSON.stringify(v)).digest('hex'); }
export function sourceVersion(db, s) {
    if (s.kind === 'culinaryos-snapshot') {
        const row = db.raw.prepare('SELECT data FROM connection_snapshots WHERE id=? AND confirmed=1').get(s.id);
        return row ? hash(JSON.parse(row.data)) : null;
    }
    if (s.kind === 'forecast') {
        const row = db.raw.prepare('SELECT data FROM forecasts WHERE day=? AND confirmed=1').get(s.id);
        return row ? hash(JSON.parse(row.data)) : null;
    }
    const row = db.raw.prepare(`SELECT version FROM ${s.kind === 'recipe' ? 'recipes' : 'purchases'} WHERE id=?`).get(s.id);
    return row?.version ?? null;
}
export function jobView(db, job) {
    const missingInputs = job.requiredInputs.filter(k => !job.inputs[k]?.trim()), staleSources = job.sourceRefs.filter(s => sourceVersion(db, s) !== s.version);
    const state = job.cancelled ? 'cancelled' : staleSources.length ? 'blocked' : missingInputs.length ? 'needs_inputs' : job.steps.some(s => !s.done) ? (job.steps.some(s => s.done) ? 'in_progress' : 'ready') : !job.draft ? 'blocked' : job.review && job.review.version === job.version ? 'completed' : 'awaiting_review';
    return { ...job, state, missingInputs, staleSources, nextStep: job.steps.findIndex(s => !s.done) + 1 || null, blockers: [...(staleSources.length ? ['Sources changed or are unavailable; review and explicitly rebind the job.'] : []), ...(job.steps.every(s => s.done) && !job.draft ? ['Attach a draft or completion note before review.'] : [])], execution: 'Step checkmarks are operator/client-reported. Only calculator receipts record engine execution; no external actions are performed.' };
}
export function readJob(db, id) { const row = db.raw.prepare('SELECT data FROM kitchen_jobs WHERE id=?').get(id); if (!row)
    throw Error('Job not found'); return JSON.parse(row.data); }
function save(db, job) { db.raw.prepare('INSERT INTO kitchen_jobs(id,version,data,updated_at)VALUES(?,?,?,?) ON CONFLICT(id)DO UPDATE SET version=excluded.version,data=excluded.data,updated_at=excluded.updated_at').run(job.id, job.version, JSON.stringify(job), new Date().toISOString()); return jobView(db, job); }
export function createJob(db, input) {
    const p = createJobSchema.parse(input), template = STARTERS.find(s => s.id === p.templateId);
    if (!template)
        throw Error('Unknown job template');
    if (p.dueAt && !p.timezone)
        throw Error('An explicit timezone is required for reminders');
    if (p.timezone) {
        try {
            new Intl.DateTimeFormat('en', { timeZone: p.timezone });
        }
        catch {
            throw Error('Valid IANA timezone required');
        }
    }
    const requiredInputs = [...new Set(template.workflowIds.flatMap(id => WORKFLOW_CATALOG.find(w => w.id === id)?.inputs ?? []))];
    const job = { id: newId('job'), version: 1, templateId: template.id, title: template.title, owner: p.owner ?? null, dueAt: p.dueAt ?? null, timezone: p.timezone ?? null, inputs: p.inputs, requiredInputs, sourceRefs: p.sourceRefs, steps: template.steps.map(label => ({ label, done: false, note: null })), draft: null, review: null, cancelled: false, history: [{ at: new Date().toISOString(), event: 'Created; no step executed' }] };
    return save(db, job);
}
export function listJobs(db) { return db.raw.prepare('SELECT data FROM kitchen_jobs ORDER BY updated_at DESC LIMIT 200').all().map(r => jobView(db, JSON.parse(r.data))); }
export const updateJobSchema = z.object({ id: key, expectedVersion: z.number().int().positive(), inputs: z.record(z.string().max(500), z.string().max(10000).nullable()).optional(), step: z.number().int().min(1).max(100).optional(), done: z.boolean().optional(), note: z.string().max(10000).optional(), draft: z.string().max(100000).optional(), sourceRefs: z.array(sourceRefSchema).max(1000).optional(), cancel: z.literal(true).optional() }).strict();
export function updateJob(db, input) { const p = updateJobSchema.parse(input); return transact(db, () => { const job = readJob(db, p.id); if (job.version !== p.expectedVersion)
    throw Error('Stale job revision'); if (job.cancelled)
    throw Error('Cancelled job cannot be resumed; create a new job'); if (p.step !== undefined) {
    const step = job.steps[p.step - 1];
    if (!step)
        throw Error('Unknown job step');
    step.done = p.done ?? step.done;
    step.note = p.note ?? step.note;
} if (p.inputs)
    job.inputs = { ...job.inputs, ...p.inputs }; if (p.draft !== undefined)
    job.draft = p.draft.trim() || null; if (p.sourceRefs)
    job.sourceRefs = p.sourceRefs; if (p.cancel)
    job.cancelled = true; job.version++; job.review = null; job.history.push({ at: new Date().toISOString(), event: p.cancel ? 'Cancelled' : 'Updated; prior review cleared' }); return save(db, job); }); }
export const reviewJobSchema = z.object({ id: key, expectedVersion: z.number().int().positive(), reviewer: key, confirm: z.literal(true) }).strict();
export function reviewJob(db, input) { const p = reviewJobSchema.parse(input); return transact(db, () => { const job = readJob(db, p.id); if (job.version !== p.expectedVersion)
    throw Error('Stale job revision'); if (jobView(db, job).state !== 'awaiting_review')
    throw Error('Job is not ready for review'); job.review = { reviewer: p.reviewer, at: new Date().toISOString(), version: job.version }; job.history.push({ at: new Date().toISOString(), event: 'Human review recorded for exact revision' }); return save(db, job); }); }
export const jobCalculationSchema = z.object({ id: key, expectedVersion: z.number().int().positive(), tool: z.enum(PUBLIC_TOOL_NAMES), arguments: z.record(z.string(), z.unknown()) }).strict();
export function calculateForJob(db, input) { const p = jobCalculationSchema.parse(input), job = readJob(db, p.id); if (job.version !== p.expectedVersion || job.cancelled || jobView(db, job).staleSources.length)
    throw Error('Job revision or sources require review'); const output = publicHandlers[p.tool](p.arguments), receipt = { id: newId('receipt'), jobId: job.id, jobVersion: job.version, tool: p.tool, input: p.arguments, output, inputHash: hash(p.arguments), outputHash: hash(output), sourceRefs: job.sourceRefs, createdAt: new Date().toISOString() }; db.raw.prepare('INSERT INTO job_receipts(id,job_id,data,created_at)VALUES(?,?,?,?)').run(receipt.id, job.id, JSON.stringify(receipt), receipt.createdAt); return receipt; }
export function jobReceipts(db, id) { readJob(db, id); return db.raw.prepare('SELECT data FROM job_receipts WHERE job_id=? ORDER BY created_at').all(id).map(r => JSON.parse(r.data)); }
//# sourceMappingURL=jobs.js.map