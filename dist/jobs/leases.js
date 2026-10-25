// F12 atomic leases: multi-worker safe via INSERT..ON CONFLICT.
import { nowIso } from '../data/db.js';
export function tryAcquireLease(db, key, owner, ttlMs, now = new Date()) {
    const expiresAt = new Date(now.getTime() + ttlMs).toISOString();
    const nowS = nowIso(() => now);
    // Clean expired first (best effort), then try insert; if conflict and unexpired, lost.
    db.raw.prepare('DELETE FROM leases WHERE k = ? AND expires_at <= ?').run(key, nowS);
    const res = db.raw.prepare('INSERT INTO leases (k, owner, expires_at) VALUES (?, ?, ?) ON CONFLICT(k) DO NOTHING').run(key, owner, expiresAt);
    return res.changes > 0;
}
export function releaseLease(db, key, owner) {
    db.raw.prepare('DELETE FROM leases WHERE k = ? AND owner = ?').run(key, owner);
}
//# sourceMappingURL=leases.js.map