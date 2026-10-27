import { z } from 'zod';
export interface Starter {
    id: string;
    title: string;
    audience: string;
    prompt: string;
    steps: string[];
    workflowIds: string[];
}
export declare const STARTERS: Starter[];
export declare const getStartedSchema: z.ZodObject<{
    starterId: z.ZodOptional<z.ZodString>;
    completedSteps: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
}, z.core.$strict>;
export declare function getStarted(input?: unknown): {
    introduction: string;
    starters: Starter[];
    selected: Starter | null;
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