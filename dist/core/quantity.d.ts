import type { Quantity } from './types.js';
export declare const MICROS = 1000000n;
export declare function parseMicros(amount: string, field: string): bigint;
export declare function formatMicros(m: bigint): string;
export declare function assertUnit(unit: unknown, field?: string): string;
export declare function assertQuantity(q: Quantity, field: string, opts?: {
    allowZero?: boolean;
    allowNegative?: boolean;
}): bigint;
/** Scale micros by rational num/den with half-up. */
export declare function scaleMicros(m: bigint, num: bigint, den: bigint): bigint;
//# sourceMappingURL=quantity.d.ts.map