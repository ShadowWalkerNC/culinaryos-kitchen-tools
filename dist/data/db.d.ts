import { DatabaseSync } from 'node:sqlite';
export interface Db {
    raw: DatabaseSync;
    close(): void;
}
export declare function openDb(path: string): Db;
export declare function newId(prefix: string): string;
export declare function nowIso(clock?: () => Date): string;
/** Run fn inside an immediate transaction. Rolls back on throw. */
export declare function transact<T>(db: Db, fn: () => T): T;
//# sourceMappingURL=db.d.ts.map