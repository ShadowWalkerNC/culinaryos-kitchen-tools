import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS,getStarted} from '../src/workflows/getStarted.js';
import {WORKFLOW_CATALOG} from '../src/workflows/catalog.js';
import {standardizeRecipeUnits} from '../src/core/standardize.js';
import {convertQuantity} from '../src/core/conversion.js';
import {publicPage} from '../src/server/publicPage.js';

describe('Guided kitchen entry points',()=>{
 it('routes every starter to existing canonical workflows',()=>{
  const ids=new Set(WORKFLOW_CATALOG.map(w=>w.id));
  assert.equal(STARTERS.length,24);assert.equal(new Set(STARTERS.map(s=>s.id)).size,24);
  for(const starter of STARTERS){assert.equal(starter.steps.length,4);for(const id of starter.workflowIds)assert.ok(ids.has(id),id);}
 });
 it('advances reported steps without persisting or asserting execution',()=>{
  const guide=getStarted({starterId:'menu-cost',completedSteps:[1,1,2]});
  assert.equal(guide.progress?.nextStep,3);assert.equal(guide.progress?.persisted,false);
  assert.equal(getStarted({starterId:'menu-cost',completedSteps:[1,2,3,4]}).progress?.status,'reported_complete');
  assert.equal(getStarted({starterId:'menu-cost'}).progress?.nextStep,1);
  assert.throws(()=>getStarted({starterId:'invented'}),/UNKNOWN_STARTER/);
  assert.throws(()=>getStarted({completedSteps:[1]}),/Choose a starter/);
 });
 it('provides general AI fallback and care-specific review boundaries',()=>{
  const guide=getStarted();assert.match(guide.fallback,/regular AI/);assert.match(guide.fallback,/not installed/);
  assert.match(STARTERS.find(s=>s.id==='care-menu')!.prompt,/Do not infer/);
  assert.match(guide.boundaries.join(' '),/resident records/);
 });
 it('exposes readable prompt choices and reviewed contribution links on the public page',()=>{
  const html=publicPage('localhost:3200');for(const s of STARTERS)assert.ok(html.includes('prompt-'+s.id));
  assert.match(html,/starter-prompts.js/);assert.match(html,/skill-proposal.yml/);assert.match(html,/workflow-problem.yml/);
 });
});
describe('Recipe unit standardization with independent numerical expectations',()=>{
 it('distinguishes explicit US, metric and imperial volumes',()=>{
  assert.equal(convertQuantity({amount:'1',fromUnit:'us pint',toUnit:'ml'}).amount,'473.176473');
  assert.equal(convertQuantity({amount:'1',fromUnit:'imperial pint',toUnit:'ml'}).amount,'568.26125');
  assert.equal(convertQuantity({amount:'1',fromUnit:'metric cup',toUnit:'ml'}).amount,'250');
  assert.equal(convertQuantity({amount:'20',fromUnit:'imperial fl oz',toUnit:'imperial pint'}).amount,'1');
  assert.equal(convertQuantity({amount:'8',fromUnit:'imperial pint',toUnit:'imperial gallon'}).amount,'1');
 });
 it('keeps valid conversions alongside blocked lines and unchanged originals',()=>{
  const result=standardizeRecipeUnits({recipeName:'Test',lines:[{ingredient:'flour',amount:'2',fromUnit:'cup',toUnit:'g'},{ingredient:'oil',amount:'2',fromUnit:'us tbsp',toUnit:'ml'},{ingredient:'salt',amount:'1',fromUnit:'oz',toUnit:'g'}]});
  assert.equal(result.complete,false);assert.equal(result.saved,false);assert.equal(result.lines[0]!.status,'blocked');
  assert.deepEqual(result.lines[0]!.original,{amount:'2',unit:'cup'});
  assert.equal(result.lines[1]!.converted?.amount,'29.57353');assert.equal(result.lines[2]!.converted?.amount,'28.349523');
 });
 it('requires a measured ingredient factor rather than assuming water density',()=>{
  const line={ingredient:'flour',amount:'2',fromUnit:'us cup',toUnit:'g'};
  assert.equal(standardizeRecipeUnits({recipeName:'Test',lines:[line]}).complete,false);
  assert.equal(standardizeRecipeUnits({recipeName:'Test',lines:[{...line,factor:'120'}]}).complete,false);
  const result=standardizeRecipeUnits({recipeName:'Test',lines:[{...line,factor:'120',factorBasis:'Synthetic weighed trial: level spooned flour, 120 g per US cup'}]});
  assert.equal(result.complete,true);assert.equal(result.lines[0]!.converted?.amount,'240');
 });
 it('rejects malformed requests, negative amounts and conflicting defined factors',()=>{
  assert.throws(()=>standardizeRecipeUnits({recipeName:'Test',lines:[],workspace:'private'}));
  for(const line of [{ingredient:'x',amount:'-1',fromUnit:'g',toUnit:'kg'},{ingredient:'x',amount:'1',fromUnit:'g',toUnit:'kg',factor:'2',factorBasis:'incorrect'}])assert.equal(standardizeRecipeUnits({recipeName:'Test',lines:[line]}).complete,false);
 });
});
