// Compiled stdio entry. Usage: node dist/mcp/stdio.js --mode=public|local [--workspace <dir>]
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer, type McpMode } from './server.js';
import { openDb } from '../data/db.js';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

async function main(): Promise<void> {
  const modeArg = process.argv.find((a) => a.startsWith('--mode='))?.split('=')[1];
  const mode: McpMode = modeArg === 'local' ? 'local' : 'public';
  const wsIdx = process.argv.indexOf('--workspace');
  const workspace = wsIdx >= 0 && process.argv[wsIdx + 1] ? (process.argv[wsIdx + 1] as string) : './workspace';
  let ctx = undefined;
  if (mode === 'local') {
    mkdirSync(workspace, { recursive: true });
    const db = openDb(join(workspace, 'kitchen-tools.sqlite'));
    ctx = { db, workspaceRoot: workspace };
  }
  const server = createMcpServer(mode, ctx);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

void main();
