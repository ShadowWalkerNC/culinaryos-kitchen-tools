import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {clientConfigurations,playbook,SOURCE_URL,cursorInstallLink} from '../dist/distribution.js';
const root=resolve(import.meta.dirname,'..');const endpoint='https://culinaryos-kitchen-tools-production.up.railway.app/mcp';
mkdirSync(join(root,'clients'),{recursive:true});for(const[name,data]of Object.entries(clientConfigurations(endpoint)))writeFileSync(join(root,'clients',name),data.trimEnd()+'\n');
writeFileSync(join(root,'clients','cursor-install.txt'),cursorInstallLink(endpoint)+'\n');
writeFileSync(join(root,'clients','README.md'),`# Connect Open Kitchen Toolkit\n\nPublic endpoint: ${endpoint}\n\nNo extra toolkit account. AI-client requirements apply. Merge configuration fragments rather than replacing existing settings. local.json deliberately contains placeholders; select your own absolute package and private-workspace paths. Do not publish a local private connection.\n\nGemini CLI configuration does not imply Gemini consumer website support. Playbooks supply manual guidance only. Full client installation evidence is in docs/COMPATIBILITY.md.\n\nSource: ${SOURCE_URL}\n`);
mkdirSync(join(root,'docs','playbooks'),{recursive:true});writeFileSync(join(root,'docs','playbooks','Open-Kitchen-Playbook.md'),playbook());
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));console.log(JSON.stringify({version:pkg.version,clientConfigurations:6,playbook:'docs/playbooks/Open-Kitchen-Playbook.md'}));
