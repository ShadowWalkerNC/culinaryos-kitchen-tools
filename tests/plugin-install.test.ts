import test from 'node:test';import assert from 'node:assert/strict';
import{readFileSync,existsSync}from'node:fs';import{resolve}from'node:path';
const root=resolve(import.meta.dirname,'..');
test('public marketplace resolves the actual root plugin and preserves its identifier',()=>{
 const market=JSON.parse(readFileSync(resolve(root,'.agents/plugins/marketplace.json'),'utf8'));
 assert.equal(market.name,'open-kitchen-toolkit');assert.equal(market.plugins.length,1);
 const entry=market.plugins[0];assert.equal(entry.name,'kitchen-tools');assert.equal(entry.source.source,'local');
 const pluginRoot=resolve(root,entry.source.path);assert.equal(pluginRoot,root);
 assert.equal(JSON.parse(readFileSync(resolve(pluginRoot,'plugin.json'),'utf8')).name,entry.name);
 assert.ok(existsSync(resolve(pluginRoot,'skills/onboarding/SKILL.md')));
});
test('public install connects remotely and never references an absent local server',()=>{
 const mcp=JSON.parse(readFileSync(resolve(root,'mcp.json'),'utf8'));const server=mcp.mcpServers['kitchen-tools'];
 assert.equal(server.type,'streamable-http');assert.equal(server.url,'https://culinaryos-kitchen-tools-production.up.railway.app/mcp');
 assert.equal(server.command,undefined);assert.equal(server.args,undefined);assert.deepEqual(Object.keys(server).sort(),['type','url']);
});
test('care-paperwork routing checks real tools and retains separate approval boundaries',()=>{
 const text=readFileSync(resolve(root,'skills/onboarding/SKILL.md'),'utf8');
 assert.match(text,/sylvia-ross-menu-processor/);assert.match(text,/menu_readiness/);assert.match(text,/not installed/);assert.match(text,/silent cross-plugin data sharing/);
});
