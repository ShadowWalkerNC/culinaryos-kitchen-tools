export function getRecipe(db, id) {
    const row = db.raw.prepare('SELECT data FROM recipes WHERE id = ?').get(id);
    return row ? JSON.parse(row.data) : null;
}
export function listRecipes(db) {
    const rows = db.raw.prepare('SELECT data FROM recipes ORDER BY id').all();
    return rows.map((r) => JSON.parse(r.data));
}
export function getPurchasesFor(db, ingredientId) {
    const rows = db.raw.prepare('SELECT data FROM purchases WHERE ingredient_id = ? ORDER BY data').all(ingredientId);
    return rows.map((r) => JSON.parse(r.data));
}
export function latestPurchaseByIngredient(db) {
    const rows = db.raw.prepare('SELECT data FROM purchases').all();
    const map = new Map();
    for (const r of rows) {
        const p = JSON.parse(r.data);
        if (p.effectiveDate > new Date().toISOString().slice(0, 10))
            continue;
        const cur = map.get(p.ingredientId);
        if (!cur || p.effectiveDate >= cur.effectiveDate)
            map.set(p.ingredientId, p);
    }
    return map;
}
export function allRecipes(db) {
    const m = new Map();
    for (const r of listRecipes(db))
        m.set(r.id, r);
    return m;
}
//# sourceMappingURL=queries.js.map