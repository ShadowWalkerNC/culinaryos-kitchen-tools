// MCP server factory with separate public vs local registrations.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listCapabilitiesSchema, getWorkflowSchema, validateKitchenDataSchema, scaleRecipeSchema, convertQuantitySchema, costRecipeSchema, comparePurchaseCostsSchema, buildPrepPlanSchema, buildOrderProposalSchema, lookupRecipeSchema, listRecipesSchema, previewImportSchema, commitImportSchema, createTaskSchema, setTaskStateSchema, requestApprovalSchema, decideApprovalSchema, exportSchema, workflowsConfigSchema, forecastSchema, } from './schemas.js';
import { publicHandlers } from './publicTools.js';
import { localHandlers } from './localTools.js';
import { z } from 'zod';
import { VERSION } from '../version.js';
import { listWorkflowsSchema } from '../workflows/discovery.js';
import { usableYieldSchema, stockSchema, budgetSchema, capacitySchema } from '../core/operations.js';
import { connectedFlowSchema, attachFlowDocumentSchema, approveFlowSchema, runConnectedFlow, listConnectedFlows, attachFlowDocument, approveFlow } from '../workflows/connected.js';
import { getRestaurantProfile, setRestaurantProfile, restaurantProfileSchema } from '../workflows/profile.js';
import { workerStatus } from '../jobs/workspaceWorker.js';
import { getStartedSchema } from '../workflows/getStarted.js';
import { standardizeRecipeSchema } from '../core/standardize.js';
// These tools only read their supplied arguments/catalog; no filesystem, DB, network or external writes.
const PUBLIC_READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
function toShape(s) {
    return s.shape;
}
function textResult(value) {
    return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
export function createMcpServer(mode, ctx) {
    const server = new McpServer({ name: mode === 'public' ? 'kitchen-tools-public' : 'kitchen-tools-local', version: VERSION });
    server.tool('get_started', 'Show kitchen and restaurant starter prompts and a step-by-step guide. No special keywords required; no tasks executed.', getStartedSchema.shape, PUBLIC_READ_ONLY, args => textResult(publicHandlers.get_started(args)));
    server.tool('standardize_recipe_units', 'Convert recipe lines into explicitly chosen units. Preserve originals and block ambiguous standards or missing ingredient density.', standardizeRecipeSchema.shape, PUBLIC_READ_ONLY, args => textResult(publicHandlers.standardize_recipe_units(args)));
    for (const [name, schema] of Object.entries({ list_workflows: listWorkflowsSchema, calculate_usable_yield: usableYieldSchema, reconcile_stock: stockSchema, calculate_event_budget: budgetSchema, validate_prep_capacity: capacitySchema })) {
        server.tool(name, 'Use this for original workflow discovery or deterministic kitchen operations; missing inputs stay unknown', schema.shape, PUBLIC_READ_ONLY, (args) => textResult(publicHandlers[name](args)));
    }
    server.tool('list_capabilities', 'List stateless public capabilities', toShape(listCapabilitiesSchema), PUBLIC_READ_ONLY, () => textResult(publicHandlers.list_capabilities({})));
    server.tool('get_workflow', 'Get original workflow guidance', toShape(getWorkflowSchema), PUBLIC_READ_ONLY, (args) => textResult(publicHandlers.get_workflow({ ...args, ...(mode === 'local' && ctx ? { profile: { ...getRestaurantProfile(ctx.db), ...args.profile } } : {}) })));
    server.tool('validate_kitchen_data', 'Validate recipes and purchases', toShape(validateKitchenDataSchema), PUBLIC_READ_ONLY, (args) => textResult(publicHandlers.validate_kitchen_data(args)));
    server.tool('scale_recipe', 'Scale a recipe to a target yield', toShape(scaleRecipeSchema), PUBLIC_READ_ONLY, (args) => textResult(publicHandlers.scale_recipe(args)));
    server.tool('convert_quantity', 'Convert quantity with explicit factor', toShape(convertQuantitySchema), PUBLIC_READ_ONLY, (args) => textResult(publicHandlers.convert_quantity(args)));
    server.tool('cost_recipe', 'Cost a recipe from explicit inputs', toShape(costRecipeSchema), PUBLIC_READ_ONLY, (args) => textResult(publicHandlers.cost_recipe(args)));
    server.tool('compare_purchase_costs', 'Compare purchase options in same unit', toShape(comparePurchaseCostsSchema), PUBLIC_READ_ONLY, (args) => textResult(publicHandlers.compare_purchase_costs(args)));
    server.tool('build_prep_plan', 'Build deterministic prep plan', toShape(buildPrepPlanSchema), PUBLIC_READ_ONLY, (args) => textResult(publicHandlers.build_prep_plan(args)));
    server.tool('build_order_proposal', 'Build deterministic order proposal', toShape(buildOrderProposalSchema), PUBLIC_READ_ONLY, (args) => textResult(publicHandlers.build_order_proposal(args)));
    if (mode === 'local') {
        if (!ctx)
            throw new Error('local mode requires context');
        const database = ctx.db;
        server.tool('run_connected_flow', 'Create a local version-bound draft and review tasks; no external actions', { request: connectedFlowSchema }, args => textResult(runConnectedFlow(database, args.request)));
        server.tool('list_connected_flows', 'List local runs, blockers, drafts and stale source versions', {}, () => textResult(listConnectedFlows(database)));
        server.tool('attach_flow_document', 'Attach an AI/client-written draft to exact source versions', attachFlowDocumentSchema.shape, args => textResult(attachFlowDocument(database, args)));
        server.tool('approve_flow', 'Confirm human review of the exact flow revision', approveFlowSchema.shape, args => textResult(approveFlow(database, args)));
        server.tool('get_restaurant_profile', 'Get explicitly supplied kitchen settings', {}, () => textResult(getRestaurantProfile(database)));
        server.tool('set_restaurant_profile', 'Save explicit kitchen settings without guessing location or targets', restaurantProfileSchema.shape, args => textResult(setRestaurantProfile(database, args)));
        server.tool('worker_status', 'Check actual local schedule heartbeat and errors', {}, () => textResult(workerStatus(database)));
        const h = localHandlers(ctx);
        server.tool('lookup_recipe', 'Look up a stored recipe', toShape(lookupRecipeSchema), (args) => textResult(h.lookup_recipe(args)));
        server.tool('list_recipes', 'List stored recipes', toShape(listRecipesSchema), () => textResult(h.list_recipes({})));
        server.tool('cost_stored_recipe', 'Cost a stored recipe', { id: z.string(), variantId: z.string().optional() }, (args) => textResult(h.cost_stored_recipe(args)));
        server.tool('preview_import', 'Preview an import', toShape(previewImportSchema), (args) => textResult(h.preview_import(args)));
        server.tool('commit_import', 'Atomically commit a preview', toShape(commitImportSchema), (args) => textResult(h.commit_import(args)));
        server.tool('create_task', 'Create a task', toShape(createTaskSchema), (args) => textResult(h.create_task(args)));
        server.tool('list_tasks', 'List tasks', {}, () => textResult(h.list_tasks({})));
        server.tool('set_task_state', 'Set task state', toShape(setTaskStateSchema), (args) => textResult(h.set_task_state(args)));
        server.tool('request_approval', 'Request version-bound approval', toShape(requestApprovalSchema), (args) => textResult(h.request_approval(args)));
        server.tool('decide_approval', 'Approve or reject', toShape(decideApprovalSchema), (args) => textResult(h.decide_approval(args)));
        server.tool('list_approvals', 'List approvals', {}, () => textResult(h.list_approvals({})));
        server.tool('export_data', 'Export inside workspace', toShape(exportSchema), (args) => textResult(h.export_data(args)));
        server.tool('get_workflows_config', 'Get worker config', {}, () => textResult(h.get_workflows_config({})));
        server.tool('set_workflows_config', 'Set worker config', toShape(workflowsConfigSchema), (args) => textResult(h.set_workflows_config(args)));
        server.tool('set_forecast', 'Save confirmed demand and stock for a service date', toShape(forecastSchema), (args) => textResult(h.set_forecast(args)));
        server.tool('run_workflows', 'Run one configured scheduler tick', {}, () => textResult(h.run_workflows({})));
        server.tool('list_runs', 'Read recent workflow execution history', {}, () => textResult(h.list_runs({})));
    }
    return server;
}
//# sourceMappingURL=server.js.map