import {z} from 'zod';
import {convertQuantity} from './conversion.js';

export const standardizeRecipeSchema=z.object({
  recipeName:z.string().min(1).max(200),
  lines:z.array(z.object({ingredient:z.string().min(1).max(200),amount:z.string().min(1).max(80),fromUnit:z.string().min(1).max(80),toUnit:z.string().min(1).max(80),factor:z.string().max(80).optional(),factorBasis:z.string().min(1).max(500).optional()}).strict()).min(1).max(200),
}).strict();
const ambiguous=new Set(['cup','cups','tbsp','tablespoon','tablespoons','tsp','teaspoon','teaspoons','fl oz','fluid ounce','fluid ounces','pint','pints','quart','quarts','gallon','gallons']);
export function standardizeRecipeUnits(input:unknown) {
  const request=standardizeRecipeSchema.parse(input);
  const lines=request.lines.map((line,index)=>{
    try {
      if([line.fromUnit,line.toUnit].some(u=>ambiguous.has(u.trim().toLowerCase())))throw new Error('Specify the measurement standard, for example us cup, metric cup, us fl oz or imperial fl oz');
      const converted=convertQuantity({amount:line.amount,fromUnit:line.fromUnit,toUnit:line.toUnit,...(line.factor!==undefined?{factor:line.factor}:{}),...(line.factorBasis!==undefined?{factorBasis:line.factorBasis}:{})});
      return{line:index+1,ingredient:line.ingredient,original:{amount:line.amount,unit:line.fromUnit},status:'converted' as const,converted};
    }catch(error){return{line:index+1,ingredient:line.ingredient,original:{amount:line.amount,unit:line.fromUnit},status:'blocked' as const,reason:(error as Error).message};}
  });
  return{recipeName:request.recipeName,complete:lines.every(l=>l.status==='converted'),lines,rounding:'Nearest 0.000001 target unit, half up; original quantities retained.',saved:false,review:'Review measured ingredient-specific factors and culinary practicality before replacing a recipe. No density, packing method, pack size or cup standard is inferred.'};
}
