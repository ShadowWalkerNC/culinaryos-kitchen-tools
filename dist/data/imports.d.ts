import { z } from 'zod';
import { type Db } from './db.js';
export declare const ImportKind: z.ZodEnum<{
    recipe_json: "recipe_json";
    purchase_json: "purchase_json";
    recipe_csv: "recipe_csv";
    purchase_csv: "purchase_csv";
    pasted_text: "pasted_text";
}>;
export type ImportKind = z.infer<typeof ImportKind>;
export interface PreviewResult {
    items?: Array<{
        id: string;
        label: string;
        summary: string;
    }>;
    token: string;
    kind: ImportKind;
    records: number;
    missing: string[];
    conflicts: Array<{
        id: string;
        currentVersion: number | null;
        incomingVersion: number | null;
    }>;
    expiresAt: string;
}
export declare function previewImport(db: Db, kind: ImportKind, payloadText: string, opts?: {
    now?: () => Date;
}): PreviewResult;
export interface CommitResult {
    committed: string[];
    versions: Array<{
        id: string;
        version: number;
    }>;
}
export declare function commitImport(db: Db, token: string, confirm: boolean, opts?: {
    now?: () => Date;
}): CommitResult;
//# sourceMappingURL=imports.d.ts.map