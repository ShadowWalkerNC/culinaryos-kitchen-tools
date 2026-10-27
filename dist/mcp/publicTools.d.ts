import type { Purchase, Recipe } from '../core/types.js';
export declare const PUBLIC_TOOL_NAMES: readonly ["find_kitchen_help", "format_menu", "calculate_menu_margins", "calculate_staffing_budget", "calculate_bakery_formula", "get_started", "standardize_recipe_units", "list_capabilities", "get_workflow", "validate_kitchen_data", "scale_recipe", "convert_quantity", "cost_recipe", "compare_purchase_costs", "build_prep_plan", "build_order_proposal", "list_workflows", "calculate_usable_yield", "reconcile_stock", "calculate_event_budget", "validate_prep_capacity"];
export type PublicToolName = (typeof PUBLIC_TOOL_NAMES)[number];
export declare function listCapabilities(): {
    tools: string[];
    dataVersion: string;
    mode: string;
};
export declare function getWorkflow(name: string): {
    pack: "bakery" | "food-truck" | "home" | "bar-foh" | "shops" | "operations" | "people" | "care" | undefined;
    audience: string | undefined;
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
export declare function validateKitchenData(recipes: Recipe[], purchases: Purchase[]): {
    valid: boolean;
    issues: Array<{
        path: string;
        message: string;
    }>;
    cycle: string[] | null;
};
export declare const publicHandlers: Record<PublicToolName, (args: never) => unknown>;
//# sourceMappingURL=publicTools.d.ts.map