export interface OrderLine {
    ingredientId: string;
    par: string;
    onHand: string;
    onOrder: string;
    unit: string;
    packSize?: string;
}
export interface OrderProposal {
    ingredientId: string;
    orderQty: string;
    unit: string;
    packs?: number;
    note?: string;
}
export declare function buildOrderProposal(lines: OrderLine[]): OrderProposal[];
//# sourceMappingURL=ordering.d.ts.map