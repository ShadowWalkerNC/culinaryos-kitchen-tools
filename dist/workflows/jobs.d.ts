import { z } from 'zod';
import type { Db } from '../data/db.js';
export declare const sourceRefSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        recipe: "recipe";
        purchase: "purchase";
        forecast: "forecast";
        "culinaryos-snapshot": "culinaryos-snapshot";
    }>;
    id: z.ZodString;
    version: z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>;
}, z.core.$strict>;
export type SourceRef = z.infer<typeof sourceRefSchema>;
export declare const createJobSchema: z.ZodObject<{
    templateId: z.ZodString;
    owner: z.ZodOptional<z.ZodString>;
    dueAt: z.ZodOptional<z.ZodISODateTime>;
    timezone: z.ZodOptional<z.ZodString>;
    inputs: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNullable<z.ZodString>>>;
    sourceRefs: z.ZodDefault<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            recipe: "recipe";
            purchase: "purchase";
            forecast: "forecast";
            "culinaryos-snapshot": "culinaryos-snapshot";
        }>;
        id: z.ZodString;
        version: z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export interface Job {
    id: string;
    version: number;
    templateId: string;
    title: string;
    owner: string | null;
    dueAt: string | null;
    timezone: string | null;
    inputs: Record<string, string | null>;
    requiredInputs: string[];
    sourceRefs: SourceRef[];
    steps: Array<{
        label: string;
        done: boolean;
        note: string | null;
    }>;
    draft: string | null;
    review: {
        reviewer: string;
        at: string;
        version: number;
    } | null;
    cancelled: boolean;
    history: Array<{
        at: string;
        event: string;
    }>;
}
export declare function sourceVersion(db: Db, s: Pick<SourceRef, 'kind' | 'id'>): number | string | null;
export declare function jobView(db: Db, job: Job): {
    state: string;
    missingInputs: string[];
    staleSources: {
        kind: "recipe" | "purchase" | "forecast" | "culinaryos-snapshot";
        id: string;
        version: string | number;
    }[];
    nextStep: number | null;
    blockers: string[];
    execution: string;
    id: string;
    version: number;
    templateId: string;
    title: string;
    owner: string | null;
    dueAt: string | null;
    timezone: string | null;
    inputs: Record<string, string | null>;
    requiredInputs: string[];
    sourceRefs: SourceRef[];
    steps: Array<{
        label: string;
        done: boolean;
        note: string | null;
    }>;
    draft: string | null;
    review: {
        reviewer: string;
        at: string;
        version: number;
    } | null;
    cancelled: boolean;
    history: Array<{
        at: string;
        event: string;
    }>;
};
export declare function readJob(db: Db, id: string): Job;
export declare function createJob(db: Db, input: unknown): {
    state: string;
    missingInputs: string[];
    staleSources: {
        kind: "recipe" | "purchase" | "forecast" | "culinaryos-snapshot";
        id: string;
        version: string | number;
    }[];
    nextStep: number | null;
    blockers: string[];
    execution: string;
    id: string;
    version: number;
    templateId: string;
    title: string;
    owner: string | null;
    dueAt: string | null;
    timezone: string | null;
    inputs: Record<string, string | null>;
    requiredInputs: string[];
    sourceRefs: SourceRef[];
    steps: Array<{
        label: string;
        done: boolean;
        note: string | null;
    }>;
    draft: string | null;
    review: {
        reviewer: string;
        at: string;
        version: number;
    } | null;
    cancelled: boolean;
    history: Array<{
        at: string;
        event: string;
    }>;
};
export declare function listJobs(db: Db): {
    state: string;
    missingInputs: string[];
    staleSources: {
        kind: "recipe" | "purchase" | "forecast" | "culinaryos-snapshot";
        id: string;
        version: string | number;
    }[];
    nextStep: number | null;
    blockers: string[];
    execution: string;
    id: string;
    version: number;
    templateId: string;
    title: string;
    owner: string | null;
    dueAt: string | null;
    timezone: string | null;
    inputs: Record<string, string | null>;
    requiredInputs: string[];
    sourceRefs: SourceRef[];
    steps: Array<{
        label: string;
        done: boolean;
        note: string | null;
    }>;
    draft: string | null;
    review: {
        reviewer: string;
        at: string;
        version: number;
    } | null;
    cancelled: boolean;
    history: Array<{
        at: string;
        event: string;
    }>;
}[];
export declare const updateJobSchema: z.ZodObject<{
    id: z.ZodString;
    expectedVersion: z.ZodNumber;
    inputs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNullable<z.ZodString>>>;
    step: z.ZodOptional<z.ZodNumber>;
    done: z.ZodOptional<z.ZodBoolean>;
    note: z.ZodOptional<z.ZodString>;
    draft: z.ZodOptional<z.ZodString>;
    sourceRefs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            recipe: "recipe";
            purchase: "purchase";
            forecast: "forecast";
            "culinaryos-snapshot": "culinaryos-snapshot";
        }>;
        id: z.ZodString;
        version: z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>;
    }, z.core.$strict>>>;
    cancel: z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strict>;
export declare function updateJob(db: Db, input: unknown): {
    state: string;
    missingInputs: string[];
    staleSources: {
        kind: "recipe" | "purchase" | "forecast" | "culinaryos-snapshot";
        id: string;
        version: string | number;
    }[];
    nextStep: number | null;
    blockers: string[];
    execution: string;
    id: string;
    version: number;
    templateId: string;
    title: string;
    owner: string | null;
    dueAt: string | null;
    timezone: string | null;
    inputs: Record<string, string | null>;
    requiredInputs: string[];
    sourceRefs: SourceRef[];
    steps: Array<{
        label: string;
        done: boolean;
        note: string | null;
    }>;
    draft: string | null;
    review: {
        reviewer: string;
        at: string;
        version: number;
    } | null;
    cancelled: boolean;
    history: Array<{
        at: string;
        event: string;
    }>;
};
export declare const reviewJobSchema: z.ZodObject<{
    id: z.ZodString;
    expectedVersion: z.ZodNumber;
    reviewer: z.ZodString;
    confirm: z.ZodLiteral<true>;
}, z.core.$strict>;
export declare function reviewJob(db: Db, input: unknown): {
    state: string;
    missingInputs: string[];
    staleSources: {
        kind: "recipe" | "purchase" | "forecast" | "culinaryos-snapshot";
        id: string;
        version: string | number;
    }[];
    nextStep: number | null;
    blockers: string[];
    execution: string;
    id: string;
    version: number;
    templateId: string;
    title: string;
    owner: string | null;
    dueAt: string | null;
    timezone: string | null;
    inputs: Record<string, string | null>;
    requiredInputs: string[];
    sourceRefs: SourceRef[];
    steps: Array<{
        label: string;
        done: boolean;
        note: string | null;
    }>;
    draft: string | null;
    review: {
        reviewer: string;
        at: string;
        version: number;
    } | null;
    cancelled: boolean;
    history: Array<{
        at: string;
        event: string;
    }>;
};
export declare const jobCalculationSchema: z.ZodObject<{
    id: z.ZodString;
    expectedVersion: z.ZodNumber;
    tool: z.ZodEnum<{
        get_workflow: "get_workflow";
        list_workflows: "list_workflows";
        validate_kitchen_data: "validate_kitchen_data";
        convert_quantity: "convert_quantity";
        reconcile_stock: "reconcile_stock";
        validate_prep_capacity: "validate_prep_capacity";
        build_prep_plan: "build_prep_plan";
        calculate_event_budget: "calculate_event_budget";
        cost_recipe: "cost_recipe";
        scale_recipe: "scale_recipe";
        compare_purchase_costs: "compare_purchase_costs";
        calculate_usable_yield: "calculate_usable_yield";
        build_order_proposal: "build_order_proposal";
        list_capabilities: "list_capabilities";
        calculate_menu_margins: "calculate_menu_margins";
        calculate_staffing_budget: "calculate_staffing_budget";
        calculate_bakery_formula: "calculate_bakery_formula";
        format_menu: "format_menu";
        find_kitchen_help: "find_kitchen_help";
        get_started: "get_started";
        standardize_recipe_units: "standardize_recipe_units";
    }>;
    arguments: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strict>;
export declare function calculateForJob(db: Db, input: unknown): {
    id: string;
    jobId: string;
    jobVersion: number;
    tool: "get_workflow" | "list_workflows" | "validate_kitchen_data" | "convert_quantity" | "reconcile_stock" | "validate_prep_capacity" | "build_prep_plan" | "calculate_event_budget" | "cost_recipe" | "scale_recipe" | "compare_purchase_costs" | "calculate_usable_yield" | "build_order_proposal" | "list_capabilities" | "calculate_menu_margins" | "calculate_staffing_budget" | "calculate_bakery_formula" | "format_menu" | "find_kitchen_help" | "get_started" | "standardize_recipe_units";
    input: Record<string, unknown>;
    output: unknown;
    inputHash: string;
    outputHash: string;
    sourceRefs: {
        kind: "recipe" | "purchase" | "forecast" | "culinaryos-snapshot";
        id: string;
        version: string | number;
    }[];
    createdAt: string;
};
export declare function jobReceipts(db: Db, id: string): any[];
//# sourceMappingURL=jobs.d.ts.map