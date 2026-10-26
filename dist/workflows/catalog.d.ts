export declare const LIBRARY_VERSION: "0.2.0";
export declare const DATA_VERSION: "v1";
export declare const LICENSE: "MIT";
export interface WorkflowDefinition {
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
}
export declare const WORKFLOW_CATALOG: WorkflowDefinition[];
export declare const WORKFLOW_NAMES: readonly ["agency-chef-onboarding-generator", "allergen-management-system", "apprenticeship-tracker", "banquet-event-order", "bar-cocktail-recipe-builder", "burnout-stress-risk-assessment", "canape-reception-planner", "capacity-aware-prep", "catering-quotation", "chef-personal-brand-builder", "chef-wellbeing-check-in", "complaint-handling-resolution-log", "corporate-event-menu-planner", "coshh-chemical-safety", "daily-brief-generator", "daily-close-review", "data-reconciliation", "dietary-requirements-tracker", "disciplinary-documentation-helper", "dish-development-brief", "equipment-maintenance-log", "event-catering-brief", "event-equipment-kit-list", "event-run-of-show", "event-staffing-plan", "foh-service-brief", "food-safety-incident-report", "food-truck-event-profitability", "guest-feedback-analyser", "haccp-checklist-generator", "invoice-reconciliation", "kitchen-budget-planner", "kitchen-culture-health-check", "kitchen-ethos-doc-generator", "menu-description-writer", "menu-margin-review", "nutritional-information-calculator", "onboarding", "ordering-proposals", "partnership-growth-finder", "plate-photography-brief", "post-event-report", "prep-planning", "price-increase-impact-calculator", "private-dining-setup-guide", "purchase-price-review", "recipe-compliance-checker", "recipe-costing", "recipe-dependency-impact", "recipe-documentation", "recipe-scaling", "rota-builder", "seasonal-menu-planner", "social-media-content-generator", "sop-drafting", "staff-performance-review", "station-setup-checklist", "stock-take-template-generator", "stock-variance", "supplier-performance-scorecard", "supplier-substitution-review", "table-turnover-pacing-plan", "tasting-menu-builder", "team-meeting-agenda-builder", "tender-brief-new-suppliers", "training-plan-generator", "trial-shift-assessment", "upselling-training-script", "usable-yield-verification", "vip-special-guest-brief", "waste-review", "wedding-catering-checklist", "wine-beverage-pairing-guide"];
export type WorkflowName = (typeof WORKFLOW_NAMES)[number];
export declare const WORKFLOW_ZONES: readonly ["Connected Workflows", "Events and Banqueting", "FOH and Guest Experience", "Kitchen Operations", "Menu and Product Development", "People and Training", "Suppliers and Finance", "Wellbeing and Social Media", "Workspace"];
export type WorkflowZone = (typeof WORKFLOW_ZONES)[number];
export declare function listCatalogEntries(): WorkflowDefinition[];
export declare function isWorkflowName(name: string): name is WorkflowName;
export declare function getWorkflowEntry(name: string): WorkflowDefinition;
//# sourceMappingURL=catalog.d.ts.map