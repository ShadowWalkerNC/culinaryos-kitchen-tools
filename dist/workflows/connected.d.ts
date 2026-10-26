import { z } from 'zod';
import { type Db } from '../data/db.js';
export declare const connectedFlowSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"recipe-release">;
    recipeId: z.ZodString;
    key: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"supplier-price-change">;
    ingredientIds: z.ZodArray<z.ZodString>;
    key: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"daily-service">;
    day: z.ZodISODate;
    capacity: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strict>>;
    orderLines: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodString;
        par: z.ZodString;
        onHand: z.ZodString;
        onOrder: z.ZodString;
        unit: z.ZodString;
        packSize: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    key: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"event-planning">;
    budget: z.ZodObject<{
        currency: z.ZodString;
        revenueCents: z.ZodNullable<z.ZodNumber>;
        costs: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            currency: z.ZodString;
            amountCents: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        targetContributionPercent: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    capacity: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strict>>;
    capacityConfirmed: z.ZodOptional<z.ZodBoolean>;
    dietary: z.ZodObject<{
        totalGuests: z.ZodNumber;
        guests: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            requirements: z.ZodArray<z.ZodString>;
            allergenStatus: z.ZodEnum<{
                unknown: "unknown";
                contains: "contains";
                may_contain: "may_contain";
                verified_absent: "verified_absent";
            }>;
            evidence: z.ZodOptional<z.ZodObject<{
                source: z.ZodString;
                version: z.ZodString;
                reviewer: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    key: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"service-close">;
    day: z.ZodISODate;
    stock: z.ZodObject<{
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
    wasteConfirmed: z.ZodBoolean;
    waste: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodString;
        amount: z.ZodString;
        unit: z.ZodString;
    }, z.core.$strict>>;
    key: z.ZodString;
}, z.core.$strict>], "kind">;
export declare const attachFlowDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    expectedVersion: z.ZodNumber;
    kind: z.ZodEnum<{
        "service-brief": "service-brief";
        sop: "sop";
        "recipe-card": "recipe-card";
        "event-plan": "event-plan";
        "supporting-note": "supporting-note";
    }>;
    title: z.ZodString;
    body: z.ZodString;
}, z.core.$strict>;
export declare const approveFlowSchema: z.ZodObject<{
    id: z.ZodString;
    expectedVersion: z.ZodNumber;
    confirm: z.ZodLiteral<true>;
    reviewer: z.ZodString;
}, z.core.$strict>;
export declare function evaluateEventPlan(p: Extract<z.infer<typeof connectedFlowSchema>, {
    kind: 'event-planning';
}>): {
    blockers: string[];
    calculations: {
        budget: {
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
        capacity: {
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
        dietary: {
            totalGuests: number;
            confirmedGuestRecords: number;
            uniqueGuestsWithRequirements: number;
        };
    };
};
type Source = {
    kind: 'recipe' | 'purchase' | 'forecast';
    id: string;
    version: number | string;
    ingredientId?: string;
};
type Doc = {
    id: string;
    kind: string;
    title: string;
    body: string;
    sourceVersions: Source[];
    createdAt: string;
};
export interface ConnectedFlow {
    id: string;
    kind: string;
    key: string;
    status: string;
    version: number;
    sourceVersions: Source[];
    input: z.infer<typeof connectedFlowSchema>;
    output: {
        blockers: string[];
        requiredDocuments: string[];
        calculations: unknown;
        actions: string[];
    };
    documents: Doc[];
    taskIds: string[];
    history: Array<{
        at: string;
        event: string;
    }>;
    createdAt: string;
    updatedAt: string;
}
export declare function listConnectedFlows(db: Db): ConnectedFlow[];
declare function current(db: Db, id: string): ConnectedFlow;
export { current as getConnectedFlow };
export declare function runConnectedFlow(db: Db, input: unknown): ConnectedFlow;
export declare function attachFlowDocument(db: Db, input: unknown): ConnectedFlow;
export declare function approveFlow(db: Db, input: unknown): ConnectedFlow;
//# sourceMappingURL=connected.d.ts.map