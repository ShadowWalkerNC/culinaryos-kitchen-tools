import test from 'node:test';import assert from 'node:assert/strict';
import {WORKFLOW_CATALOG} from '../src/workflows/catalog.js';import {reconcileStock,validatePrepCapacity} from '../src/core/operations.js';
const workflow=(id:string)=>{const w=WORKFLOW_CATALOG.find(w=>w.id===id);assert.ok(w);return w;};
test('specialty arithmetic keys: flour basis, starter subtraction, measured loss and household week coverage',()=>{
 assert.match(workflow('bakers-percentage-formula').example.output,new RegExp(String(1000+650+20+10)+' g'));assert.match(workflow('bakers-percentage-formula').example.output,/65%/);assert.match(workflow('preferment-flour-accounting').example.output,/900 g/);assert.match(workflow('preferment-flour-accounting').example.output,/550 g/);assert.match(workflow('dough-production-yield-plan').example.output,/1650-1600=50 g/);
 const declared=3*(1+2+1)+4*(2+1);assert.equal(declared,24);assert.match(workflow('household-meal-calendar').example.output,new RegExp('='+declared+' plates'));assert.match(workflow('household-meal-calendar').example.output,/four days/);
 const q=(amount:string)=>({amount,unit:'each'});const stock=reconcileStock({lines:[{id:'croissant',unit:'each',opening:q('12'),received:q('24'),used:q('30'),waste:q('2'),closing:q('4')}]});assert.equal(stock.lines[0]?.variance,'0');assert.match(workflow('bakery-display-sellthrough').example.output,/12\+24-30-2=4/);
});
test('specialty money examples preserve exact cents, uncertainty and proposed-action boundaries',()=>{
 const pack=4n*25n+30n+5n+50n;assert.equal(pack,185n);assert.match(workflow('retail-pack-size-pricing').example.input,/proposes.*2\.48/);assert.match(workflow('retail-pack-size-pricing').example.output,/rounds to USD 2\.50/);assert.match(workflow('retail-pack-size-pricing').example.output,/0\.65 before other unconfirmed/);
 assert.equal(180n+60n+50n,290n);assert.match(workflow('counter-service-combo-costing').example.output,/USD 2\.90/);assert.match(workflow('counter-service-combo-costing').example.output,/No milk or other addition is mapped/);
 assert.equal(50n+420n-15n-25n,430n);assert.match(workflow('small-shop-cash-close').example.output,/428-430=-2/);assert.match(workflow('food-truck-event-settlement').example.output,/upper bound/);assert.match(workflow('food-truck-loadout').example.output,/\[ \] count packed/);
});
test('pickup example avoids a real attended-staff conflict rather than hiding overlapping work',()=>{
 const resources=[{id:'Ben',capacity:1,unit:'person'},{id:'Ana',capacity:1,unit:'person'}];const t=(id:string,resourceId:string,start:string,end:string)=>({id,resourceId,start:'2026-10-25T'+start+':00-04:00',end:'2026-10-25T'+end+':00-04:00',units:1,unit:'person'});
 assert.equal(validatePrepCapacity({resources,tasks:[t('sauce','Ben','18:15','18:35'),t('carve','Ben','18:35','18:50'),t('plate','Ana','18:50','19:00')]}).feasible,true);
 assert.equal(validatePrepCapacity({resources,tasks:[t('carve','Ben','18:35','18:50'),t('sauce','Ben','18:40','19:00')]}).feasible,false);assert.match(workflow('multi-station-pickup-plan').example.output,/18:15-18:35/);
});
test('leftover, water, freezer and deli examples do not infer operational approval from partial records',()=>{
 assert.match(workflow('leftover-reuse-plan').example.output,/reuse assurance blocked/);assert.doesNotMatch(workflow('leftover-reuse-plan').example.output,/Approved reuse:/);assert.match(workflow('food-truck-power-water-plan').example.output,/no readiness verdict/);assert.match(workflow('freezer-inventory-plan').example.output,/cannot be ranked/);assert.match(workflow('deli-display-replenishment').example.output,/not holding controls/);
});
