// TCP-level HTTP tests. Skipped automatically when loopback bind is unavailable (sandbox);
// handler-level coverage lives in http-handlers.test.ts and always runs.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest, createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startLocalServer } from '../src/server/localHttp.js';

const PORT = 32102;

async function canBind(): Promise<boolean> {
  return new Promise((resolve) => {
    const s = createServer();
    s.once('listening', () => s.close(() => resolve(true)));
    s.once('error', () => resolve(false));
    s.listen(PORT, '127.0.0.1');
  });
}

const TCP = await canBind();
const suite = TCP ? describe : describe.skip;

let ws = '';
let close: (() => Promise<void>) | null = null;

interface Resp { status: number; body: string; headers: Record<string, string | string[] | undefined> }

function req(path: string, opts: { method?: string; headers?: Record<string, string>; body?: string; setHost?: boolean } = {}): Promise<Resp> {
  return new Promise((resolve, reject) => {
    const r = httpRequest({ host: '127.0.0.1', port: PORT, path, method: opts.method ?? 'GET', headers: opts.headers ?? {}, setHost: opts.setHost ?? true }, (res) => {
      let data = '';
      res.on('data', (c: Buffer) => {
        data += c.toString();
      });
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data, headers: res.headers as Resp['headers'] }));
    });
    r.on('error', reject);
    if (opts.body) r.write(opts.body);
    r.end();
  });
}

suite('local http security (tcp)', () => {
  before(async () => {
    ws = mkdtempSync(join(tmpdir(), 'kth-'));
    const s = startLocalServer({ port: PORT, workspaceRoot: ws, uiDir: join(ws, 'ui-missing') });
    close = s.close;
    if (!(await s.ready)) throw new Error('tcp server failed to start');
  });
  after(async () => {
    if (close) await close();
    if (ws !== '') rmSync(ws, { recursive: true, force: true });
  });

  it('health + version ok', async () => {
    assert.equal((await req('/health')).status, 200);
    const v = await req('/version');
    assert.equal(v.status, 200);
    assert.match(v.body, /"mode":"local"/);
  });

  it('rejects bad host', async () => {
    const r = await req('/health', { headers: { host: 'evil.example:9999' }, setHost: false });
    assert.equal(r.status, 403);
  });

  it('rejects bad origin', async () => {
    const r = await req('/health', { headers: { origin: 'http://evil.example' } });
    assert.equal(r.status, 403);
  });

  it('mutations require session token', async () => {
    const r = await req('/api/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'x' }) });
    assert.equal(r.status, 401);
  });

  it('session issuance + authed mutation round-trip; no token echo in errors', async () => {
    const s = await req('/api/session');
    assert.equal(s.status, 200);
    const token = (JSON.parse(s.body) as { token: string }).token;
    assert.ok(token.length >= 32);
    const created = await req('/api/tasks', { method: 'POST', headers: { 'content-type': 'application/json', 'x-session-token': token }, body: JSON.stringify({ title: 't1' }) });
    assert.equal(created.status, 200);
    const bad = await req('/api/tasks/nope/state', { method: 'POST', headers: { 'content-type': 'application/json', 'x-session-token': 'wrong' }, body: '{}' });
    assert.equal(bad.status, 401);
    assert.ok(!bad.body.includes(token), 'error must not echo session token');
    assert.equal(created.headers['access-control-allow-origin'], undefined);
  });

  it('rejects oversize bodies with 413', async () => {
    const s = await req('/api/session');
    const token = (JSON.parse(s.body) as { token: string }).token;
    const big = 'x'.repeat(1_100_000);
    const r = await req('/api/imports/preview', { method: 'POST', headers: { 'content-type': 'application/json', 'x-session-token': token }, body: JSON.stringify({ kind: 'pasted_text', payloadText: big }) });
    assert.equal(r.status, 413);
  });

  it('unbuilt UI shows honest fallback, not fake data', async () => {
    const r = await req('/');
    assert.equal(r.status, 200);
    assert.match(r.body, /UI not built/);
  });
});
