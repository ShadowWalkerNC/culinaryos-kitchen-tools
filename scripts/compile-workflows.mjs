import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const instructions=Object.fromEntries(readdirSync(join(root,'skills')).sort().map(name=>[name,readFileSync(join(root,'skills',name,'SKILL.md'),'utf8')]));
writeFileSync(join(root,'src/mcp/workflowText.ts'),'// Generated from the original MIT skills by scripts/compile-workflows.mjs.\nexport const WORKFLOW_TEXT:Record<string,string> = '+JSON.stringify(instructions,null,2)+';\n');
