import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { getRestaurantProfile } from './profile.js';
import { workerStatus } from '../jobs/workspaceWorker.js';
import { VERSION } from '../version.js';
export const PUBLIC_ENDPOINT = 'https://culinaryos-kitchen-tools-production.up.railway.app/mcp';
export function setupStatus(db) {
    const profile = getRestaurantProfile(db);
    const count = (table) => Number(db.raw.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n);
    return { version: VERSION, nodeVersion: process.versions.node, schemaVersion: db.raw.prepare('PRAGMA user_version').get().user_version, mode: 'private-local', profile, missingSettings: ['country', 'region', 'currency', 'unitSystem', 'timezone', 'foodCostTargetPercent'].filter(k => !(k in profile)), recipes: count('recipes'), purchases: count('purchases'), connectedRuns: count('connected_flows'), worker: workerStatus(db), publicEndpoint: PUBLIC_ENDPOINT,
        clientStatus: 'Native client execution remains unverified. A server check does not test your AI account, installation or permissions.' };
}
// Fixed endpoint and synthetic inputs only: this is not an arbitrary URL fetch proxy.
export async function checkHostedConnection() {
    const client = new Client({ name: 'open-kitchen-setup-check', version: VERSION });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const checks = [];
    try {
        await client.connect(new StreamableHTTPClientTransport(new URL(PUBLIC_ENDPOINT), { requestInit: { signal: controller.signal } }));
        const tools = (await client.listTools()).tools;
        if (tools.some(t => ['commit_import', 'run_connected_flow', 'approve_flow'].includes(t.name)))
            throw new Error('Public connection exposed a private tool');
        checks.push('Public tools discovered; private operations absent');
        const call = async (name, args) => { const r = await client.callTool({ name, arguments: args }); if (r.isError)
            throw new Error(name + ' returned a tool error'); const text = Array.isArray(r.content) ? r.content.find((c) => typeof c === 'object' && c !== null && 'type' in c && c.type === 'text') : undefined; if (!text || typeof text.text !== 'string')
            throw new Error(name + ' returned no text'); return JSON.parse(text.text); };
        const guide = await call('get_workflow', { name: 'recipe-costing' });
        if (typeof guide.instructions !== 'string')
            throw new Error('Recipe guide unavailable');
        checks.push('Recipe costing workflow retrieved');
        const conversion = await call('convert_quantity', { amount: '32', fromUnit: 'oz', toUnit: 'lb' });
        if (conversion.amount !== '2')
            throw new Error('Known conversion failed');
        checks.push('32 oz converted to 2 lb');
        const provenance = { source: 'synthetic setup check', receivedAt: '2026-10-26T00:00:00Z', verified: true };
        const cost = await call('cost_recipe', { targetRecipeId: 'setup-demo', recipes: [{ id: 'setup-demo', name: 'Synthetic setup recipe', currency: 'USD', version: 1, provenance, yieldQty: { amount: '4', unit: 'each' }, ingredients: [{ ingredientId: 'flour', qty: { amount: '500', unit: 'g' } }], subrecipes: [] }], purchasesByIngredient: [{ id: 'setup-buy', ingredientId: 'flour', currency: 'USD', version: 1, provenance, costCents: 200, usableQty: { amount: '1', unit: 'kg' }, effectiveDate: '2026-10-26' }] });
        if (cost.knownCents !== 100 || cost.perUnitCents !== 25)
            throw new Error('Known recipe cost failed');
        checks.push('Synthetic recipe costs USD 1.00 per batch and USD 0.25 per portion');
        return { status: 'pass', checkedAt: new Date().toISOString(), checks, scope: 'Public MCP service only. Your native AI client installation and execution remain unverified.', inputs: 'Synthetic only; no workspace records sent' };
    }
    catch (e) {
        return { status: 'unavailable', checkedAt: new Date().toISOString(), checks, error: e.message, scope: 'No native-client acceptance implied; check internet access and retry. Host permissions must be handled in your chosen AI.' };
    }
    finally {
        clearTimeout(timer);
        await client.close().catch(() => { });
    }
}
//# sourceMappingURL=setup.js.map