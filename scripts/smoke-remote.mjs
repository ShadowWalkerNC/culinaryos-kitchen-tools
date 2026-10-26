import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const base=process.argv[2]??'https://culinaryos-kitchen-tools-production.up.railway.app';
const read=async path=>{const r=await fetch(base+path);assert.equal(r.status,200);return r.json();};
assert.equal((await read('/health')).ok,true);
const version=await read('/version');assert.equal(version.mode,'public-stateless');assert.equal(version.version,'0.2.0');
assert.equal((await read('/connection.json')).mcpServers['kitchen-tools'].url,base+'/mcp');
assert.equal((await fetch(base)).status,200);
const client=new Client({name:'kitchen-tools-release-check',version:'0.2.0'});
try{
 await client.connect(new StreamableHTTPClientTransport(new URL(base+'/mcp')));
 const names=(await client.listTools()).tools.map(t=>t.name);assert.equal(names.length,14);assert.ok(!names.includes('commit_import'));
 const call=async(name,args)=>{const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,JSON.stringify(r));return JSON.parse(r.content[0].text);};
 assert.equal((await call('convert_quantity',{amount:'32',fromUnit:'oz',toUnit:'lb'})).amount,'2');
 assert.ok((await call('get_workflow',{name:'recipe-costing'})).instructions.includes('## Required inputs'));
 assert.equal((await call('list_workflows',{limit:100})).total,73);
 const provenance={source:'synthetic release test',receivedAt:'2026-10-25T00:00:00Z',verified:true};
 const recipe={id:'synthetic',name:'Synthetic test',currency:'USD',yieldQty:{amount:'4',unit:'each'},ingredients:[{ingredientId:'flour',qty:{amount:'500',unit:'g'}}],subrecipes:[],version:1,provenance};
 const purchase={id:'test-flour',ingredientId:'flour',currency:'USD',costCents:200,usableQty:{amount:'1',unit:'kg'},effectiveDate:'2026-10-25',version:1,provenance};
 const complete=await call('cost_recipe',{recipes:[recipe],purchasesByIngredient:[purchase],targetRecipeId:'synthetic'});assert.equal(complete.knownCents,100);assert.equal(complete.perUnitCents,25);
 const partial=await call('cost_recipe',{recipes:[recipe],purchasesByIngredient:[],targetRecipeId:'synthetic'});assert.ok(partial.unknown.length>0);assert.equal(partial.perUnitCents,undefined);
 const denied=await client.callTool({name:'commit_import',arguments:{token:'synthetic',confirm:true}}).catch(()=>({isError:true}));assert.equal(denied.isError,true);
 console.log(JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),base,version,toolCount:names.length,checks:['anonymous HTTPS health/version/setup','MCP initialize/discovery','original workflow text','conversion','complete and partial costing','private-tool rejection'],inputs:'synthetic only'},null,2));
}finally{await client.close();}
