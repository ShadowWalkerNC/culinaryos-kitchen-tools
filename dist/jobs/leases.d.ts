import { type Db } from '../data/db.js';
export declare function tryAcquireLease(db: Db, key: string, owner: string, ttlMs: number, now?: Date): boolean;
export declare function releaseLease(db: Db, key: string, owner: string): void;
//# sourceMappingURL=leases.d.ts.map