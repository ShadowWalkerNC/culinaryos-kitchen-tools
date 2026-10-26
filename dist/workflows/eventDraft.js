import { z } from 'zod';
import { transact } from '../data/db.js';
import { connectedFlowSchema, evaluateEventPlan, runConnectedFlow } from './connected.js';
import { ALLERGEN_STATES } from './profile.js';
const text = z.string().max(200);
const row = (shape) => z.object(shape).strict();
// Unfinished form values are deliberately distinct from validated operational records.
export const eventDraftSchema = row({ currency: text, revenue: text, totalGuests: text,
    costs: z.array(row({ label: text, amount: text })).max(1000),
    resources: z.array(row({ id: text, capacity: text, unit: text })).max(200),
    tasks: z.array(row({ id: text, resourceId: text, start: text, end: text, units: text, unit: text })).max(2000),
    guests: z.array(row({ id: text, requirements: z.string().max(2000), allergenStatus: z.enum(ALLERGEN_STATES), source: text, sourceVersion: text, reviewer: text })).max(1000),
    capacityConfirmed: z.boolean() });
export function loadEventDraft(db) {
    const saved = db.raw.prepare("SELECT version,payload FROM job_drafts WHERE id='event-planning'").get();
    return saved ? { version: saved.version, payload: eventDraftSchema.parse(JSON.parse(saved.payload)) } : { version: 0, payload: null };
}
export function saveEventDraft(db, input) {
    const p = row({ expectedVersion: z.number().int().min(0), payload: eventDraftSchema }).parse(input);
    return transact(db, () => {
        const previous = loadEventDraft(db);
        if (previous.version !== p.expectedVersion)
            throw new Error('STALE_VERSION saved event changed; reload before replacing it');
        const version = previous.version + 1;
        db.raw.prepare("INSERT INTO job_drafts(id,version,payload,updated_at)VALUES('event-planning',?,?,?)ON CONFLICT(id)DO UPDATE SET version=excluded.version,payload=excluded.payload,updated_at=excluded.updated_at").run(version, JSON.stringify(p.payload), new Date().toISOString());
        return { version, payload: p.payload };
    });
}
function whole(value, label) { if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
    throw new Error(label + ' must be a positive whole number'); return Number(value); }
function money(value, label) { const s = value.trim(); if (!s)
    return null; if (!/^\d+(\.\d{1,2})?$/.test(s))
    throw new Error(label + ' must be a nonnegative amount with at most two decimal places'); const [a, b = ''] = s.split('.'); const cents = BigInt(a) * 100n + BigInt(b.padEnd(2, '0')); if (cents > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error(label + ' is too large'); return Number(cents); }
export function previewEventDraft(input, key = 'preview') {
    const p = row({ payload: eventDraftSchema }).parse(input).payload;
    if (!p.currency.trim())
        throw new Error('Supply the event currency before reviewing');
    if (!p.costs.length || p.costs.some(c => !c.label.trim()))
        throw new Error('Name each event cost category; leave its amount blank when unknown');
    const resources = p.resources.map(r => ({ id: r.id.trim(), capacity: whole(r.capacity.trim(), 'Resource capacity'), unit: r.unit.trim() }));
    const tasks = p.tasks.map(t => ({ id: t.id.trim(), resourceId: t.resourceId.trim(), start: t.start.trim(), end: t.end.trim(), units: whole(t.units.trim(), 'Task units'), unit: t.unit.trim() }));
    if (tasks.length && !resources.length)
        throw new Error('Add the resources used by the event tasks');
    const request = connectedFlowSchema.parse({ kind: 'event-planning', key,
        budget: { currency: p.currency.trim(), revenueCents: money(p.revenue, 'Event revenue'), costs: p.costs.map(c => ({ label: c.label.trim(), currency: p.currency.trim(), amountCents: money(c.amount, c.label) })) },
        ...(resources.length ? { capacity: { resources, tasks } } : {}), capacityConfirmed: p.capacityConfirmed,
        dietary: { totalGuests: whole(p.totalGuests.trim(), 'Guest count'), guests: p.guests.map(g => ({ id: g.id.trim(), requirements: g.requirements.split(',').map(v => v.trim()).filter(Boolean), allergenStatus: g.allergenStatus,
                ...(g.allergenStatus === 'unknown' ? {} : { evidence: { source: g.source.trim(), version: g.sourceVersion.trim(), reviewer: g.reviewer.trim() } }) })) } });
    if (request.kind !== 'event-planning')
        throw new Error('invalid event request');
    const result = evaluateEventPlan(request);
    return { request, blockers: result.blockers, summary: result.calculations };
}
export function createEventFromDraft(db, input) { const p = row({ key: text.min(1), payload: eventDraftSchema }).parse(input); return runConnectedFlow(db, previewEventDraft({ payload: p.payload }, p.key).request); }
//# sourceMappingURL=eventDraft.js.map