import type { IncomingMessage } from 'node:http';
export declare const MAX_BODY_BYTES = 1000000;
export declare const CALC_TIMEOUT_MS = 5000;
export declare const CALC_CONCURRENCY = 4;
export declare function expectedOrigins(port: number): string[];
export declare function checkHost(req: IncomingMessage, port: number): boolean;
/** Origin validation: present Origin must exactly match; Sec-Fetch-Site must be same-origin when present. */
export declare function checkOrigin(req: IncomingMessage, port: number): boolean;
export declare function createSessionStore(workspaceRoot: string): {
    token: string;
    verify(t: string | undefined): boolean;
};
export declare function readBodyCapped(req: IncomingMessage, max?: number): Promise<Buffer>;
/** Bounded calc runner: concurrency + timeout. */
export declare function createCalcRunner(concurrency?: number, timeoutMs?: number): <T>(fn: () => T | Promise<T>) => Promise<T>;
export declare function logMeta(method: string | undefined, path: string | undefined, status: number, ms: number): void;
//# sourceMappingURL=security.d.ts.map