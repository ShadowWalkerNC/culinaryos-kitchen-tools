// F08-F09 explicit Zod schemas for every MCP tool. No URL fetch / paths / exec tools.
import { z } from 'zod';
export const qtySchema = z.object({ amount: z.string().max(32), unit: z.string().min(1).max(32) });
const provenance = z.object({ source: z.string().max(500), receivedAt: z.string().max(40), verified: z.boolean() }).default({ source: 'supplied data', receivedAt: 'unrecorded', verified: false });
export const recipeRecordSchema = z.object({ id: z.string().min(1).max(200), name: z.string().min(1).max(200), currency: z.string().regex(/^[A-Z]{3}$/), yieldQty: qtySchema, ingredients: z.array(z.object({ ingredientId: z.string().min(1).max(200), qty: qtySchema })).max(200), subrecipes: z.array(z.object({ recipeId: z.string().min(1).max(200), qty: qtySchema })).max(100).default([]), version: z.number().int().positive().default(1), provenance, packaging: z.array(z.object({ label: z.string().max(200), costCents: z.number().int().nonnegative().safe() })).max(100).optional(), variants: z.array(z.object({ id: z.string().max(200), netPriceCents: z.number().int().nonnegative().safe().optional(), confirmed: z.boolean() })).max(100).optional() });
export const purchaseRecordSchema = z.object({ id: z.string().min(1).max(200), ingredientId: z.string().min(1).max(200), currency: z.string().regex(/^[A-Z]{3}$/), costCents: z.number().int().nonnegative().safe(), usableQty: qtySchema, effectiveDate: z.string().max(10), version: z.number().int().positive().default(1), provenance, packBasis: z.string().max(500).optional(), densityGPerMl: z.string().max(32).optional() });
export const listCapabilitiesSchema = z.object({}).strict();
export const getWorkflowSchema = z.object({ name: z.string().min(1) }).strict();
export const validateKitchenDataSchema = z.object({
    recipes: z.array(recipeRecordSchema).max(500).default([]),
    purchases: z.array(purchaseRecordSchema).max(2000).default([]),
}).strict();
export const scaleRecipeSchema = z.object({
    recipe: z.object({
        id: z.string(),
        name: z.string(),
        currency: z.string(),
        yieldQty: qtySchema,
        ingredients: z.array(z.object({ ingredientId: z.string(), qty: qtySchema })),
        subrecipes: z.array(z.object({ recipeId: z.string(), qty: qtySchema })),
    }).passthrough(),
    targetYieldAmount: z.string(),
}).strict();
export const convertQuantitySchema = z.object({
    amount: z.string(),
    fromUnit: z.string(),
    toUnit: z.string(),
    factor: z.string().optional(),
    factorBasis: z.string().optional(),
}).strict();
export const costRecipeSchema = z.object({
    recipes: z.array(recipeRecordSchema).max(500),
    purchasesByIngredient: z.array(purchaseRecordSchema).max(2000),
    targetRecipeId: z.string(),
    variantId: z.string().optional(),
}).strict();
export const comparePurchaseCostsSchema = z.object({
    options: z.array(z.object({
        currency: z.string().regex(/^[A-Z]{3}$/),
        id: z.string(),
        costCents: z.number(),
        qtyAmount: z.string(),
        qtyUnit: z.string(),
        effectiveDate: z.string(),
    })).min(1),
}).strict();
export const buildPrepPlanSchema = z.object({
    demand: z.array(z.object({ recipeId: z.string(), servings: z.string(), servingUnit: z.string(), yieldPerBatch: z.string() })),
    stock: z.array(z.object({ recipeId: z.string(), onHand: z.string(), unit: z.string() })).default([]),
}).strict();
export const buildOrderProposalSchema = z.object({
    lines: z.array(z.object({
        ingredientId: z.string(),
        par: z.string(),
        onHand: z.string(),
        onOrder: z.string(),
        unit: z.string(),
        packSize: z.string().optional(),
    })).min(1),
}).strict();
// Local-only schemas
export const lookupRecipeSchema = z.object({ id: z.string().min(1) }).strict();
export const listRecipesSchema = z.object({}).strict();
export const previewImportSchema = z.object({
    kind: z.enum(['recipe_json', 'purchase_json', 'recipe_csv', 'purchase_csv', 'pasted_text']),
    payloadText: z.string().max(1_000_000),
}).strict();
export const commitImportSchema = z.object({ token: z.string().min(1), confirm: z.boolean() }).strict();
export const createTaskSchema = z.object({ title: z.string().min(1) }).strict();
export const setTaskStateSchema = z.object({
    id: z.string().min(1),
    state: z.enum(['open', 'in_progress', 'awaiting_approval', 'completed']),
    blockedReason: z.string().optional(),
    cancellation: z.string().optional(),
}).strict();
export const requestApprovalSchema = z.object({ objectType: z.enum(['recipe', 'purchase']), objectId: z.string().min(1) }).strict();
export const decideApprovalSchema = z.object({ id: z.string().min(1), approve: z.boolean() }).strict();
export const exportSchema = z.object({ format: z.enum(['json', 'recipe-cards', 'cost-sheets']), file: z.string().min(1).max(200) }).strict();
export const workflowsConfigSchema = z.object({
    timezone: z.string().optional(),
    dailyCutoff: z.string().optional(),
    dailyPrepEnabled: z.boolean().optional(),
    costReviewEnabled: z.boolean().optional(),
}).strict();
export const forecastSchema = z.object({ day: z.string().max(10), forecast: z.object({ demands: z.array(z.object({ recipeId: z.string().max(200), servings: z.string().max(32), servingUnit: z.string().max(32), yieldPerBatch: z.string().max(32) })).max(500), stock: z.array(z.object({ recipeId: z.string().max(200), onHand: z.string().max(32), unit: z.string().max(32) })).max(500) }), confirm: z.boolean() });
//# sourceMappingURL=schemas.js.map