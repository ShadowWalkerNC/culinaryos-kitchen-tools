import { z } from 'zod';
export declare const usableYieldSchema: z.ZodObject<{
    gross: z.ZodObject<{
        amount: z.ZodString;
        unit: z.ZodString;
    }, z.core.$strict>;
    usable: z.ZodObject<{
        amount: z.ZodString;
        unit: z.ZodString;
    }, z.core.$strict>;
    currency: z.ZodOptional<z.ZodString>;
    purchaseCostCents: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const stockSchema: z.ZodObject<{
    lines: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        unit: z.ZodString;
        opening: z.ZodNullable<z.ZodObject<{
            amount: z.ZodString;
            unit: z.ZodString;
        }, z.core.$strict>>;
        received: z.ZodNullable<z.ZodObject<{
            amount: z.ZodString;
            unit: z.ZodString;
        }, z.core.$strict>>;
        used: z.ZodNullable<z.ZodObject<{
            amount: z.ZodString;
            unit: z.ZodString;
        }, z.core.$strict>>;
        waste: z.ZodNullable<z.ZodObject<{
            amount: z.ZodString;
            unit: z.ZodString;
        }, z.core.$strict>>;
        closing: z.ZodNullable<z.ZodObject<{
            amount: z.ZodString;
            unit: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const budgetSchema: z.ZodObject<{
    currency: z.ZodString;
    revenueCents: z.ZodNullable<z.ZodNumber>;
    costs: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        currency: z.ZodString;
        amountCents: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    targetContributionPercent: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const capacitySchema: z.ZodObject<{
    resources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        capacity: z.ZodNumber;
        unit: z.ZodString;
    }, z.core.$strict>>;
    tasks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        resourceId: z.ZodString;
        start: z.ZodISODateTime;
        end: z.ZodISODateTime;
        units: z.ZodNumber;
        unit: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare function calculateUsableYield(input: unknown): {
    gross: {
        amount: string;
        unit: string;
    };
    usable: {
        amount: string;
        unit: string;
    };
    yieldPercent: string;
    usableInGrossUnit: {
        amount: string;
        unit: string;
    };
    basis: string;
    rounding: string;
} | {
    currency: string;
    costCentsPerUsableUnit: number;
    usableCostBasis: {
        numeratorCents: string;
        denominator: string;
        unit: string;
    };
    gross: {
        amount: string;
        unit: string;
    };
    usable: {
        amount: string;
        unit: string;
    };
    yieldPercent: string;
    usableInGrossUnit: {
        amount: string;
        unit: string;
    };
    basis: string;
    rounding: string;
};
export declare function reconcileStock(input: unknown): {
    lines: ({
        id: string;
        unit: string;
        status: string;
        unknown: string[];
        expectedClosing?: never;
        countedClosing?: never;
        variance?: never;
    } | {
        id: string;
        unit: string;
        status: string;
        expectedClosing: string;
        countedClosing: string;
        variance: string;
        unknown: string[];
    })[];
    complete: boolean;
    basis: string;
};
export declare function calculateEventBudget(input: unknown): {
    label: string;
    minimumRevenueCents?: number;
    minimumPriceRounding?: string;
    contributionCents?: number;
    currency: string;
    knownCostCents: number;
    unknown: string[];
    complete: boolean;
    costCoverage: string;
    revenueCents: number | null;
};
export declare function validatePrepCapacity(input: unknown): {
    feasible: boolean;
    conflicts: {
        resourceId: string;
        start?: string;
        end?: string;
        taskIds: string[];
        reason: string;
    }[];
    checkedTasks: number;
    basis: string;
};
//# sourceMappingURL=operations.d.ts.map