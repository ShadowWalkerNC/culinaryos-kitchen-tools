// F01 money helpers: integer cents only.
export function assertCents(n, field) {
    if (typeof n !== 'number' || !Number.isSafeInteger(n))
        throw new Error(`${field} must be safe integer cents`);
    if (n < 0)
        throw new Error(`${field} must be >= 0`);
    return n;
}
export function assertCurrency(code, field = 'currency') {
    if (typeof code !== 'string' || !/^[A-Z]{3}$/.test(code))
        throw new Error(`${field} must be ISO 4217 like USD`);
    return code;
}
/** Multiply cents by micros ratio with half-up rounding at the documented boundary. */
export function prorateCents(costCents, neededMicros, usableMicros) {
    if (usableMicros <= 0n)
        throw new Error('usable quantity must be > 0');
    if (neededMicros < 0n)
        throw new Error('needed quantity must be >= 0');
    const num = BigInt(costCents) * neededMicros;
    // half-up: (num + den/2) / den
    const q = (num + usableMicros / 2n) / usableMicros;
    if (q > BigInt(Number.MAX_SAFE_INTEGER))
        throw new Error('cost overflow');
    return Number(q);
}
//# sourceMappingURL=money.js.map