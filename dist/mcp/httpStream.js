import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './server.js';
export async function handleMcpStreamable(req, res, mode, ctx, parsedBody) {
    const server = createMcpServer(mode, ctx);
    const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
    res.on('close', () => {
        void transport.close();
        void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, parsedBody);
}
//# sourceMappingURL=httpStream.js.map