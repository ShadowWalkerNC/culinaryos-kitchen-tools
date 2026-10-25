import { type IncomingMessage, type ServerResponse } from 'node:http';
import { type Db } from '../data/db.js';
import { createSessionStore, createCalcRunner } from './security.js';
export interface LocalServerOpts {
    port: number;
    workspaceRoot: string;
    uiDir: string;
    dev?: boolean;
}
export interface LocalHandlerDeps {
    db: Db;
    workspaceRoot: string;
    uiDir: string;
    port: number;
    sessions: ReturnType<typeof createSessionStore>;
    runCalc: ReturnType<typeof createCalcRunner>;
}
/** Exported for handler-level tests (no TCP needed). */
export declare function createLocalHandler(deps: LocalHandlerDeps): (req: IncomingMessage, res: ServerResponse) => void;
export declare function startLocalServer(opts: LocalServerOpts): {
    close(): Promise<void>;
    port: number;
    ready: Promise<boolean>;
};
//# sourceMappingURL=localHttp.d.ts.map