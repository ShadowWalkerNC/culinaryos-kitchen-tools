import type { Db } from '../data/db.js';
import { type WorkerConfig } from '../jobs/worker.js';
export declare const LOCAL_TOOL_NAMES: readonly ["lookup_recipe", "list_recipes", "cost_stored_recipe", "preview_import", "commit_import", "create_task", "list_tasks", "set_task_state", "request_approval", "decide_approval", "list_approvals", "export_data", "get_workflows_config", "set_workflows_config", "set_forecast", "run_workflows", "list_runs"];
export type LocalToolName = (typeof LOCAL_TOOL_NAMES)[number];
export interface LocalContext {
    db: Db;
    workspaceRoot: string;
}
export declare function getWorkflowsConfig(db: Db): WorkerConfig;
export declare function setWorkflowsConfig(db: Db, patch: Partial<WorkerConfig>): WorkerConfig;
export declare function localHandlers(ctx: LocalContext): Record<LocalToolName, (args: never) => unknown>;
//# sourceMappingURL=localTools.d.ts.map