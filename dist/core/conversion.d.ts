export interface ConversionRequest {
    amount: string;
    fromUnit: string;
    toUnit: string;
    factor?: string;
    factorBasis?: string;
}
export declare function canonicalUnit(unit: string): string;
export declare function unitRatio(from: string, to: string, factor?: string, basis?: string): [bigint, bigint];
export declare function convertQuantity(req: ConversionRequest): {
    amount: string;
    unit: string;
    basis: string;
};
//# sourceMappingURL=conversion.d.ts.map