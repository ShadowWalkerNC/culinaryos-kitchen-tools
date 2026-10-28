import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {resolve,sep} from 'node:path';

it('ships a contained square brand icon and synchronized presentation in both plugin formats',()=>{
 const root=JSON.parse(readFileSync('plugin.json','utf8'));
 const overlay=JSON.parse(readFileSync('.codex-plugin/plugin.json','utf8'));
 assert.equal(overlay.name,root.name);
 assert.equal(overlay.version,root.version);
 assert.deepEqual(overlay.interface,root.extensions['com.openai'].interface);
 for(const key of ['logo','composerIcon']){
  const path=root.extensions['com.openai'].interface[key];
  assert.equal(path,'./assets/culinaryos-icon.svg');
  assert.ok(resolve(path).startsWith(resolve('assets')+sep));
  assert.ok(statSync(path).size<5*1024*1024);
  const svg=readFileSync(path,'utf8');
  assert.match(svg,/<svg[^>]*viewBox="0 0 128 128"/);
  assert.match(svg,/width="128" height="128"/);
  assert.doesNotMatch(svg,/<script|<image|<foreignObject|(?:href|src)\s*=/i);
 }
});
