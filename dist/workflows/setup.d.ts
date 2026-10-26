import { type Db } from '../data/db.js';
export declare const PUBLIC_ENDPOINT = "https://culinaryos-kitchen-tools-production.up.railway.app/mcp";
export declare function setupStatus(db: Db): {
    version: string;
    nodeVersion: string;
    schemaVersion: number;
    mode: string;
    profile: {
        country?: string | undefined;
        region?: string | undefined;
        currency?: string | undefined;
        unitSystem?: "metric" | "us-customary" | "mixed" | undefined;
        timezone?: string | undefined;
        foodCostTargetPercent?: number | undefined;
    };
    missingSettings: string[];
    recipes: number;
    purchases: number;
    connectedRuns: number;
    worker: {
        state: string;
        message: string;
    } | {
        state: string;
        message: string;
        lastCheckAt: string;
        nextCheckAt: string | null;
    };
    publicEndpoint: string;
    clientStatus: string;
};
export declare function checkHostedConnection(): Promise<{
    status: string;
    checkedAt: string;
    checks: string[];
    scope: string;
    inputs: string;
    error?: never;
} | {
    status: string;
    checkedAt: string;
    checks: string[];
    error: string;
    scope: string;
    inputs?: never;
}>;
//# sourceMappingURL=setup.d.ts.map