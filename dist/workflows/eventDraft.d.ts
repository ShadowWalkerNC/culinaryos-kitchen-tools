import { z } from 'zod';
import { type Db } from '../data/db.js';
import type { EventDraft } from './eventDraftTypes.js';
export type { EventDraft } from './eventDraftTypes.js';
export declare const eventDraftSchema: z.ZodObject<{
    currency: z.ZodString;
    revenue: z.ZodString;
    totalGuests: z.ZodString;
    costs: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        amount: z.ZodString;
    }, z.core.$strict>>;
    resources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        capacity: z.ZodString;
        unit: z.ZodString;
    }, z.core.$strict>>;
    tasks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        resourceId: z.ZodString;
        start: z.ZodString;
        end: z.ZodString;
        units: z.ZodString;
        unit: z.ZodString;
    }, z.core.$strict>>;
    guests: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        requirements: z.ZodString;
        allergenStatus: z.ZodEnum<{
            unknown: "unknown";
            contains: "contains";
            may_contain: "may_contain";
            verified_absent: "verified_absent";
        }>;
        source: z.ZodString;
        sourceVersion: z.ZodString;
        reviewer: z.ZodString;
    }, z.core.$strict>>;
    capacityConfirmed: z.ZodBoolean;
}, z.core.$strict>;
export declare function loadEventDraft(db: Db): {
    version: number;
    payload: EventDraft | null;
};
export declare function saveEventDraft(db: Db, input: unknown): {
    version: number;
    payload: {
        currency: string;
        revenue: string;
        totalGuests: string;
        costs: {
            label: string;
            amount: string;
        }[];
        resources: {
            id: string;
            capacity: string;
            unit: string;
        }[];
        tasks: {
            id: string;
            resourceId: string;
            start: string;
            end: string;
            units: string;
            unit: string;
        }[];
        guests: {
            id: string;
            requirements: string;
            allergenStatus: "unknown" | "contains" | "may_contain" | "verified_absent";
            source: string;
            sourceVersion: string;
            reviewer: string;
        }[];
        capacityConfirmed: boolean;
    };
};
export declare function previewEventDraft(input: unknown, key?: string): {
    request: {
        kind: "event-planning";
        budget: {
            currency: string;
            revenueCents: number | null;
            costs: {
                label: string;
                currency: string;
                amountCents: number | null;
            }[];
            targetContributionPercent?: string | undefined;
        };
        dietary: {
            totalGuests: number;
            guests: {
                id: string;
                requirements: string[];
                allergenStatus: "unknown" | "contains" | "may_contain" | "verified_absent";
                evidence?: {
                    source: string;
                    version: string;
                    reviewer: string;
                } | undefined;
            }[];
        };
        key: string;
        capacity?: {
            resources: {
                id: string;
                capacity: number;
                unit: string;
            }[];
            tasks: {
                id: string;
                resourceId: string;
                start: string;
                end: string;
                units: number;
                unit: string;
            }[];
        } | undefined;
        capacityConfirmed?: boolean | undefined;
    };
    blockers: string[];
    summary: {
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
export declare function createEventFromDraft(db: Db, input: unknown): import("./connected.js").ConnectedFlow;
//# sourceMappingURL=eventDraft.d.ts.map