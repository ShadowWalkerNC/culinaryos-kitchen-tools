import {z} from 'zod';
import {parseMicros,formatMicros,MICROS} from './quantity.js';

const currency=z.string().regex(/^[A-Z]{3}$/),id=z.string().trim().min(1).max(200);
const cents=z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const decimal=z.string().max(32).refine(s=>{try{return parseMicros(s,'quantity')>=0n;}catch{return false;}},'Nonnegative decimal with at most six places required');
const percent=decimal.refine(s=>{const n=parseMicros(s,'percent');return n>0n&&n<=100n*MICROS;},'Percent must be >0 and <=100');
function unique(ids:string[]){if(new Set(ids).size!==ids.length)throw Error('Duplicate line identifier');}
function safeMoney(n:bigint){if(n>BigInt(Number.MAX_SAFE_INTEGER)||n<BigInt(Number.MIN_SAFE_INTEGER))throw Error('Money result exceeds safe integer cents');return Number(n);}
function divide(n:bigint,d:bigint){if(d<=0n)throw Error('Positive denominator required');return n<0n?-((-n+d/2n)/d):(n+d/2n)/d;}
function pct(n:bigint,d:bigint){return d===0n?null:formatMicros(divide(n*100n*MICROS,d));}

export const menuMarginsSchema=z.object({currency, targetFoodCostPercent:percent.optional(),includeSalesMix:z.boolean().default(false),rows:z.array(z.object({id,currency,costCents:cents.nullable(),netSellingPriceCents:cents.nullable(),unitsSold:z.number().int().nonnegative().max(100000000).nullable().optional()}).strict()).min(1).max(1000)}).strict();
export function calculateMenuMargins(input:unknown){
 const p=menuMarginsSchema.parse(input);unique(p.rows.map(r=>r.id));
 if(p.rows.some(r=>r.currency!==p.currency))throw Error('Incompatible currencies; no exchange rate inferred');
 const target=p.targetFoodCostPercent?parseMicros(p.targetFoodCostPercent,'target'):null;
 const rows=p.rows.map(r=>{
  const cost=r.costCents===null?null:BigInt(r.costCents),price=r.netSellingPriceCents===null?null:BigInt(r.netSellingPriceCents),known=cost!==null&&price!==null;
  const minimum=cost!==null&&target!==null?safeMoney((cost*100n*MICROS+target-1n)/target):null;
  return{...r,complete:known,foodCostPercent:known?pct(cost!,price!):null,ingredientGrossMarginCents:known?safeMoney(price!-cost!):null,ingredientGrossMarginPercent:known?pct(price!-cost!,price!):null,markupPercent:known?pct(price!-cost!,cost!):null,minimumNetPriceCents:minimum,withinTarget:known&&target!==null&&price!>0n?cost!*100n*MICROS<=price!*target:null,missingInputs:[...(cost===null?['costCents']:[]),...(price===null?['netSellingPriceCents']:[])],ratioNote:known&&(cost===0n||price===0n)?'Ratios with a zero denominator remain unavailable.':null};
 });
 const mixComplete=p.includeSalesMix&&p.rows.every(r=>r.unitsSold!==null&&r.unitsSold!==undefined&&r.costCents!==null&&r.netSellingPriceCents!==null);
 let salesMix:null|{complete:boolean;revenueCents:number|null;ingredientCostCents:number|null;ingredientContributionCents:number|null}=null;
 if(p.includeSalesMix){const revenue=mixComplete?p.rows.reduce((n,r)=>n+BigInt(r.netSellingPriceCents!)*BigInt(r.unitsSold!),0n):null,cost=mixComplete?p.rows.reduce((n,r)=>n+BigInt(r.costCents!)*BigInt(r.unitsSold!),0n):null;salesMix={complete:mixComplete,revenueCents:revenue===null?null:safeMoney(revenue),ingredientCostCents:cost===null?null:safeMoney(cost),ingredientContributionCents:revenue===null||cost===null?null:safeMoney(revenue-cost)};}
 return{currency:p.currency,complete:rows.every(r=>r.complete)&&(!p.includeSalesMix||mixComplete),rows,salesMix,targetFoodCostPercent:p.targetFoodCostPercent??null,basis:'Net selling prices and ingredient costs only. Gross margin and markup are different. Labor, overhead, tax and FX are not inferred; ingredient contribution is not net profit.',rounding:'Percentages half up to six decimals; minimum target price rounds upward to the next cent.',saved:false};
}

export const staffingBudgetSchema=z.object({currency,roles:z.array(z.object({id,people:z.number().int().nonnegative().max(100000),hours:decimal.nullable(),hourlyRateCents:cents.nullable()}).strict()).min(1).max(1000)}).strict();
export function calculateStaffingBudget(input:unknown){
 const p=staffingBudgetSchema.parse(input);unique(p.roles.map(r=>r.id));let known=0n;
 const roles=p.roles.map(r=>{const hours=r.hours===null?null:parseMicros(r.hours,'hours'),cost=hours!==null&&r.hourlyRateCents!==null?divide(hours*BigInt(r.people)*BigInt(r.hourlyRateCents),MICROS):null;if(cost!==null)known+=cost;return{...r,personHours:hours===null?null:formatMicros(hours*BigInt(r.people)),costCents:cost===null?null:safeMoney(cost),missingInputs:[...(hours===null?['hours']:[]),...(r.hourlyRateCents===null?['hourlyRateCents']:[])]};});
 const complete=roles.every(r=>r.costCents!==null);
 return{currency:p.currency,complete,roles,knownCostCents:safeMoney(known),totalCostCents:complete?safeMoney(known):null,rounding:'Each role cost rounds half up to integer cents after multiplying people by hours by rate.',basis:'Explicit straight-time hours and rates only; staffing ratios, overtime, breaks, benefits, taxes and legal compliance are not inferred.',saved:false};
}

export const bakeryFormulaSchema=z.object({directFlourGrams:decimal.nullable(),directWaterGrams:decimal.nullable(),preferments:z.array(z.object({name:id,flourGrams:decimal.nullable(),waterGrams:decimal.nullable(),otherGrams:decimal.nullable()}).strict()).max(100).default([]),otherIngredients:z.array(z.object({name:id,grams:decimal.nullable()}).strict()).max(200).default([]),targetTotalFlourGrams:decimal.refine(s=>parseMicros(s,'target')>0n,'Positive target required').optional()}).strict();
export function calculateBakeryFormula(input:unknown){
 const p=bakeryFormulaSchema.parse(input);unique([...p.preferments.map(r=>r.name),...p.otherIngredients.map(r=>r.name)]);
 const amount=(n:string|null)=>n===null?null:parseMicros(n,'grams');
 const flours=[amount(p.directFlourGrams),...p.preferments.map(r=>amount(r.flourGrams))],waters=[amount(p.directWaterGrams),...p.preferments.map(r=>amount(r.waterGrams))],others=[...p.preferments.map(r=>amount(r.otherGrams)),...p.otherIngredients.map(r=>amount(r.grams))];
 const sum=(items:(bigint|null)[])=>items.some(n=>n===null)?null:items.reduce<bigint>((n,v)=>n+v!,0n);
 const flour=sum(flours),water=sum(waters),other=sum(others),complete=flour!==null&&water!==null&&other!==null;
 if(flour===0n)throw Error('Total flour must be greater than zero');
 const components=[{id:'direct-flour',grams:p.directFlourGrams},{id:'direct-water',grams:p.directWaterGrams},...p.preferments.flatMap(r=>[{id:r.name+':flour',grams:r.flourGrams},{id:r.name+':water',grams:r.waterGrams},{id:r.name+':other',grams:r.otherGrams}]),...p.otherIngredients.map(r=>({id:r.name,grams:r.grams}))];
 const target=p.targetTotalFlourGrams?parseMicros(p.targetTotalFlourGrams,'target'):null;
 return{complete,totalFlourGrams:flour===null?null:formatMicros(flour),totalWaterGrams:water===null?null:formatMicros(water),hydrationPercent:flour===null||water===null?null:pct(water,flour),totalDoughGrams:complete?formatMicros(flour!+water!+other!):null,components:components.map(c=>{const n=amount(c.grams);return{...c,bakersPercent:flour===null||n===null?null:pct(n,flour),scaledGrams:target===null||flour===null||n===null?null:formatMicros(divide(n*target,flour))};}),missingInputs:components.filter(c=>c.grams===null).map(c=>c.id),basis:'Only the explicitly declared composition. Preferment flour/water count in the totals; moisture in milk, eggs or other ingredients is never inferred.',rounding:'Gram quantities and percentages half up to six decimals.',saved:false};
}
