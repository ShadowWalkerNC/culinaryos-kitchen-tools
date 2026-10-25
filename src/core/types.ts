// Shared data version v1 types (F01-F06). Original MIT content.
export const DATA_VERSION = 'v1' as const;

export interface Quantity {
  amount: string; // decimal string, e.g. "2.5"
  unit: string; // e.g. "g", "kg", "ml", "l", "each"
}

export interface Provenance {
  source: string;
  receivedAt: string; // ISO
  verified: boolean;
}

export interface RecipeIngredient {
  ingredientId: string;
  qty: Quantity;
}

export interface RecipeSubrecipe {
  recipeId: string;
  qty: Quantity; // amount of subrecipe output used
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
  currency: string; // ISO 4217, explicit
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
  effectiveDate: string; // ISO date
  packBasis?: string; // explicit supplied basis, e.g. "case of 6x2kg, 5% trim"
  densityGPerMl?: string; // explicit supplied density only
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
  coverage: { known: number; total: number };
  perUnitCents?: number;
  rounding: 'half_up';
  /** Ingredient gross margin only; never net profit. Present only with confirmed net price. */
  ingredientGrossMarginCents?: number;
  variantId?: string;
}
