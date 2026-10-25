// MCP server factory with separate public vs local registrations.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listCapabilitiesSchema, getWorkflowSchema, validateKitchenDataSchema, scaleRecipeSchema, convertQuantitySchema, costRecipeSchema, comparePurchaseCostsSchema, buildPrepPlanSchema, buildOrderProposalSchema, lookupRecipeSchema, listRecipesSchema, previewImportSchema, commitImportSchema, createTaskSchema, setTaskStateSchema, requestApprovalSchema, decideApprovalSchema, exportSchema, workflowsConfigSchema, forecastSchema, } from './schemas.js';
import { publicHandlers } from './publicTools.js';
import { localHandlers } from './localTools.js';
import { z } from 'zod';
function toShape(s) {
    return s.shape;
}
function textResult(value) {
    return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
export function createMcpServer(mode, ctx) {
    const server = new McpServer({ name: mode === 'public' ? 'kitchen-tools-public' : 'kitchen-tools-local', version: '0.1.1' });
    server.tool('list_capabilities', 'List stateless public capabilities', toShape(listCapabilitiesSchema), () => textResult(publicHandlers.list_capabilities({})));
    server.tool('get_workflow', 'Get original workflow guidance', toShape(getWorkflowSchema), (args) => textResult(publicHandlers.get_workflow(args)));
    server.tool('validate_kitchen_data', 'Validate recipes and purchases', toShape(validateKitchenDataSchema), (args) => textResult(publicHandlers.validate_kitchen_data(args)));
    server.tool('scale_recipe', 'Scale a recipe to a target yield', toShape(scaleRecipeSchema), (args) => textResult(publicHandlers.scale_recipe(args)));
    server.tool('convert_quantity', 'Convert quantity with explicit factor', toShape(convertQuantitySchema), (args) => textResult(publicHandlers.convert_quantity(args)));
    server.tool('cost_recipe', 'Cost a recipe from explicit inputs', toShape(costRecipeSchema), (args) => textResult(publicHandlers.cost_recipe(args)));
    server.tool('compare_purchase_costs', 'Compare purchase options in same unit', toShape(comparePurchaseCostsSchema), (args) => textResult(publicHandlers.compare_purchase_costs(args)));
    server.tool('build_prep_plan', 'Build deterministic prep plan', toShape(buildPrepPlanSchema), (args) => textResult(publicHandlers.build_prep_plan(args)));
    server.tool('build_order_proposal', 'Build deterministic order proposal', toShape(buildOrderProposalSchema), (args) => textResult(publicHandlers.build_order_proposal(args)));
    if (mode === 'local') {
        if (!ctx)
            throw new Error('local mode requires context');
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