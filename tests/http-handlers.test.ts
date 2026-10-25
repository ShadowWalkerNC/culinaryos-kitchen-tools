// Handler-level HTTP tests: drive the real request handlers with mock req/res (no TCP).
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalHandler } from '../src/server/localHttp.js';
import { createPublicHandler } from '../src/server/publicHttp.js';
import { openDb, type Db } from '../src/data/db.js';
import { createSessionStore, createCalcRunner } from '../src/server/security.js';

const PORT = 32102;

interface Done { status: number; body: string; headers: Record<string, unknown> }

function mockReq(opts: { method?: string; url?: string; headers?: Record<string, string>; body?: string }): EventEmitter & { method: string; url: string; headers: Record<string, string>; destroy(): void } {
  const e = new EventEmitter() as EventEmitter & { method: string; url: string; headers: Record<string, string>; destroy(): void };
  e.method = opts.method ?? 'GET';
  e.url = opts.url ?? '/';
  e.headers = { host: `127.0.0.1:${PORT}`, ...(opts.headers ?? {}) };
  e.destroy = (): void => undefined;
  process.nextTick(() => {
    if (opts.body !== undefined) e.emit('data', Buffer.from(opts.body));
    e.emit('end');
  });
  return e;
}

function mockRes(): { res: EventEmitter & { statusCode: number; writeHead(s: number, h: Record<string, unknown>): void; end(c?: string): void }; done: Promise<Done> } {
  const e = new EventEmitter() as EventEmitter & { statusCode: number; writeHead(s: number, h: Record<string, unknown>): void; end(c?: string): void };
  e.statusCode = 200;
  let status = 200;
  let headers: Record<string, unknown> = {};
  let body = '';
  e.writeHead = (s: number, h: Record<string, unknown>): void => {
    status = s;
    e.statusCode = s;
    headers = h;
  };
  let resolve!: (d: Done) => void;
  const done = new Promise<Done>((r) => {
    resolve = r;
  });
  e.end = (c?: string): void => {
    if (c !== undefined) body += c;
    resolve({ status, body, headers });
  };
  return { res: e, done };
}

let db: Db;
let ws = '';
let handler: ReturnType<typeof createLocalHandler>;

beforeEach(() => {
  ws = mkdtempSync(join(tmpdir(), 'kthh-'));
  db = openDb(':memory:');
  handler = createLocalHandler({ db, workspaceRoot: ws, uiDir: join(ws, 'ui-missing'), port: PORT, sessions: createSessionStore(ws), runCalc: createCalcRunner() });
});

afterEach(() => {
  db.close();
  rmSync(ws, { recursive: true, force: true });
});

async function call(opts: Parameters<typeof mockReq>[0]): Promise<Done> {
  const { res, done } = mockRes();
  handler(mockReq(opts) as never, res as never);
  return done;
}

describe('local handler (no TCP)', () => {
  it('health + version', async () => {
    assert.equal((await call({ url: '/health' })).status, 200);
    const v = await call({ url: '/version' });
    assert.equal(v.status, 200);
    assert.match(v.body, /"mode":"local"/);
  });

  it('rejects bad host and bad origin', async () => {
    assert.equal((await call({ url: '/health', headers: { host: 'evil.example:9999' } })).status, 403);
    assert.equal((await call({ url: '/health', headers: { origin: 'http://evil.example' } })).status, 403);
    assert.equal((await call({ url: '/health', headers: { 'sec-fetch-site': 'cross-site' } })).status, 403);
  });

  it('session issuance; browser origin without fetch metadata rejected', async () => {
    const s = await call({ url: '/api/session' });
    assert.equal(s.status, 200);
    const token = (JSON.parse(s.body) as { token: string }).token;
    assert.ok(token.length >= 32);
    const bad = await call({ url: '/api/session', headers: { origin: `http://127.0.0.1:${PORT}`, 'sec-fetch-site': 'cross-site' } });
    assert.equal(bad.status, 403);
  });

  it('mutations need token; authed round-trip works; errors never echo token', async () => {
    const anon = await call({ method: 'POST', url: '/api/tasks', body: JSON.stringify({ title: 'x' }) });
    assert.equal(anon.status, 401);
    const token = (JSON.parse((await call({ url: '/api/session' })).body) as { token: string }).token;
    const created = await call({ method: 'POST', url: '/api/tasks', headers: { 'x-session-token': token }, body: JSON.stringify({ title: 't1' }) });
    assert.equal(created.status, 200);
    assert.equal(created.headers['access-control-allow-origin'], undefined);
    const wrong = await call({ method: 'POST', url: '/api/tasks/nope/state', headers: { 'x-session-token': 'wrong' }, body: '{}' });
    assert.equal(wrong.status, 401);
    assert.ok(!wrong.body.includes(token));
  });

  it('preview/commit round-trip; stale commit -> 409', async () => {
    const token = (JSON.parse((await call({ url: '/api/session' })).body) as { token: string }).token;
    const payload = JSON.stringify([{ id: 'r1', name: 'R', currency: 'USD', yieldQty: { amount: '2', unit: 'serving' }, ingredients: [], subrecipes: [] }]);
    const h = { 'x-session-token': token };
    const p1 = JSON.parse((await call({ method: 'POST', url: '/api/imports/preview', headers: h, body: JSON.stringify({ kind: 'recipe_json', payloadText: payload }) })).body) as { token: string };
    const p2 = JSON.parse((await call({ method: 'POST', url: '/api/imports/preview', headers: h, body: JSON.stringify({ kind: 'recipe_json', payloadText: payload }) })).body) as { token: string };
    assert.equal((await call({ method: 'POST', url: '/api/imports/commit', headers: h, body: JSON.stringify({ token: p2.token, confirm: true }) })).status, 200);
    const stale = await call({ method: 'POST', url: '/api/imports/commit', headers: h, body: JSON.stringify({ token: p1.token, confirm: true }) });
    assert.equal(stale.status, 409);
  });

  it('oversize body -> 413', async () => {
    const token = (JSON.parse((await call({ url: '/api/session' })).body) as { token: string }).token;
    const r = await call({ method: 'POST', url: '/api/imports/preview', headers: { 'x-session-token': token }, body: 'x'.repeat(1_100_000) });
    assert.equal(r.status, 413);
  });

  it('mcp route requires token before transport', async () => {
    const r = await call({ method: 'POST', url: '/mcp', body: '{}' });
    assert.equal(r.status, 401);
  });

  it('unknown api route -> 404; unbuilt UI honest', async () => {
    assert.equal((await call({ url: '/api/nope' })).status, 404);
    const ui = await call({ url: '/' });
    assert.equal(ui.status, 200);
    assert.match(ui.body, /UI not built/);
  });
});

describe('public handler (no TCP)', () => {
  const pub = createPublicHandler(PORT);
  async function pubCall(opts: Parameters<typeof mockReq>[0]): Promise<Done> {
    const { res, done } = mockRes();
    pub(mockReq(opts) as never, res as never);
    return done;
  }

  it('health + version stateless; host/origin enforced', async () => {
    assert.equal((await pubCall({ url: '/health' })).status, 200);
    const v = await pubCall({ url: '/version' });
    assert.match(v.body, /public-stateless/);
    assert.equal((await pubCall({ url: '/health', headers: { host: 'evil:1' } })).status, 403);
    assert.equal((await pubCall({ url: '/health', headers: { origin: 'http://evil.example' } })).status, 403);
  });

  it('mcp GET rejected; oversize rejected; unknown 404', async () => {
    assert.equal((await pubCall({ url: '/mcp' })).status, 405);
    assert.equal((await pubCall({ method: 'POST', url: '/mcp', body: 'x'.repeat(1_100_000) })).status, 413);
    assert.equal((await pubCall({ url: '/nope' })).status, 404);
  });
});
