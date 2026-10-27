// F18 MCP protocol tests: discovery + real calls on stdio and Streamable HTTP; public isolation.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createMcpServer } from '../src/mcp/server.js';
import { PUBLIC_TOOL_NAMES } from '../src/mcp/publicTools.js';
import { startPublicServer } from '../src/server/publicHttp.js';
import { openDb } from '../src/data/db.js';

const RECIPE = {
  id: 'r1', name: 'R', currency: 'USD',
  yieldQty: { amount: '2', unit: 'serving' },
  ingredients: [{ ingredientId: 'i1', qty: { amount: '1', unit: 'kg' } }],
  subrecipes: [],
};

function textOf(result: unknown): string {
  const r = result as { content: Array<{ type: string; text: string }> };
  return r.content[0]!.text;
}

describe('mcp public (in-memory protocol)', () => {
  it('discovers exactly the 16 public tools and calls scale_recipe', async () => {
    const server = createMcpServer('public');
    const client = new Client({ name: 't', version: '1' });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    await server.connect(st);
    await client.connect(ct);
    try {
      const tools = await client.listTools();
      const names = tools.tools.map((t) => t.name).sort();
      assert.deepEqual(names, [...PUBLIC_TOOL_NAMES].sort());
      for(const tool of tools.tools)assert.deepEqual(tool.annotations,{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false});
      const out = await client.callTool({ name: 'scale_recipe', arguments: { recipe: RECIPE, targetYieldAmount: '4' } });
      const scaled = JSON.parse(textOf(out)) as { yieldQty: { amount: string } };
      assert.equal(scaled.yieldQty.amount, '4');
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('public cannot call local tools', async () => {
    const server = createMcpServer('public');
    const client = new Client({ name: 't', version: '1' });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    await server.connect(st);
    await client.connect(ct);
    try {
      const out = await client.callTool({ name: 'lookup_recipe', arguments: { id: 'x' } }).then(
        (r) => r as { isError?: boolean },
        () => ({ isError: true }),
      );
      assert.equal(out.isError, true);
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('no cross-request data leak', async () => {
    const server = createMcpServer('public');
    const client = new Client({ name: 't', version: '1' });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    await server.connect(st);
    await client.connect(ct);
    try {
      const a = JSON.parse(textOf(await client.callTool({ name: 'scale_recipe', arguments: { recipe: { ...RECIPE, id: 'AAA' }, targetYieldAmount: '4' } }))) as { id: string };
      const b = JSON.parse(textOf(await client.callTool({ name: 'scale_recipe', arguments: { recipe: { ...RECIPE, id: 'BBB' }, targetYieldAmount: '6' } }))) as { id: string; yieldQty: { amount: string } };
      assert.equal(a.id, 'AAA');
      assert.equal(b.id, 'BBB');
      assert.equal(b.yieldQty.amount, '6');
    } finally {
      await client.close();
      await server.close();
    }
  });
});

describe('mcp local (in-memory)', () => {
  it('registers local tools and runs task round-trip', async () => {
    const ws = mkdtempSync(join(tmpdir(), 'ktm-'));
    const db = openDb(':memory:');
    try {
      const server = createMcpServer('local', { db, workspaceRoot: ws });
      const client = new Client({ name: 't', version: '1' });
      const [ct, st] = InMemoryTransport.createLinkedPair();
      await server.connect(st);
      await client.connect(ct);
      try {
        const names = (await client.listTools()).tools.map((t) => t.name);
        assert.ok(names.includes('lookup_recipe'));
        assert.ok(names.includes('preview_import'));
        const created = JSON.parse(textOf(await client.callTool({ name: 'create_task', arguments: { title: 'hello' } }))) as { id: string };
        assert.match(created.id, /^task_/);
      } finally {
        await client.close();
        await server.close();
      }
    } finally {
      db.close();
      rmSync(ws, { recursive: true, force: true });
    }
  });
});

describe('mcp stdio (real transport)', () => {
  it('lists and calls over spawned stdio', async () => {
    const entry = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'mcp', 'stdio.ts');
    const transport = new StdioClientTransport({ command: process.execPath, args: ['--import', 'tsx', entry, '--mode=public'] });
    const client = new Client({ name: 't', version: '1' });
    await client.connect(transport);
    try {
      const names = (await client.listTools()).tools.map((t) => t.name);
      assert.ok(names.includes('cost_recipe'));
      assert.ok(!names.includes('lookup_recipe'));
      const caps = JSON.parse(textOf(await client.callTool({ name: 'list_capabilities', arguments: {} }))) as { mode: string };
      assert.equal(caps.mode, 'public-stateless');
    } finally {
      await client.close();
    }
  });
});

describe('mcp streamable http (real transport)', () => {
  const PORT = 32101;
  let close: (() => Promise<void>) | null = null;
  let up = false;
  before(async () => {
    const s = startPublicServer({ port: PORT, host: '127.0.0.1' });
    close = s.close;
    up = await s.ready;
    if (!up) console.log('SKIP streamable-http test: cannot bind loopback in this sandbox');
  });
  after(async () => {
    if (close) await close();
  });

  it('lists and calls over Streamable HTTP; local tools absent', async () => {
    if (!up) {
      console.log('SKIP: no TCP bind in this environment');
      return;
    }
    const client = new Client({ name: 't', version: '1' });
    await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${PORT}/mcp`)));
    try {
      const names = (await client.listTools()).tools.map((t) => t.name);
      assert.ok(names.includes('build_prep_plan'));
      assert.ok(!names.includes('commit_import'));
      const denied = await client.callTool({ name: 'commit_import', arguments: { token: 'x', confirm: true } }).then(
        (r) => r as { isError?: boolean },
        () => ({ isError: true }),
      );
      assert.equal(denied.isError, true);
      const out = await client.callTool({ name: 'convert_quantity', arguments: { amount: '1', fromUnit: 'kg', toUnit: 'g', factor: '1000', factorBasis: 'metric definition' } });
      assert.equal((JSON.parse(textOf(out)) as { amount: string }).amount, '1000');
    } finally {
      await client.close();
    }
  });
});
