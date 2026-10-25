import { randomBytes } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
export const MAX_BODY_BYTES = 1_000_000;
export const CALC_TIMEOUT_MS = 5000;
export const CALC_CONCURRENCY = 4;
export function expectedOrigins(port) {
    return [`http://127.0.0.1:${port}`, `http://localhost:${port}`];
}
export function checkHost(req, port) {
    const host = (req.headers.host ?? '').toLowerCase();
    return host === `127.0.0.1:${port}` || host === `localhost:${port}`;
}
/** Origin validation: present Origin must exactly match; Sec-Fetch-Site must be same-origin when present. */
export function checkOrigin(req, port) {
    const origins = expectedOrigins(port);
    const origin = req.headers.origin;
    if (typeof origin === 'string' && origin !== '' && !origins.includes(origin))
        return false;
    const sfs = req.headers['sec-fetch-site'];
    if (typeof sfs === 'string' && sfs !== '' && sfs !== 'same-origin' && sfs !== 'none') {
        // Allow browsers sending same-origin only; curl sends nothing.
        if (sfs !== 'same-origin')
            return false;
    }
    return true;
}
export function createSessionStore(workspaceRoot) {
    const token = randomBytes(32).toString('hex');
    mkdirSync(workspaceRoot, { recursive: true });
    try {
        writeFileSync(join(workspaceRoot, '.session'), token, { mode: 0o600 });
    }
    catch {
        writeFileSync(join(workspaceRoot, '.session'), token);
    }
    return {
        token,
        verify(t) {
            return typeof t === 'string' && t.length === token.length && timingSafeEqualStr(t, token);
        },
    };
}
function timingSafeEqualStr(a, b) {
    let diff = a.length === b.length ? 0 : 1;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
        const x = i < a.length ? a.charCodeAt(i) : 0;
        const y = i < b.length ? b.charCodeAt(i) : 0;
        diff |= x ^ y;
    }
    return diff === 0;
}
export function readBodyCapped(req, max = MAX_BODY_BYTES) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        let rejected = false;
        req.on('data', (c) => {
            size += c.length;
            if (rejected)
                return;
            if (size > max) {
                reject(new Error('BODY_TOO_LARGE'));
                rejected = true;
                chunks.length = 0;
                return;
            }
            chunks.push(c);
        });
        req.on('end', () => { if (!rejected)
            resolve(Buffer.concat(chunks)); });
        req.on('error', reject);
    });
}
/** Bounded calc runner: concurrency + timeout. */
export function createCalcRunner(concurrency = CALC_CONCURRENCY, timeoutMs = CALC_TIMEOUT_MS) {
    let active = 0;
    const acquire = () => new Promise((resolve) => {
        if (active < concurrency) {
            active += 1;
            resolve();
        }
        else {
            throw new Error('CALC_BUSY');
        }
    });
    const release = () => {
        active -= 1;
    };
    return async (fn) => {
        await acquire();
        let timer;
        try {
            return (await Promise.race([
                Promise.resolve().then(fn),
                new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('CALC_TIMEOUT')), timeoutMs); }),
            ]));
        }
        finally {
            clearTimeout(timer);
            release();
        }
    };
}
export function logMeta(method, path, status, ms) {
    // Metadata-only logs: no payloads, tokens, or secrets.
    process.stderr.write(JSON.stringify({ method, path: path?.split('?')[0], status, ms }) + '\n');
}
//# sourceMappingURL=security.js.map