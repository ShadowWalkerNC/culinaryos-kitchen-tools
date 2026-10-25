import type { Db } from './db.js';
import type { Purchase, Recipe } from '../core/types.js';
export declare function getRecipe(db: Db, id: string): Recipe | null;
export declare function listRecipes(db: Db): Recipe[];
export declare function getPurchasesFor(db: Db, ingredientId: string): Purchase[];
export declare function latestPurchaseByIngredient(db: Db): Map<string, Purchase>;
export declare function allRecipes(db: Db): Map<string, Recipe>;
//# sourceMappingURL=queries.d.ts.map