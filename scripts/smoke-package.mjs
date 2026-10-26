import assert from 'node:assert/strict';
import {mkdtempSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const entry=resolve(process.argv[2]??'dist/mcp/stdio.js');const cwd=mkdtempSync(join(tmpdir(),'kitchen-public-smoke-'));
const transport=new StdioClientTransport({command:process.execPath,args:[entry,'--mode=public'],cwd,stderr:'pipe'});
const client=new Client({name:'independent-package-smoke',version:'1.0.0'});
try{await client.connect(transport);const tools=await client.listTools();assert.equal(tools.tools.length,14);assert.ok(!tools.tools.some(t=>t.name==='commit_import'));
 const convert=await client.callTool({name:'convert_quantity',arguments:{amount:'32',fromUnit:'oz',toUnit:'lb'}});assert.equal(JSON.parse(convert.content[0].text).amount,'2');
 const workflow=await client.callTool({name:'get_workflow',arguments:{name:'recipe-costing'}});assert.ok(JSON.parse(workflow.content[0].text).instructions.includes('## Required inputs'));
 assert.deepEqual(readdirSync(cwd),[]);console.log('PASS: compiled public package has 14 tools, original instructions, correct conversion and no workspace/database creation.');
}finally{await client.close();}
