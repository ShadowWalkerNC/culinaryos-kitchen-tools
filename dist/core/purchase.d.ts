export interface PurchaseOption {
    currency: string;
    id: string;
    costCents: number;
    qtyAmount: string;
    qtyUnit: string;
    effectiveDate: string;
}
export interface PurchaseComparison {
    id: string;
    unitCostCentsPerUnit: number;
    rank: number;
    note?: string;
}
export declare function comparePurchaseCosts(options: PurchaseOption[]): PurchaseComparison[];
//# sourceMappingURL=purchase.d.ts.map