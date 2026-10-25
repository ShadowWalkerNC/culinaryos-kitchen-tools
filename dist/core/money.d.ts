export declare function assertCents(n: unknown, field: string): number;
export declare function assertCurrency(code: unknown, field?: string): string;
/** Multiply cents by micros ratio with half-up rounding at the documented boundary. */
export declare function prorateCents(costCents: number, neededMicros: bigint, usableMicros: bigint): number;
//# sourceMappingURL=money.d.ts.map