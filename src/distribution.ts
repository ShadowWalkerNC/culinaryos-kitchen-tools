import {WORKFLOW_CATALOG} from './workflows/catalog.js';
import {WORKFLOW_TEXT} from './mcp/workflowText.js';
import {VERSION} from './version.js';
export const SOURCE_URL='https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools';
export const SPECIALTY_PLAYBOOKS:Record<string,string>={'home-kitchen':'Home Kitchen','bakery':'Bakery','food-truck':'Food Truck','small-shop':'Small Shop','professional-kitchen':'Professional Kitchen'};
export function clientConfigurations(endpoint:string){return{
 'generic.json':JSON.stringify({mcpServers:{'kitchen-tools':{type:'streamable-http',url:endpoint}}},null,2),
 'cursor.json':JSON.stringify({mcpServers:{'kitchen-tools':{url:endpoint}}},null,2),
 'gemini.json':JSON.stringify({mcpServers:{'kitchen-tools':{httpUrl:endpoint,timeout:15000}}},null,2),
 'claude-code.json':JSON.stringify({mcpServers:{'kitchen-tools':{type:'http',url:endpoint}}},null,2),
 'codex.toml':`[mcp_servers.kitchen-tools]\nurl = "${endpoint}"\n`,
 'local.json':JSON.stringify({mcpServers:{'kitchen-tools':{command:'node',args:['REPLACE_WITH_ABSOLUTE_TOOLKIT_PATH/dist/mcp/stdio.js','--mode=local','--workspace','REPLACE_WITH_PRIVATE_WORKSPACE_PATH']}}},null,2)
};}
export function cursorInstallLink(endpoint:string):string{return 'cursor://anysphere.cursor-deeplink/mcp/install?name=kitchen-tools&config='+encodeURIComponent(Buffer.from(JSON.stringify({'kitchen-tools':{url:endpoint}})).toString('base64'));}
export function playbook(zone?:string):string{return`# Open Kitchen Toolkit ${VERSION}\n\nOriginal MIT workflow playbook. Manual use supplies guidance only: no live calculation, saving or scheduling connection is implied. Your AI account and policies apply. Unknown inputs stay unknown.\n\n`+WORKFLOW_CATALOG.filter(w=>!zone||w.zone===zone).map(w=>`## ${w.title}\n\n${WORKFLOW_TEXT[w.id]??''}`).join('\n\n');}
