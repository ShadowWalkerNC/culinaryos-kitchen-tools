import { z } from 'zod';
export declare const KITCHEN_ROLES: readonly ["cook", "baker", "dishwasher", "server", "bartender", "supervisor", "manager", "owner", "home-cook"];
export declare const KITCHEN_ESTABLISHMENTS: readonly ["restaurant", "food-truck", "bakery", "cafe", "catering", "bar", "institution", "home"];
export declare const HELP_ACTIONS: readonly ["explain", "guide", "calculate", "create", "review"];
type Role = typeof KITCHEN_ROLES[number];
type Establishment = typeof KITCHEN_ESTABLISHMENTS[number];
export type CoverageState = 'complete' | 'partial' | 'guidance-only' | 'integration-dependent' | 'absent';
export declare const REFERENCE_CATALOG: readonly [{
    readonly id: "bc-kitchen";
    readonly title: "Basic Kitchen and Food Service Management";
    readonly publisher: "BC Cook Articulation Committee / BCcampus";
    readonly url: "https://opentextbc.ca/basickitchenandfoodservicemanagement/";
    readonly jurisdiction: "Canadian culinary education; local rules require separate verification";
    readonly revision: null;
    readonly retrievedAt: "2026-10-27";
    readonly license: "CC BY; inspect linked license and attribution requirements before adapting";
    readonly use: "Reference links and original summaries; no manual bundled";
}, {
    readonly id: "fsa-catering";
    readonly title: "Safer food, better business for caterers";
    readonly publisher: "Food Standards Agency";
    readonly url: "https://www.gov.uk/government/publications/safer-food-better-business-for-caterers";
    readonly jurisdiction: "England, Northern Ireland and Wales";
    readonly revision: null;
    readonly retrievedAt: "2026-10-27";
    readonly license: "Verify document-specific reuse terms before copying";
    readonly use: "Jurisdiction-specific management guidance; no manual bundled";
}, {
    readonly id: "fsa-diary";
    readonly title: "Safer food, better business diary introduction";
    readonly publisher: "Food Standards Agency";
    readonly url: "https://www.food.gov.uk/sites/default/files/media/document/sfbb-diary-02-introduction_4.pdf";
    readonly jurisdiction: "Use with the applicable FSA catering pack";
    readonly revision: null;
    readonly retrievedAt: "2026-10-27";
    readonly license: "Verify document-specific reuse terms before copying";
    readonly use: "Original recordkeeping workflow requirements; no PDF bundled";
}, {
    readonly id: "sba-management";
    readonly title: "Manage your business";
    readonly publisher: "US Small Business Administration";
    readonly url: "https://www.sba.gov/counseling/manage-your-business/";
    readonly jurisdiction: "United States; business guidance";
    readonly revision: null;
    readonly retrievedAt: "2026-10-27";
    readonly license: "Check page and third-party material terms before copying";
    readonly use: "Business records and marketing review requirements";
}, {
    readonly id: "illinois-substitutions";
    readonly title: "Recipe substitutions";
    readonly publisher: "University of Illinois Extension";
    readonly url: "https://extension.illinois.edu/food/recipe-substitutions";
    readonly jurisdiction: "Home cooking education; not clinical or preservation validation";
    readonly revision: null;
    readonly retrievedAt: "2026-10-27";
    readonly license: "Reference only; no redistribution permission assumed";
    readonly use: "Ingredient-function questions and original guidance";
}, {
    readonly id: "fda-health";
    readonly title: "Employee Health and Personal Hygiene Handbook";
    readonly publisher: "US Food and Drug Administration";
    readonly url: "https://www.fda.gov/food/retail-food-industryregulatory-assistance-training/retail-food-protection-employee-health-and-personal-hygiene-handbook";
    readonly jurisdiction: "United States; confirm adopted local requirements";
    readonly revision: null;
    readonly retrievedAt: "2026-10-27";
    readonly license: "Check document-specific and third-party terms before redistribution";
    readonly use: "Employee health and hygiene source routing";
}];
type Area = {
    id: string;
    title: string;
    roles: readonly Role[];
    establishments: readonly Establishment[];
    questions: string[];
    workflowIds: string[];
    outputs: string[];
    references: string[];
    calculators: string[];
    gap: string;
};
export declare const HELP_AREAS: Area[];
export declare const helpSchema: z.ZodObject<{
    view: z.ZodDefault<z.ZodEnum<{
        quick: "quick";
        full: "full";
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
    goal: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        cook: "cook";
        baker: "baker";
        dishwasher: "dishwasher";
        server: "server";
        bartender: "bartender";
        supervisor: "supervisor";
        manager: "manager";
        owner: "owner";
        "home-cook": "home-cook";
    }>>;
    establishment: z.ZodOptional<z.ZodEnum<{
        bakery: "bakery";
        "food-truck": "food-truck";
        home: "home";
        restaurant: "restaurant";
        cafe: "cafe";
        catering: "catering";
        bar: "bar";
        institution: "institution";
    }>>;
    action: z.ZodDefault<z.ZodEnum<{
        explain: "explain";
        guide: "guide";
        calculate: "calculate";
        create: "create";
        review: "review";
    }>>;
    area: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare function workflowCoverage(id: string): {
    roles: ("cook" | "baker" | "dishwasher" | "server" | "bartender" | "supervisor" | "manager" | "owner" | "home-cook")[];
    establishments: ("bakery" | "food-truck" | "home" | "restaurant" | "cafe" | "catering" | "bar" | "institution")[];
    areas: string[];
    referenceIds: string[];
    referenceMapping: string;
    status: CoverageState;
    execution: string;
};
export declare function findKitchenHelp(input?: unknown): {
    purpose: string;
    action: "explain" | "guide" | "calculate" | "create" | "review";
    roles: readonly ["cook", "baker", "dishwasher", "server", "bartender", "supervisor", "manager", "owner", "home-cook"];
    establishments: readonly ["restaurant", "food-truck", "bakery", "cafe", "catering", "bar", "institution", "home"];
    actions: readonly ["explain", "guide", "calculate", "create", "review"];
    matching: string;
    areas: {
        questions: string[];
        status: CoverageState;
        workflows: ({
            roles: ("cook" | "baker" | "dishwasher" | "server" | "bartender" | "supervisor" | "manager" | "owner" | "home-cook")[];
            establishments: ("bakery" | "food-truck" | "home" | "restaurant" | "cafe" | "catering" | "bar" | "institution")[];
            areas: string[];
            referenceIds: string[];
            referenceMapping: string;
            status: CoverageState;
            execution: string;
            id: string;
            available: boolean;
        } | {
            status: CoverageState;
            id: string;
            available: boolean;
        })[];
        references: ({
            readonly id: "bc-kitchen";
            readonly title: "Basic Kitchen and Food Service Management";
            readonly publisher: "BC Cook Articulation Committee / BCcampus";
            readonly url: "https://opentextbc.ca/basickitchenandfoodservicemanagement/";
            readonly jurisdiction: "Canadian culinary education; local rules require separate verification";
            readonly revision: null;
            readonly retrievedAt: "2026-10-27";
            readonly license: "CC BY; inspect linked license and attribution requirements before adapting";
            readonly use: "Reference links and original summaries; no manual bundled";
        } | {
            readonly id: "fsa-catering";
            readonly title: "Safer food, better business for caterers";
            readonly publisher: "Food Standards Agency";
            readonly url: "https://www.gov.uk/government/publications/safer-food-better-business-for-caterers";
            readonly jurisdiction: "England, Northern Ireland and Wales";
            readonly revision: null;
            readonly retrievedAt: "2026-10-27";
            readonly license: "Verify document-specific reuse terms before copying";
            readonly use: "Jurisdiction-specific management guidance; no manual bundled";
        } | {
            readonly id: "fsa-diary";
            readonly title: "Safer food, better business diary introduction";
            readonly publisher: "Food Standards Agency";
            readonly url: "https://www.food.gov.uk/sites/default/files/media/document/sfbb-diary-02-introduction_4.pdf";
            readonly jurisdiction: "Use with the applicable FSA catering pack";
            readonly revision: null;
            readonly retrievedAt: "2026-10-27";
            readonly license: "Verify document-specific reuse terms before copying";
            readonly use: "Original recordkeeping workflow requirements; no PDF bundled";
        } | {
            readonly id: "sba-management";
            readonly title: "Manage your business";
            readonly publisher: "US Small Business Administration";
            readonly url: "https://www.sba.gov/counseling/manage-your-business/";
            readonly jurisdiction: "United States; business guidance";
            readonly revision: null;
            readonly retrievedAt: "2026-10-27";
            readonly license: "Check page and third-party material terms before copying";
            readonly use: "Business records and marketing review requirements";
        } | {
            readonly id: "illinois-substitutions";
            readonly title: "Recipe substitutions";
            readonly publisher: "University of Illinois Extension";
            readonly url: "https://extension.illinois.edu/food/recipe-substitutions";
            readonly jurisdiction: "Home cooking education; not clinical or preservation validation";
            readonly revision: null;
            readonly retrievedAt: "2026-10-27";
            readonly license: "Reference only; no redistribution permission assumed";
            readonly use: "Ingredient-function questions and original guidance";
        } | {
            readonly id: "fda-health";
            readonly title: "Employee Health and Personal Hygiene Handbook";
            readonly publisher: "US Food and Drug Administration";
            readonly url: "https://www.fda.gov/food/retail-food-industryregulatory-assistance-training/retail-food-protection-employee-health-and-personal-hygiene-handbook";
            readonly jurisdiction: "United States; confirm adopted local requirements";
            readonly revision: null;
            readonly retrievedAt: "2026-10-27";
            readonly license: "Check document-specific and third-party terms before redistribution";
            readonly use: "Employee health and hygiene source routing";
        })[];
        capabilities: {
            guidance: string;
            calculationTools: string[];
            documents: string;
            persistence: string;
            externalSubmission: string;
        };
        id: string;
        title: string;
        roles: readonly Role[];
        establishments: readonly Establishment[];
        workflowIds: string[];
        outputs: string[];
        calculators: string[];
        gap: string;
    }[];
    outputContract: {
        basis: string[];
        required: string[];
        actionSteps: string[];
    };
    fallback: string;
    referencePolicy: string;
    skillDraftPolicy: string;
    saved: boolean;
    executed: boolean;
};
export {};
//# sourceMappingURL=help.d.ts.map