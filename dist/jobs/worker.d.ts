import { type Db } from '../data/db.js';
import { type Clock } from './clocks.js';
export interface WorkerConfig {
    timezone: string;
    dailyCutoff: string;
    dailyPrepEnabled: boolean;
    costReviewEnabled: boolean;
    aiSummary?: {
        configured: boolean;
    };
}
export declare const DEFAULT_WORKER_CONFIG: WorkerConfig;
export declare function aiStatus(config: WorkerConfig): {
    configured: boolean;
    message: string;
};
/** Idempotent per eventId: duplicate cost-import events create tasks once. */
export declare function handleCostImport(db: Db, eventId: string, ingredientIds: string[], config: WorkerConfig, clock: Clock): {
    created: string[];
    skipped: boolean;
};
export interface ForecastInput {
    demands: Array<{
        recipeId: string;
        servings: string;
        servingUnit: string;
        yieldPerBatch: string;
    }>;
    stock: Array<{
        recipeId: string;
        onHand: string;
        unit: string;
    }>;
    sourceVersions?: Array<{
        id: string;
        version: number;
    }>;
}
/** Daily prep draft for tomorrow. Missing data -> action-required task. Bounded retries. */
export declare function runDailyPrep(db: Db, occurrence: string, forecast: ForecastInput | null, config: WorkerConfig, clock: Clock, attempt?: number): {
    status: string;
    taskId?: string;
};
/** Catch up at most one missed occurrence. */
export declare function catchUpOnce(db: Db, occurrence: string, forecast: ForecastInput | null, config: WorkerConfig, clock: Clock): {
    status: string;
};
/** Restart recovery: mark interrupted (retrying) runs visible and requeue once. */
export declare function recoverInterrupted(db: Db, clock: Clock): string[];
export declare function todayOccurrence(clock: Clock): string;
export declare function saveForecast(db: Db, day: string, forecast: ForecastInput, confirm: boolean, clock: Clock): void;
/** Durable scheduler tick; approvals and complete operational inputs are checked here. */
export declare function workerTick(db: Db, clock: Clock): {
    events: number;
    prep: string;
    serviceDay: string;
};
//# sourceMappingURL=worker.d.ts.map