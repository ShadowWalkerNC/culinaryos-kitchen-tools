export declare const BRAND: "CulinaryOS Interagency";
export declare const BRAND_ALIAS: "Open Kitchen Toolkit";
export declare const PACK_IDS: readonly ["home", "bakery", "food-truck", "bar-foh", "shops", "operations", "people", "care"];
export type PackId = (typeof PACK_IDS)[number];
export interface WorkflowPack {
    id: PackId;
    label: string;
    audience: string;
    summary: string;
    workflowIds: string[];
}
export declare const EXPECTED_NEW_WORKFLOW_IDS: readonly ["home-cooking-timeline", "recipe-equipment-adaptation", "dough-temperature-trial-log", "proofing-oven-calendar", "food-truck-event-go-no-go", "event-application-readiness", "beverage-batch-dilution", "draft-beer-yield-loss", "delivery-platform-net-margin", "product-recall-trace-drill", "multilingual-service-brief", "campaign-sales-review", "approved-diet-menu-screen"];
export declare const INTERAGENCY_CALCULATOR_TOOLS: readonly ["calculate_menu_margins", "calculate_staffing_budget", "calculate_bakery_formula"];
export declare const PACK_CORE_IDS: Record<PackId, readonly string[]>;
export declare const WORKFLOW_PACKS: WorkflowPack[];
export declare function isPackId(value: unknown): value is PackId;
export declare function packForWorkflow(workflowId: string): WorkflowPack | undefined;
export declare function packIdForWorkflow(workflowId: string): PackId | undefined;
export declare function audienceForWorkflow(workflowId: string): string | undefined;
export declare function allPackWorkflowIds(): string[];
//# sourceMappingURL=packs.d.ts.map