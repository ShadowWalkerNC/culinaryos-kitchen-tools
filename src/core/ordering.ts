// F07 build_order_proposal: deterministic reorder from par + on-hand + on-order.
import { parseMicros, formatMicros } from './quantity.js';

export interface OrderLine {
  ingredientId: string;
  par: string;
  onHand: string;
  onOrder: string;
  unit: string;
  packSize?: string; // optional explicit pack rounding basis
}

export interface OrderProposal {
  ingredientId: string;
  orderQty: string;
  unit: string;
  packs?: number;
  note?: string;
}

export function buildOrderProposal(lines: OrderLine[]): OrderProposal[] {
  if(lines.length>500||new Set(lines.map(l=>l.ingredientId)).size!==lines.length)throw new Error('duplicate or oversized order proposal');
  return lines.map((l) => {
    const par = parseMicros(l.par, `${l.ingredientId}.par`);
    const hand = parseMicros(l.onHand, `${l.ingredientId}.onHand`);
    const ordered = parseMicros(l.onOrder, `${l.ingredientId}.onOrder`);
    if (par < 0n || hand < 0n || ordered < 0n) throw new Error(`negative values for ${l.ingredientId}`);
    const net = par - hand - ordered;
    const qty = net > 0n ? net : 0n;
    if (!l.packSize) return { ingredientId: l.ingredientId, orderQty: formatMicros(qty), unit: l.unit };
    const pack = parseMicros(l.packSize, `${l.ingredientId}.packSize`);
    if (pack <= 0n) throw new Error(`packSize must be > 0 for ${l.ingredientId}`);
    const packs = qty === 0n ? 0 : Number((qty + pack - 1n) / pack);
    if(!Number.isSafeInteger(packs))throw new Error('pack count overflow');
    return {
      ingredientId: l.ingredientId,
      orderQty: formatMicros(BigInt(packs) * pack),
      unit: l.unit,
      packs,
      note: `rounded to supplied pack size ${l.packSize} ${l.unit}`,
    };
  });
}
