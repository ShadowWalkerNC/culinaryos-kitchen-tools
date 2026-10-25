import { assertCents, assertCurrency } from './money.js';
import { assertQuantity } from './quantity.js';
import { unitRatio } from './conversion.js';
import { validateRecipe } from './validation.js';
import type { CostResult, Purchase, Recipe } from './types.js';
export interface CostInputs {recipes:Map<string,Recipe>;purchasesByIngredient:Map<string,Purchase>;targetRecipeId:string;variantId?:string}
type Fraction={n:bigint;d:bigint};
const gcd=(a:bigint,b:bigint):bigint=>{while(b){const t=b;b=a%b;a=t;}return a;};
function frac(n:bigint,d:bigint):Fraction{if(d<=0n||n<0n)throw new Error('invalid cost ratio');const g=gcd(n,d);return{n:n/g,d:d/g};}
const add=(a:Fraction,b:Fraction):Fraction=>frac(a.n*b.d+b.n*a.d,a.d*b.d);
const mul=(a:Fraction,n:bigint,d:bigint):Fraction=>frac(a.n*n,a.d*d);
function rounded(a:Fraction):number{const n=(a.n*2n+a.d)/(2n*a.d);if(n>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('cost overflow');return Number(n);}
/** Preserve rational cents through batch and subrecipe calculations. Round only final amounts. */
export function costRecipe(inputs:CostInputs):CostResult{
 const root=inputs.recipes.get(inputs.targetRecipeId);if(!root)throw new Error('unknown recipe');
 if(inputs.recipes.size>500||inputs.purchasesByIngredient.size>2000)throw new Error('calculation input limit exceeded');
 const currency=assertCurrency(root.currency);let total=0,known=0,visits=0;
 const unknown:CostResult['unknown']=[];
 const visit=(r:Recipe,path:string,stack:Set<string>):Fraction=>{
  if(++visits>10000||stack.size>=20)throw new Error('recipe expansion/depth limit exceeded');
  if(stack.has(r.id))throw new Error('recipe cycle detected');
  if(r.currency!==currency)throw new Error('mixed currencies');
  const issues=validateRecipe(r);if(issues.length)throw new Error(issues[0]!.message);
  stack.add(r.id);let sum=frac(0n,1n);
  if(!r.ingredients.length&&!r.subrecipes.length)unknown.push({path,reason:'recipe has no ingredients'});
  for(const ing of r.ingredients){
   total++;const q=assertQuantity(ing.qty,'ingredient quantity');const p=inputs.purchasesByIngredient.get(ing.ingredientId);
   if(!p){unknown.push({path:`${path}.${ing.ingredientId}`,reason:'no purchase cost supplied'});continue;}
   assertCents(p.costCents,'purchase cost');if(p.currency!==currency)throw new Error('mixed currencies');
   const usable=assertQuantity(p.usableQty,'usable purchase quantity');let ratio:[bigint,bigint];
   try{ratio=unitRatio(ing.qty.unit,p.usableQty.unit);}catch{unknown.push({path:`${path}.${ing.ingredientId}`,reason:'unit mismatch: measured pack/density or unit system required'});continue;}
   sum=add(sum,frac(BigInt(p.costCents)*q*ratio[0],usable*ratio[1]));known++;
  }
  for(const edge of r.subrecipes){
   const sub=inputs.recipes.get(edge.recipeId);if(!sub){total++;unknown.push({path:`${path}>${edge.recipeId}`,reason:'missing subrecipe'});continue;}
   const q=assertQuantity(edge.qty,'subrecipe quantity');let ratio:[bigint,bigint];
   try{ratio=unitRatio(edge.qty.unit,sub.yieldQty.unit);}catch{total++;unknown.push({path:`${path}>${edge.recipeId}`,reason:'subrecipe unit mismatch'});continue;}
   sum=add(sum,mul(visit(sub,`${path}>${sub.id}`,stack),q*ratio[0],assertQuantity(sub.yieldQty,'subrecipe yield')*ratio[1]));
  }
  stack.delete(r.id);return sum;
 };
 const batch=visit(root,root.id,new Set());let packagingCents=0;
 for(const p of root.packaging??[])packagingCents+=assertCents(p.costCents,'packaging cost');
 assertCents(packagingCents,'total packaging cost');
 const result:CostResult={recipeId:root.id,currency,knownCents:rounded(batch),packagingCents,unknown,coverage:{known,total},rounding:'half_up'};
 if(!unknown.length){result.perUnitCents=rounded(mul(batch,1000000n,assertQuantity(root.yieldQty,'recipe yield')));
  if(inputs.variantId){const v=root.variants?.find(v=>v.id===inputs.variantId);if(v?.confirmed&&v.netPriceCents!==undefined){assertCents(v.netPriceCents,'variant net price');result.ingredientGrossMarginCents=v.netPriceCents-result.perUnitCents;result.variantId=v.id;}}
 }
 return result;
}
