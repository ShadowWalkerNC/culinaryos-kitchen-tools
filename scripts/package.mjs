// Reproducible local package: copies only shippable files into package-out/.
import { cpSync, mkdirSync, rmSync, existsSync, lstatSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'package-out');
if(!out.startsWith(resolve(root)+sep)||out===resolve(root))throw new Error('unsafe package output');
if(existsSync(out)&&(lstatSync(out).isSymbolicLink()||!existsSync(join(out,'.package-generated'))))throw new Error('refusing to replace an unrecognized package output');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const include = ['dist', 'src', 'tests', 'tsconfig.json', 'skills', 'fixtures', 'docs', 'clients', 'launchers', 'ui', 'scripts', 'plugin.json', 'mcp.json', 'package.json', 'package-lock.json', 'LICENSE', 'README.md', 'CONTRIBUTING.md', 'Dockerfile', 'railway.toml','.dockerignore','.gitignore','.github','.agents'];
for (const f of include) {
  const src = join(root, f);
  if (existsSync(src)) cpSync(src, join(out, f), { recursive: true });
}
writeFileSync(join(out,'.package-generated'),'kitchen-tools package output\n');
const manifest=JSON.parse(readFileSync(join(out,'plugin.json'),'utf8'));
if(manifest.$schema!=='https://agent-plugins.org/schemas/1.0.0/plugin.schema.json'||manifest.version!==JSON.parse(readFileSync(join(out,'package.json'),'utf8')).version)throw new Error('plugin metadata mismatch');
const skills=readdirSync(join(out,'skills'));
if(skills.length!==105)throw new Error('expected 105 original skills');
for(const name of skills){const text=readFileSync(join(out,'skills',name,'SKILL.md'),'utf8');if(!text.startsWith('---\n')&&!text.startsWith('---\r\n'))throw new Error('skill frontmatter missing');if(!/^description:\s*\S.+$/m.test(text))throw new Error('skill description missing: '+name);}
// Explicitly excluded: *.sqlite, workspace/, .session, node_modules, package-out itself, Axomai references, Cheezies data, credentials.
console.log(JSON.stringify({ packaged: out, note: 'run npm install inside package-out for portable node dependencies' }));
