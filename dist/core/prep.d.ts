export interface PrepDemand {
    recipeId: string;
    servings: string;
    servingUnit: string;
    yieldPerBatch: string;
}
export interface PrepStock {
    recipeId: string;
    onHand: string;
    unit: string;
}
export interface PrepLine {
    recipeId: string;
    batches: number;
    toMake: string;
    unit: string;
    uncovered?: string;
}
export declare function buildPrepPlan(demand: PrepDemand[], stock: PrepStock[]): PrepLine[];
//# sourceMappingURL=prep.d.ts.map