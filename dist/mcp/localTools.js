import { previewImport, commitImport } from '../data/imports.js';
import { createTask, listTasks, setTaskState, requestApproval, decideApproval, listApprovals } from '../data/tasks.js';
import { getRecipe, listRecipes, latestPurchaseByIngredient, allRecipes } from '../data/queries.js';
import { exportJson, exportRecipeCards, exportCostSheets } from '../data/exports.js';
import { costRecipe } from '../core/costing.js';
import { DEFAULT_WORKER_CONFIG, saveForecast, workerTick } from '../jobs/worker.js';
import { systemClock } from '../jobs/clocks.js';
export const LOCAL_TOOL_NAMES = [
    'lookup_recipe',
    'list_recipes',
    'cost_stored_recipe',
    'preview_import',
    'commit_import',
    'create_task',
    'list_tasks',
    'set_task_state',
    'request_approval',
    'decide_approval',
    'list_approvals',
    'export_data',
    'get_workflows_config',
    'set_workflows_config',
    'set_forecast',
    'run_workflows',
    'list_runs',
];
export function getWorkflowsConfig(db) {
    const row = db.raw.prepare('SELECT data FROM workflows_config WHERE id = ?').get('default');
    if (!row)
        return { ...DEFAULT_WORKER_CONFIG };
    return { ...DEFAULT_WORKER_CONFIG, ...JSON.parse(row.data) };
}
export function setWorkflowsConfig(db, patch) {
    const cur = getWorkflowsConfig(db);
    const next = { ...cur, ...patch };
    new Intl.DateTimeFormat('en', { timeZone: next.timezone }).format(new Date());
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(next.dailyCutoff))
        throw new Error('cutoff must be HH:MM');
    if (typeof next.dailyPrepEnabled !== 'boolean' || typeof next.costReviewEnabled !== 'boolean')
        throw new Error('explicit schedule switches required');
    db.raw
        .prepare('INSERT INTO workflows_config (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at')
        .run('default', JSON.stringify(next), new Date().toISOString());
    return next;
}
export function localHandlers(ctx) {
    const { db, workspaceRoot } = ctx;
    return {
        lookup_recipe: ((args) => getRecipe(db, args.id)),
        list_recipes: (() => listRecipes(db)),
        cost_stored_recipe: ((args) => {
            const recipes = allRecipes(db);
            if (!recipes.has(args.id))
                throw new Error(`unknown recipe ${args.id}`);
            return costRecipe({ recipes, purchasesByIngredient: latestPurchaseByIngredient(db), targetRecipeId: args.id, ...(args.variantId ? { variantId: args.variantId } : {}) });
        }),
        preview_import: ((args) => previewImport(db, args.kind, args.payloadText)),
        commit_import: ((args) => commitImport(db, args.token, args.confirm)),
        create_task: ((args) => createTask(db, args.title)),
        list_tasks: (() => listTasks(db)),
        set_task_state: ((args) => setTaskState(db, args.id, args.state, { ...(args.blockedReason ? { blockedReason: args.blockedReason } : {}), ...(args.cancellation ? { cancellation: args.cancellation } : {}) })),
        request_approval: ((args) => requestApproval(db, args.objectType, args.objectId)),
        decide_approval: ((args) => decideApproval(db, args.id, args.approve)),
        list_approvals: (() => listApprovals(db)),
        export_data: ((args) => ({ file: args.format === 'cost-sheets' ? exportCostSheets(db, workspaceRoot, args.file) : args.format === 'json' ? exportJson(db, workspaceRoot, args.file) : exportRecipeCards(db, workspaceRoot, args.file) })),
        get_workflows_config: (() => getWorkflowsConfig(db)),
        set_workflows_config: ((args) => setWorkflowsConfig(db, args)),
        set_forecast: ((args) => { saveForecast(db, args.day, args.forecast, args.confirm, systemClock()); return { saved: args.day }; }),
        run_workflows: (() => workerTick(db, systemClock())),
        list_runs: (() => db.raw.prepare('SELECT schedule,occurrence,status,input,output,attempts,updated_at FROM runs ORDER BY updated_at DESC LIMIT 100').all()),
    };
}
//# sourceMappingURL=localTools.js.map