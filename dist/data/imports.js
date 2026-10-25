// F10 imports: JSON + CSV + pasted text. Preview binds payload + expected versions; commit is atomic.
import { z } from 'zod';
import { transact, newId, nowIso } from './db.js';
import { validateRecipe, validatePurchase } from '../core/validation.js';
export const ImportKind = z.enum(['recipe_json', 'purchase_json', 'recipe_csv', 'purchase_csv', 'pasted_text']);
const qtySchema = z.object({ amount: z.string(), unit: z.string() });
const recipeSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    currency: z.string(),
    yieldQty: qtySchema,
    ingredients: z.array(z.object({ ingredientId: z.string().min(1), qty: qtySchema })).default([]),
    subrecipes: z.array(z.object({ recipeId: z.string().min(1), qty: qtySchema })).default([]),
    packaging: z.array(z.object({ label: z.string(), costCents: z.number() })).optional(),
    variants: z.array(z.object({ id: z.string(), netPriceCents: z.number().optional(), confirmed: z.boolean() })).optional(),
    version: z.number().optional(),
});
const purchaseSchema = z.object({
    id: z.string().min(1),
    ingredientId: z.string().min(1),
    currency: z.string(),
    costCents: z.number(),
    usableQty: qtySchema,
    effectiveDate: z.string(),
    packBasis: z.string().optional(),
    densityGPerMl: z.string().optional(),
    version: z.number().optional(),
});
function parseCsv(text) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            if (quoted && text[i + 1] === '"') {
                cell += '"';
                i++;
            }
            else if (quoted || !cell) {
                quoted = !quoted;
            }
            else
                throw new Error('invalid CSV quoting');
        }
        else if (!quoted && (c === ',' || c === '\n')) {
            row.push(cell.trim());
            cell = '';
            if (c === '\n') {
                if (row.some(Boolean))
                    rows.push(row);
                row = [];
            }
        }
        else if (c !== '\r' || quoted)
            cell += c;
    }
    if (quoted)
        throw new Error('unterminated CSV quote');
    row.push(cell.trim());
    if (row.some(Boolean))
        rows.push(row);
    if (rows.length && new Set(rows[0]).size !== rows[0].length)
        throw new Error('duplicate CSV headers');
    return rows;
}
function csvToRecipes(rows) {
    const header = rows[0] ?? [];
    const idx = (n) => header.indexOf(n);
    const out = [];
    const groups = new Map();
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const id = r[idx('recipe_id')] ?? '';
        if (id === '')
            throw new Error(`recipe_csv row ${i + 1}: recipe_id required`);
        let g = groups.get(id);
        if (!g) {
            g = {
                name: r[idx('recipe_name')] ?? id,
                currency: r[idx('currency')] ?? '',
                yieldAmount: r[idx('yield_amount')] ?? '',
                yieldUnit: r[idx('yield_unit')] ?? '',
                ings: [],
            };
            groups.set(id, g);
        }
        g.ings.push({
            ingredientId: r[idx('ingredient_id')] ?? '',
            qty: { amount: r[idx('qty_amount')] ?? '', unit: r[idx('qty_unit')] ?? '' },
        });
    }
    for (const [id, g] of groups) {
        out.push({ id, name: g.name, currency: g.currency, yieldQty: { amount: g.yieldAmount, unit: g.yieldUnit }, ingredients: g.ings, subrecipes: [] });
    }
    return out;
}
function csvToPurchases(rows) {
    const header = rows[0] ?? [];
    const idx = (n) => header.indexOf(n);
    const out = [];
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        out.push({
            id: r[idx('id')] ?? '',
            ingredientId: r[idx('ingredient_id')] ?? '',
            currency: r[idx('currency')] ?? '',
            costCents: Number(r[idx('cost_cents')] ?? 'NaN'),
            usableQty: { amount: r[idx('qty_amount')] ?? '', unit: r[idx('qty_unit')] ?? '' },
            effectiveDate: r[idx('effective_date')] ?? '',
        });
    }
    return out;
}
export function previewImport(db, kind, payloadText, opts = {}) {
    ImportKind.parse(kind);
    if (typeof payloadText !== 'string')
        throw new Error('import text required');
    const clock = opts.now ?? (() => new Date());
    if (payloadText.length > 1_000_000)
        throw new Error('import payload exceeds 1MB');
    let records = [];
    if (kind === 'pasted_text') {
        const id = newId('src');
        db.raw.prepare('INSERT INTO sources (id, kind, bytes, received_at, verified) VALUES (?, ?, ?, ?, 0)').run(id, kind, payloadText, nowIso(clock));
        const token = newId('prev');
        const expiresAt = new Date(clock().getTime() + 30 * 60_000).toISOString();
        db.raw
            .prepare('INSERT INTO previews (token, kind, payload, expected, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)')
            .run(token, kind, JSON.stringify({ sourceId: id }), JSON.stringify({}), expiresAt, nowIso(clock));
        return { token, kind, records: 0, missing: ['structured recipe required: pasted text retained as unverified source only'], conflicts: [], expiresAt };
    }
    if (kind === 'recipe_json' || kind === 'purchase_json') {
        const parsed = JSON.parse(payloadText);
        records = Array.isArray(parsed) ? parsed : [parsed];
    }
    else {
        const rows = parseCsv(payloadText);
        if (rows.length < 2)
            throw new Error('CSV has no data rows');
        records = kind === 'recipe_csv' ? csvToRecipes(rows) : csvToPurchases(rows);
    }
    // Validate each record (structural + domain), collect missing fields.
    if (records.length > 500)
        throw new Error('import limited to 500 records');
    const ids = new Set();
    for (const record of records) {
        const id = record?.id;
        if (typeof id !== 'string' || !id.trim() || id.length > 200)
            throw new Error('invalid record: stable ID required');
        if (ids.has(id))
            throw new Error('duplicate record ID');
        ids.add(id);
    }
    const missing = [];
    const conflicts = [];
    const normalized = [];
    for (const rec of records) {
        if (kind === 'recipe_json' || kind === 'recipe_csv') {
            const parsed = recipeSchema.safeParse(rec);
            if (!parsed.success)
                throw new Error(`invalid recipe record: ${parsed.error.issues[0]?.message ?? 'schema error'}`);
            const full = {
                ...parsed.data,
                version: 1,
                provenance: { source: 'import', receivedAt: nowIso(clock), verified: false },
            };
            const issues = validateRecipe(full);
            if (issues.length > 0)
                throw new Error(`invalid recipe ${full.id}: ${issues[0]?.message}`);
            const row = db.raw.prepare('SELECT version FROM recipes WHERE id = ?').get(full.id);
            conflicts.push({ id: full.id, currentVersion: row?.version ?? null, incomingVersion: parsed.data.version ?? null });
            normalized.push({ ...parsed.data });
        }
        else {
            const parsed = purchaseSchema.safeParse(rec);
            if (!parsed.success)
                throw new Error(`invalid purchase record: ${parsed.error.issues[0]?.message ?? 'schema error'}`);
            const full = {
                ...parsed.data,
                version: 1,
                provenance: { source: 'import', receivedAt: nowIso(clock), verified: false },
            };
            const issues = validatePurchase(full);
            if (issues.length > 0)
                throw new Error(`invalid purchase ${full.id}: ${issues[0]?.message}`);
            const row = db.raw.prepare('SELECT version FROM purchases WHERE id = ?').get(full.id);
            conflicts.push({ id: full.id, currentVersion: row?.version ?? null, incomingVersion: parsed.data.version ?? null });
            normalized.push({ ...parsed.data });
        }
    }
    if (normalized.length === 0)
        missing.push('no records found');
    const token = newId('prev');
    const expiresAt = new Date(clock().getTime() + 30 * 60_000).toISOString();
    const expected = {};
    db.raw.prepare('INSERT INTO sources (id, kind, bytes, received_at, verified) VALUES (?, ?, ?, ?, 0)').run(token, kind, payloadText, nowIso(clock));
    for (const c of conflicts)
        expected[c.id] = c.currentVersion;
    db.raw
        .prepare('INSERT INTO previews (token, kind, payload, expected, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(token, kind, JSON.stringify(normalized), JSON.stringify(expected), expiresAt, nowIso(clock));
    const items = normalized.map(value => { const row = value; return { id: String(row['id']), label: String(row['name'] ?? row['ingredientId'] ?? row['id']), summary: kind.startsWith('recipe') ? `Recipe in ${String(row['currency'])}; ${row['ingredients'].length} ingredient lines` : `${String(row['currency'])} ${String(row['costCents'])} minor units per purchase quantity` }; });
    return { token, kind, records: normalized.length, missing, conflicts, expiresAt, items };
}
export function commitImport(db, token, confirm, opts = {}) {
    if (confirm !== true)
        throw new Error('commit requires explicit confirm=true');
    const clock = opts.now ?? (() => new Date());
    const row = db.raw.prepare('SELECT kind, payload, expected, expires_at as expiresAt FROM previews WHERE token = ?').get(token);
    if (!row)
        throw new Error('unknown preview token');
    if (Date.parse(row.expiresAt) < clock().getTime())
        throw new Error('preview token expired');
    if (row.kind === 'pasted_text')
        throw new Error('pasted text cannot be committed: supply structured recipe');
    const expected = JSON.parse(row.expected);
    const records = JSON.parse(row.payload);
    return transact(db, () => {
        const committed = [];
        const versions = [];
        for (const rec of records) {
            const id = String(rec['id']);
            const kind = row.kind.startsWith('recipe') ? 'recipe' : 'purchase';
            const table = kind === 'recipe' ? 'recipes' : 'purchases';
            db.raw.prepare(`INSERT OR IGNORE INTO record_versions(kind,id,version,data,recorded_at) SELECT ?,id,version,data,? FROM ${table} WHERE id=?`).run(kind, nowIso(clock), id);
            if (row.kind === 'recipe_json' || row.kind === 'recipe_csv') {
                const cur = db.raw.prepare('SELECT version FROM recipes WHERE id = ?').get(id);
                const exp = expected[id] ?? null;
                if ((cur?.version ?? null) !== exp)
                    throw new Error(`STALE_VERSION for ${id}: expected ${String(exp)}, found ${String(cur?.version ?? null)}`);
                const next = (cur?.version ?? 0) + 1;
                const full = {
                    ...rec,
                    version: next,
                    provenance: { source: 'import-commit', receivedAt: nowIso(clock), verified: true },
                };
                const issues = validateRecipe(full);
                if (issues.length > 0)
                    throw new Error(`invalid recipe ${id}: ${issues[0]?.message}`);
                // NOTE: browser verified flags are never trusted; server sets verified=1 only after reviewed commit.
                db.raw
                    .prepare('INSERT INTO recipes (id, data, version, verified, provenance, updated_at) VALUES (?, ?, ?, 1, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, version=excluded.version, verified=1, provenance=excluded.provenance, updated_at=excluded.updated_at')
                    .run(id, JSON.stringify(full), next, JSON.stringify(full.provenance), nowIso(clock));
                committed.push(id);
                versions.push({ id, version: next });
                db.raw.prepare('INSERT INTO record_versions(kind,id,version,data,recorded_at) VALUES (?,?,?,?,?)').run('recipe', id, next, JSON.stringify(full), nowIso(clock));
            }
            else {
                const cur = db.raw.prepare('SELECT version FROM purchases WHERE id = ?').get(id);
                const exp = expected[id] ?? null;
                if ((cur?.version ?? null) !== exp)
                    throw new Error(`STALE_VERSION for ${id}: expected ${String(exp)}, found ${String(cur?.version ?? null)}`);
                const next = (cur?.version ?? 0) + 1;
                const full = {
                    ...rec,
                    version: next,
                    provenance: { source: 'import-commit', receivedAt: nowIso(clock), verified: true },
                };
                const issues = validatePurchase(full);
                if (issues.length > 0)
                    throw new Error(`invalid purchase ${id}: ${issues[0]?.message}`);
                db.raw
                    .prepare('INSERT INTO purchases (id, ingredient_id, data, version, verified, provenance, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?) ON CONFLICT(id) DO UPDATE SET ingredient_id=excluded.ingredient_id, data=excluded.data, version=excluded.version, verified=1, provenance=excluded.provenance, updated_at=excluded.updated_at')
                    .run(id, full.ingredientId, JSON.stringify(full), next, JSON.stringify(full.provenance), nowIso(clock));
                committed.push(id);
                versions.push({ id, version: next });
                db.raw.prepare('INSERT INTO record_versions(kind,id,version,data,recorded_at) VALUES (?,?,?,?,?)').run('purchase', id, next, JSON.stringify(full), nowIso(clock));
            }
        }
        if (row.kind.startsWith('purchase'))
            db.raw.prepare('INSERT INTO events(id,kind,payload,status,created_at) VALUES (?,?,?,\'pending\',?)').run(token, 'cost-import', JSON.stringify({ ingredientIds: [...new Set(records.map(r => String(r['ingredientId'])))], versions }), nowIso(clock));
        else
            db.raw.prepare('INSERT INTO events(id,kind,payload,status,created_at) VALUES (?,?,?,\'pending\',?)').run(token, 'recipe-change', JSON.stringify({ versions }), nowIso(clock));
        db.raw.prepare('UPDATE sources SET verified=1 WHERE id=?').run(token);
        db.raw.prepare('DELETE FROM previews WHERE token = ?').run(token);
        return { committed, versions };
    });
}
//# sourceMappingURL=imports.js.map