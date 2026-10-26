import type { Db } from '../data/db.js';
export declare function workerStatus(db: Db): {
    state: string;
    message: string;
} | {
    state: string;
    message: string;
    lastCheckAt: string;
    nextCheckAt: string | null;
};
export declare function startWorkspaceWorker(db: Db, intervalMs?: number): () => void;
//# sourceMappingURL=workspaceWorker.d.ts.map