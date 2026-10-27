import { z } from 'zod';
export declare const menuMarginsSchema: z.ZodObject<{
    currency: z.ZodString;
    targetFoodCostPercent: z.ZodOptional<z.ZodString>;
    includeSalesMix: z.ZodDefault<z.ZodBoolean>;
    rows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        currency: z.ZodString;
        costCents: z.ZodNullable<z.ZodNumber>;
        netSellingPriceCents: z.ZodNullable<z.ZodNumber>;
        unitsSold: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare function calculateMenuMargins(input: unknown): {
    currency: string;
    complete: boolean;
    rows: {
        complete: boolean;
        foodCostPercent: string | null;
        ingredientGrossMarginCents: number | null;
        ingredientGrossMarginPercent: string | null;
        markupPercent: string | null;
        minimumNetPriceCents: number | null;
        withinTarget: boolean | null;
        missingInputs: string[];
        ratioNote: string | null;
        id: string;
        currency: string;
        costCents: number | null;
        netSellingPriceCents: number | null;
        unitsSold?: number | null | undefined;
    }[];
    salesMix: {
        complete: boolean;
        revenueCents: number | null;
        ingredientCostCents: number | null;
        ingredientContributionCents: number | null;
    } | null;
    targetFoodCostPercent: string | null;
    basis: string;
    rounding: string;
    saved: boolean;
};
export declare const staffingBudgetSchema: z.ZodObject<{
    currency: z.ZodString;
    roles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        people: z.ZodNumber;
        hours: z.ZodNullable<z.ZodString>;
        hourlyRateCents: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare function calculateStaffingBudget(input: unknown): {
    currency: string;
    complete: boolean;
    roles: {
        personHours: string | null;
        costCents: number | null;
        missingInputs: string[];
        id: string;
        people: number;
        hours: string | null;
        hourlyRateCents: number | null;
    }[];
    knownCostCents: number;
    totalCostCents: number | null;
    rounding: string;
    basis: string;
    saved: boolean;
};
export declare const bakeryFormulaSchema: z.ZodObject<{
    directFlourGrams: z.ZodNullable<z.ZodString>;
    directWaterGrams: z.ZodNullable<z.ZodString>;
    preferments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        flourGrams: z.ZodNullable<z.ZodString>;
        waterGrams: z.ZodNullable<z.ZodString>;
        otherGrams: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>>;
    otherIngredients: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        grams: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>>;
    targetTotalFlourGrams: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare function calculateBakeryFormula(input: unknown): {
    complete: boolean;
    totalFlourGrams: string | null;
    totalWaterGrams: string | null;
    hydrationPercent: string | null;
    totalDoughGrams: string | null;
    components: {
        bakersPercent: string | null;
        scaledGrams: string | null;
        id: string;
        grams: string | null;
    }[];
    missingInputs: string[];
    basis: string;
    rounding: string;
    saved: boolean;
};
//# sourceMappingURL=business.d.ts.map