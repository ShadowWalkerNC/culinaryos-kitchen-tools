// F09-F10 SQLite store via node:sqlite. Transactions + optimistic version checks.
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
CREATE TABLE IF NOT EXISTS record_versions (kind TEXT NOT NULL, id TEXT NOT NULL, version INTEGER NOT NULL, data TEXT NOT NULL, recorded_at TEXT NOT NULL, PRIMARY KEY(kind,id,version));
CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS forecasts (day TEXT PRIMARY KEY, data TEXT NOT NULL, confirmed INTEGER NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS run_history (seq INTEGER PRIMARY KEY AUTOINCREMENT, schedule TEXT NOT NULL, occurrence TEXT NOT NULL, status TEXT NOT NULL, input TEXT NOT NULL, output TEXT NOT NULL, attempts INTEGER NOT NULL, recorded_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ingredients (id TEXT PRIMARY KEY, name TEXT NOT NULL, unit TEXT NOT NULL, version INTEGER NOT NULL, provenance TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, data TEXT NOT NULL, version INTEGER NOT NULL, verified INTEGER NOT NULL, provenance TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS purchases (id TEXT PRIMARY KEY, ingredient_id TEXT NOT NULL, data TEXT NOT NULL, version INTEGER NOT NULL, verified INTEGER NOT NULL, provenance TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sources (id TEXT PRIMARY KEY, kind TEXT NOT NULL, bytes TEXT NOT NULL, received_at TEXT NOT NULL, verified INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS previews (token TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL, expected TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, state TEXT NOT NULL, blocked_reason TEXT, cancellation TEXT, history TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS approvals (id TEXT PRIMARY KEY, object_type TEXT NOT NULL, object_id TEXT NOT NULL, object_version INTEGER NOT NULL, state TEXT NOT NULL, created_at TEXT NOT NULL, decided_at TEXT);
CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, schedule TEXT NOT NULL, occurrence TEXT NOT NULL, status TEXT NOT NULL, input TEXT NOT NULL, output TEXT NOT NULL, attempts INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS idx_runs_sched_occ ON runs(schedule, occurrence);
CREATE TABLE IF NOT EXISTS leases (k TEXT PRIMARY KEY, owner TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS workflows_config (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL);
`;
export function openDb(path) {
    const raw = new DatabaseSync(path);
    raw.exec(SCHEMA);
    return {
        raw,
        close() {
            raw.close();
        },
    };
}
export function newId(prefix) {
    return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
export function nowIso(clock = () => new Date()) {
    return clock().toISOString();
}
/** Run fn inside an immediate transaction. Rolls back on throw. */
export function transact(db, fn) {
    db.raw.exec('BEGIN IMMEDIATE');
    try {
        const out = fn();
        db.raw.exec('COMMIT');
        return out;
    }
    catch (e) {
        try {
            db.raw.exec('ROLLBACK');
        }
        catch {
            // ignore rollback errors
        }
        throw e;
    }
}
//# sourceMappingURL=db.js.map