import type { CostResult, Purchase, Recipe } from './types.js';
export interface CostInputs {
    recipes: Map<string, Recipe>;
    purchasesByIngredient: Map<string, Purchase>;
    targetRecipeId: string;
    variantId?: string;
}
/** Preserve rational cents through batch and subrecipe calculations. Round only final amounts. */
export declare function costRecipe(inputs: CostInputs): CostResult;
//# sourceMappingURL=costing.d.ts.map