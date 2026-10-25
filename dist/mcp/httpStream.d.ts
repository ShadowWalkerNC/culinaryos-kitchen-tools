import type { IncomingMessage, ServerResponse } from 'node:http';
import { type McpMode } from './server.js';
import type { LocalContext } from './localTools.js';
export declare function handleMcpStreamable(req: IncomingMessage, res: ServerResponse, mode: McpMode, ctx: LocalContext | undefined, parsedBody: unknown): Promise<void>;
//# sourceMappingURL=httpStream.d.ts.map