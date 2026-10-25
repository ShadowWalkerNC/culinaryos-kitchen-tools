import { type IncomingMessage, type ServerResponse } from 'node:http';
/** Exported for handler-level tests (no TCP needed). */
export declare function createPublicHandler(port: number): (req: IncomingMessage, res: ServerResponse) => void;
export declare function startPublicServer(opts: {
    port: number;
    host?: string;
}): {
    close(): Promise<void>;
    port: number;
    ready: Promise<boolean>;
};
//# sourceMappingURL=publicHttp.d.ts.map