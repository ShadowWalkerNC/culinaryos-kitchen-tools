// Check the package actually offered to clients, not a server in the developer checkout.
import assert from'node:assert/strict';import{readFileSync,readdirSync}from'node:fs';import{resolve,join}from'node:path';
import{Client}from'@modelcontextprotocol/sdk/client/index.js';import{StreamableHTTPClientTransport}from'@modelcontextprotocol/sdk/client/streamableHttp.js';
const root=resolve(process.argv[2]??'.'),offline=process.argv.includes('--offline');
const manifest=JSON.parse(readFileSync(join(root,'plugin.json'),'utf8')),mcp=JSON.parse(readFileSync(join(root,'mcp.json'),'utf8'));
assert.equal(manifest.name,'kitchen-tools');const server=mcp.mcpServers['kitchen-tools'];
assert.equal(server.type,'streamable-http');assert.equal(server.url,'https://culinaryos-kitchen-tools-production.up.railway.app/mcp');assert.equal(server.command,undefined);assert.equal(server.args,undefined);
assert.deepEqual(Object.keys(server).sort(),['type','url'],'Use the minimal remote declaration accepted by native Codex; no unsupported extensions');
const names=readdirSync(join(root,'skills'));assert.equal(names.length,118);for(const name of names)assert.ok(readFileSync(join(root,'skills',name,'SKILL.md'),'utf8').startsWith('---'));
assert.equal(manifest.extensions['com.openai'].interface.defaultPrompt.length,3);assert.equal(manifest.extensions['com.openai'].onboardingSkill,'./skills/onboarding/SKILL.md');
if(!offline){const client=new Client({name:'actual-installed-kitchen-plugin-check',version:manifest.version});try{await client.connect(new StreamableHTTPClientTransport(new URL(server.url)));const tools=(await client.listTools()).tools;assert.equal(tools.length,21);assert.ok(!tools.some(t=>t.name==='commit_import'));const call=async(name,args)=>{const out=await client.callTool({name,arguments:args});assert.ok(!out.isError);return JSON.parse(out.content[0].text);};assert.equal((await call('get_started',{})).starters.length,24);assert.equal((await call('convert_quantity',{amount:'32',fromUnit:'oz',toUnit:'lb'})).amount,'2');}finally{await client.close();}}
console.log(JSON.stringify({status:'PASS',version:manifest.version,skills:118,manifestUsesHostedService:true,connectionExecuted:!offline,source:root,limits:'Direct MCP client using the installed/downloaded manifest; not proof of native model execution or ChatGPT website installation.'}));
