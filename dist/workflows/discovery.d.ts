import { z } from 'zod';
export declare const listWorkflowsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    zone: z.ZodOptional<z.ZodString>;
    offset: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export declare const workflowRequestSchema: z.ZodObject<{
    name: z.ZodString;
    profile: z.ZodOptional<z.ZodObject<{
        country: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        unitSystem: z.ZodOptional<z.ZodEnum<{
            metric: "metric";
            "us-customary": "us-customary";
            mixed: "mixed";
        }>>;
        timezone: z.ZodOptional<z.ZodString>;
        foodCostTargetPercent: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare function listWorkflows(input?: unknown): {
    total: number;
    offset: number;
    items: {
        id: string;
        title: string;
        zone: string;
        summary: string;
        aliases: string[];
        coverageId?: string;
        inputs: string[];
        outputs: string[];
        tools: string[];
    }[];
    nextOffset: number | null;
};
export declare function workflowGuidance(input: unknown): {
    instructions: string | undefined;
    profile: {
        country?: string | undefined;
        region?: string | undefined;
        currency?: string | undefined;
        unitSystem?: "metric" | "us-customary" | "mixed" | undefined;
        timezone?: string | undefined;
        foodCostTargetPercent?: number | undefined;
    };
    unresolvedSettings: string[];
    steps: string[];
    approvals: string;
    connection: string;
    id: string;
    title: string;
    zone: string;
    summary: string;
    aliases: string[];
    coverageId?: string;
    inputs: string[];
    outputs: string[];
    tools: string[];
    example: {
        input: string;
        output: string;
    };
    blockedExample: {
        input: string;
        output: string;
    };
};
//# sourceMappingURL=discovery.d.ts.map