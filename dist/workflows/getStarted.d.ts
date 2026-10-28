import { z } from 'zod';
import { type PackId } from './packs.js';
export interface Starter {
    id: string;
    title: string;
    audience: string;
    prompt: string;
    steps: string[];
    workflowIds: string[];
    pack?: PackId;
}
export declare const STARTERS: Starter[];
export interface StarterSuggestion {
    id: string;
    title: string;
    matchedTokens: string[];
}
export declare const getStartedSchema: z.ZodObject<{
    view: z.ZodDefault<z.ZodEnum<{
        quick: "quick";
        full: "full";
    }>>;
    starterId: z.ZodOptional<z.ZodString>;
    completedSteps: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    goal: z.ZodOptional<z.ZodString>;
    audience: z.ZodOptional<z.ZodString>;
    pack: z.ZodOptional<z.ZodEnum<{
        bakery: "bakery";
        "food-truck": "food-truck";
        home: "home";
        "bar-foh": "bar-foh";
        shops: "shops";
        operations: "operations";
        people: "people";
        care: "care";
    }>>;
}, z.core.$strict>;
export declare function getStarted(input?: unknown): {
    introduction: string;
    starters: Starter[];
    selected: Starter | null;
    helpDirectory: {
        tool: string;
        roles: readonly ["cook", "baker", "dishwasher", "server", "bartender", "supervisor", "manager", "owner", "home-cook"];
        establishments: readonly ["restaurant", "food-truck", "bakery", "cafe", "catering", "bar", "institution", "home"];
        actions: readonly ["explain", "guide", "calculate", "create", "review"];
        areas: {
            id: string;
            title: string;
        }[];
    };
    suggestions: StarterSuggestion[];
    matchNote: string | null;
    nextAction: string | null;
    missingInputs: string[];
    requiredTools: string[];
    pendingWorkflows: string[];
    progress: {
        reportedCompletedSteps: number[];
        nextStep: number | null;
        status: string;
        persisted: boolean;
    } | null;
    fallback: string;
    boundaries: string[];
};
//# sourceMappingURL=getStarted.d.ts.map