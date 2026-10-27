import { z } from 'zod';
export declare const standardizeRecipeSchema: z.ZodObject<{
    recipeName: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        ingredient: z.ZodString;
        amount: z.ZodString;
        fromUnit: z.ZodString;
        toUnit: z.ZodString;
        factor: z.ZodOptional<z.ZodString>;
        factorBasis: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare function standardizeRecipeUnits(input: unknown): {
    recipeName: string;
    complete: boolean;
    lines: ({
        line: number;
        ingredient: string;
        original: {
            amount: string;
            unit: string;
        };
        status: "converted";
        converted: {
            amount: string;
            unit: string;
            basis: string;
        };
        reason?: never;
    } | {
        line: number;
        ingredient: string;
        original: {
            amount: string;
            unit: string;
        };
        status: "blocked";
        reason: string;
        converted?: never;
    })[];
    rounding: string;
    saved: boolean;
    review: string;
};
//# sourceMappingURL=standardize.d.ts.map