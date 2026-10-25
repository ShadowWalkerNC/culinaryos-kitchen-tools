import type { Purchase, Recipe } from '../core/types.js';
export declare const PUBLIC_TOOL_NAMES: readonly ["list_capabilities", "get_workflow", "validate_kitchen_data", "scale_recipe", "convert_quantity", "cost_recipe", "compare_purchase_costs", "build_prep_plan", "build_order_proposal"];
export type PublicToolName = (typeof PUBLIC_TOOL_NAMES)[number];
export declare function listCapabilities(): {
    tools: string[];
    dataVersion: string;
    mode: string;
};
export declare function getWorkflow(name: string): {
    title: string;
    steps: string[];
    approvals: string;
    instructions: string;
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