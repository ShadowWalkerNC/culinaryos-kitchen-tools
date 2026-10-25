export declare const DATA_VERSION: "v1";
export interface Quantity {
    amount: string;
    unit: string;
}
export interface Provenance {
    source: string;
    receivedAt: string;
    verified: boolean;
}
export interface RecipeIngredient {
    ingredientId: string;
    qty: Quantity;
}
export interface RecipeSubrecipe {
    recipeId: string;
    qty: Quantity;
}
export interface RecipePackaging {
    label: string;
    costCents: number;
}
export interface RecipeVariant {
    id: string;
    netPriceCents?: number;
    confirmed: boolean;
}
export interface Recipe {
    id: string;
    name: string;
    currency: string;
    yieldQty: Quantity;
    ingredients: RecipeIngredient[];
    subrecipes: RecipeSubrecipe[];
    packaging?: RecipePackaging[];
    variants?: RecipeVariant[];
    version: number;
    provenance: Provenance;
}
export interface Purchase {
    id: string;
    ingredientId: string;
    currency: string;
    costCents: number;
    usableQty: Quantity;
    effectiveDate: string;
    packBasis?: string;
    densityGPerMl?: string;
    version: number;
    provenance: Provenance;
}
export interface CostUnknown {
    path: string;
    reason: string;
}
export interface CostResult {
    recipeId: string;
    currency: string;
    knownCents: number;
    packagingCents: number;
    unknown: CostUnknown[];
    coverage: {
        known: number;
        total: number;
    };
    perUnitCents?: number;
    rounding: 'half_up';
    /** Ingredient gross margin only; never net profit. Present only with confirmed net price. */
    ingredientGrossMarginCents?: number;
    variantId?: string;
}
//# sourceMappingURL=types.d.ts.map