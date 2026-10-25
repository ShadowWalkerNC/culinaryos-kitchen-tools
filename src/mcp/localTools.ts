// F09 local tools: workspace-backed. Only registered in local mode.
import type { Db } from '../data/db.js';
import { previewImport, commitImport } from '../data/imports.js';
import { createTask, listTasks, setTaskState, requestApproval, decideApproval, listApprovals } from '../data/tasks.js';
import { getRecipe, listRecipes, latestPurchaseByIngredient, allRecipes } from '../data/queries.js';
import { exportJson, exportRecipeCards, exportCostSheets } from '../data/exports.js';
import { costRecipe } from '../core/costing.js';
import { DEFAULT_WORKER_CONFIG, saveForecast, workerTick, type ForecastInput, type WorkerConfig } from '../jobs/worker.js';
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
] as const;

export type LocalToolName = (typeof LOCAL_TOOL_NAMES)[number];

export interface LocalContext {
  db: Db;
  workspaceRoot: string;
}

export function getWorkflowsConfig(db: Db): WorkerConfig {
  const row = db.raw.prepare('SELECT data FROM workflows_config WHERE id = ?').get('default') as { data: string } | undefined;
  if (!row) return { ...DEFAULT_WORKER_CONFIG };
  return { ...DEFAULT_WORKER_CONFIG, ...(JSON.parse(row.data) as Partial<WorkerConfig>) };
}

export function setWorkflowsConfig(db: Db, patch: Partial<WorkerConfig>): WorkerConfig {
  const cur = getWorkflowsConfig(db);
  const next = { ...cur, ...patch };
  new Intl.DateTimeFormat('en',{timeZone:next.timezone}).format(new Date());
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(next.dailyCutoff))throw new Error('cutoff must be HH:MM');
  if(typeof next.dailyPrepEnabled!=='boolean'||typeof next.costReviewEnabled!=='boolean')throw new Error('explicit schedule switches required');
  db.raw
    .prepare('INSERT INTO workflows_config (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at')
    .run('default', JSON.stringify(next), new Date().toISOString());
  return next;
}

export function localHandlers(ctx: LocalContext): Record<LocalToolName, (args: never) => unknown> {
  const { db, workspaceRoot } = ctx;
  return {
    lookup_recipe: ((args: { id: string }) => getRecipe(db, args.id)) as unknown as (args: never) => unknown,
    list_recipes: (() => listRecipes(db)) as (args: never) => unknown,
    cost_stored_recipe: ((args: { id: string; variantId?: string }) => {
      const recipes = allRecipes(db);
      if (!recipes.has(args.id)) throw new Error(`unknown recipe ${args.id}`);
      return costRecipe({ recipes, purchasesByIngredient: latestPurchaseByIngredient(db), targetRecipeId: args.id, ...(args.variantId ? { variantId: args.variantId } : {}) });
    }) as unknown as (args: never) => unknown,
    preview_import: ((args: { kind: 'recipe_json' | 'purchase_json' | 'recipe_csv' | 'purchase_csv' | 'pasted_text'; payloadText: string }) =>
      previewImport(db, args.kind, args.payloadText)) as unknown as (args: never) => unknown,
    commit_import: ((args: { token: string; confirm: boolean }) => commitImport(db, args.token, args.confirm)) as unknown as (args: never) => unknown,
    create_task: ((args: { title: string }) => createTask(db, args.title)) as unknown as (args: never) => unknown,
    list_tasks: (() => listTasks(db)) as (args: never) => unknown,
    set_task_state: ((args: { id: string; state: 'open' | 'in_progress' | 'awaiting_approval' | 'completed'; blockedReason?: string; cancellation?: string }) =>
      setTaskState(db, args.id, args.state, { ...(args.blockedReason ? { blockedReason: args.blockedReason } : {}), ...(args.cancellation ? { cancellation: args.cancellation } : {}) })) as unknown as (args: never) => unknown,
    request_approval: ((args: { objectType: string; objectId: string }) => requestApproval(db, args.objectType, args.objectId)) as unknown as (args: never) => unknown,
    decide_approval: ((args: { id: string; approve: boolean }) => decideApproval(db, args.id, args.approve)) as unknown as (args: never) => unknown,
    list_approvals: (() => listApprovals(db)) as (args: never) => unknown,
    export_data: ((args: { format: 'json' | 'recipe-cards' | 'cost-sheets'; file: string }) =>
      ({file:args.format==='cost-sheets'?exportCostSheets(db,workspaceRoot,args.file):args.format === 'json' ? exportJson(db, workspaceRoot, args.file) : exportRecipeCards(db, workspaceRoot, args.file)})) as unknown as (args: never) => unknown,
    get_workflows_config: (() => getWorkflowsConfig(db)) as (args: never) => unknown,
    set_workflows_config: ((args: Partial<WorkerConfig>) => setWorkflowsConfig(db, args)) as unknown as (args: never) => unknown,
    set_forecast: ((args:{day:string;forecast:ForecastInput;confirm:boolean})=>{saveForecast(db,args.day,args.forecast,args.confirm,systemClock());return{saved:args.day};}) as unknown as (args:never)=>unknown,
    run_workflows: (()=>workerTick(db,systemClock())) as (args:never)=>unknown,
    list_runs: (()=>db.raw.prepare('SELECT schedule,occurrence,status,input,output,attempts,updated_at FROM runs ORDER BY updated_at DESC LIMIT 100').all()) as (args:never)=>unknown,
  };
}
