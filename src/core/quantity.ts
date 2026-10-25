// F02 quantities: decimal strings -> scaled bigint micros (6dp). No float math.
import type { Quantity } from './types.js';

export const MICROS = 1_000_000n;

export function parseMicros(amount: string, field: string): bigint {
  if (typeof amount !== 'string' || amount.length > 32) throw new Error(`${field} exceeds quantity limit`);
  if (typeof amount !== 'string' || !/^-?\d+(\.\d{1,6})?$/.test(amount.trim())) {
    throw new Error(`${field} must be decimal string with up to 6 places`);
  }
  const neg = amount.trim().startsWith('-');
  const [i, f = ''] = amount.trim().replace('-', '').split('.') as [string, string?];
  const frac = (f ?? '').padEnd(6, '0');
  const v = BigInt(i === '' ? '0' : i) * MICROS + BigInt(frac === '' ? '0' : frac);
  return neg ? -v : v;
}

export function formatMicros(m: bigint): string {
  const neg = m < 0n;
  const a = neg ? -m : m;
  const i = a / MICROS;
  const f = (a % MICROS).toString().padStart(6, '0').replace(/0+$/, '');
  return (neg ? '-' : '') + i.toString() + (f === '' ? '' : '.' + f);
}

export function assertUnit(unit: unknown, field = 'unit'): string {
  if (typeof unit !== 'string' || unit.trim() === '' || unit.length > 32) throw new Error(`${field} must be non-empty unit`);
  return unit.trim();
}

export function assertQuantity(q: Quantity, field: string, opts: { allowZero?: boolean; allowNegative?: boolean } = {}): bigint {
  const micros = parseMicros(q.amount, `${field}.amount`);
  assertUnit(q.unit, `${field}.unit`);
  if (!opts.allowNegative && micros < 0n) throw new Error(`${field}.amount must be >= 0`);
  if (!opts.allowZero && micros === 0n) throw new Error(`${field}.amount must be > 0`);
  if (micros < 0n && opts.allowNegative !== true) throw new Error(`${field}.amount invalid`);
  return micros;
}

/** Scale micros by rational num/den with half-up. */
export function scaleMicros(m: bigint, num: bigint, den: bigint): bigint {
  if (den <= 0n) throw new Error('scale denominator must be > 0');
  if (m < 0n || num < 0n) throw new Error('scale inputs must be >= 0');
  return (m * num + den / 2n) / den;
}
