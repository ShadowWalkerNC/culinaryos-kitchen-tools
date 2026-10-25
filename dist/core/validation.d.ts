import type { Purchase, Recipe } from './types.js';
export interface ValidationIssue {
    path: string;
    message: string;
}
export declare function validateRecipe(r: Recipe): ValidationIssue[];
export declare function validatePurchase(p: Purchase): ValidationIssue[];
/** Detect cycles in subrecipe graph. Returns cycle path or null. */
export declare function findCycle(recipes: Map<string, Recipe>): string[] | null;
//# sourceMappingURL=validation.d.ts.map