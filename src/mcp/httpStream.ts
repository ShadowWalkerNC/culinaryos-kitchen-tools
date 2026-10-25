// Streamable HTTP transport wiring for node:http servers.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer, type McpMode } from './server.js';
import type { LocalContext } from './localTools.js';

export async function handleMcpStreamable(req: IncomingMessage, res: ServerResponse, mode: McpMode, ctx: LocalContext | undefined, parsedBody: unknown): Promise<void> {
  const server = createMcpServer(mode, ctx);
  const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
  res.on('close', () => {
    void transport.close();
    void server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, parsedBody);
}
