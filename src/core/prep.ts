// F07 build_prep_plan: deterministic from demand + stock. No invented waste/forecast.
import { parseMicros, formatMicros } from './quantity.js';

export interface PrepDemand {
  recipeId: string;
  servings: string;
  servingUnit: string;
  yieldPerBatch: string; // servings per batch in same unit
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

export function buildPrepPlan(demand: PrepDemand[], stock: PrepStock[]): PrepLine[] {
  if(demand.length>500||stock.length>500)throw new Error('prep input limit exceeded');
  if(new Set(demand.map(d=>d.recipeId)).size!==demand.length||new Set(stock.map(s=>s.recipeId)).size!==stock.length)throw new Error('duplicate prep or stock record');
  return demand.map((d) => {
    const need = parseMicros(d.servings, `demand ${d.recipeId}`);
    const perBatch = parseMicros(d.yieldPerBatch, `yield ${d.recipeId}`);
    if (need < 0n || perBatch <= 0n) throw new Error(`invalid demand for ${d.recipeId}`);
    const s = stock.find((x) => x.recipeId === d.recipeId);
    if(!s)throw new Error(`confirmed stock required for ${d.recipeId}; supply zero only if counted`);
    let have = 0n;
    if (s) {
      if (s.unit.trim().toLowerCase() !== d.servingUnit.trim().toLowerCase()) {
        throw new Error(`stock unit mismatch for ${d.recipeId}`);
      }
      have = parseMicros(s.onHand, `stock ${d.recipeId}`);
      if (have < 0n) throw new Error(`negative stock for ${d.recipeId}`);
    }
    const net = need > have ? need - have : 0n;
    const batches = net === 0n ? 0 : Number((net + perBatch - 1n) / perBatch);
    if(!Number.isSafeInteger(batches))throw new Error('batch count overflow');
    return {
      recipeId: d.recipeId,
      batches,
      toMake: formatMicros(BigInt(batches) * perBatch),
      unit: d.servingUnit,
    };
  });
}
