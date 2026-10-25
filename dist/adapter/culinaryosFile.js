// F13 CulinaryOS adapter: authorized FILE exchange only. No network, no credentials.
import { readFileSync, statSync } from 'node:fs';
import { z } from 'zod';
import { assertInside } from '../data/exports.js';
import { recipeRecordSchema, purchaseRecordSchema } from '../mcp/schemas.js';
import { validateRecipe, validatePurchase } from '../core/validation.js';
const exportSchema = z.object({
    tenantId: z.string().min(1),
    dataVersion: z.literal('v1'),
    recipes: z.array(z.unknown()).max(500).default([]),
    purchases: z.array(z.unknown()).max(2000).default([]),
});
/**
 * Read a JSON export file previously copied by the operator into the workspace.
 * Requires explicit workspace/tenant binding + confirmation. Rejects traversal and cross-tenant files.
 */
export function readExportFile(workspaceRoot, tenantId, fileName, confirm) {
    if (!confirm)
        throw new Error('adapter requires explicit confirm=true');
    if (!tenantId || tenantId === 'default')
        throw new Error('explicit tenant binding required (no default tenant)');
    const abs = assertInside(workspaceRoot, fileName);
    if (statSync(abs).size > 1_000_000)
        throw new Error('export file exceeds 1MB');
    const raw = readFileSync(abs, 'utf8');
    if (raw.length > 1_000_000)
        throw new Error('export file exceeds 1MB');
    const parsed = exportSchema.parse(JSON.parse(raw));
    if (parsed.tenantId !== tenantId)
        throw new Error(`cross-tenant rejected: file=${parsed.tenantId} binding=${tenantId}`);
    for (const record of [...parsed.recipes, ...parsed.purchases]) {
        const scope = record;
        if ((scope.tenantId !== undefined && scope.tenantId !== tenantId) || (scope.tenant_id !== undefined && scope.tenant_id !== tenantId))
            throw new Error('cross-tenant record rejected');
    }
    const recipes = parsed.recipes.map(raw => { const { packaging, variants, ...r } = recipeRecordSchema.parse(raw); return { ...r, ...(packaging === undefined ? {} : { packaging }), ...(variants === undefined ? {} : { variants: variants.map(({ netPriceCents, ...v }) => ({ ...v, ...(netPriceCents === undefined ? {} : { netPriceCents }) })) }) }; });
    const purchases = parsed.purchases.map(raw => { const { packBasis, densityGPerMl, ...p } = purchaseRecordSchema.parse(raw); return { ...p, ...(packBasis === undefined ? {} : { packBasis }), ...(densityGPerMl === undefined ? {} : { densityGPerMl }) }; });
    if (new Set(recipes.map(r => r.id)).size !== recipes.length || new Set(purchases.map(p => p.id)).size !== purchases.length)
        throw new Error('duplicate export record');
    for (const r of recipes) {
        const issues = validateRecipe(r);
        if (issues.length)
            throw new Error('invalid exported recipe');
    }
    for (const p of purchases) {
        const issues = validatePurchase(p);
        if (issues.length)
            throw new Error('invalid exported purchase');
    }
    return { tenantId, recipes, purchases };
}
//# sourceMappingURL=culinaryosFile.js.map