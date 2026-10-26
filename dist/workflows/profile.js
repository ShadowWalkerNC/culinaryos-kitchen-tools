import { z } from 'zod';
export const restaurantProfileSchema = z.object({ country: z.string().min(2).max(80).optional(), region: z.string().min(1).max(100).optional(), currency: z.string().regex(/^[A-Z]{3}$/).optional(), unitSystem: z.enum(['metric', 'us-customary', 'mixed']).optional(), timezone: z.string().min(1).max(100).refine(v => { try {
        new Intl.DateTimeFormat('en', { timeZone: v }).format(new Date());
        return true;
    }
    catch {
        return false;
    } }, 'valid IANA timezone required').optional(), foodCostTargetPercent: z.number().positive().max(100).optional() }).strict();
export function getRestaurantProfile(db) { const row = db.raw.prepare("SELECT data FROM restaurant_profile WHERE id='default'").get(); return row ? restaurantProfileSchema.parse(JSON.parse(row.data)) : {}; }
export function setRestaurantProfile(db, input) { const profile = restaurantProfileSchema.parse(input); db.raw.prepare("INSERT INTO restaurant_profile(id,data,updated_at)VALUES('default',?,?) ON CONFLICT(id)DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at").run(JSON.stringify(profile), new Date().toISOString()); if (profile.timezone) {
    const row = db.raw.prepare("SELECT data FROM workflows_config WHERE id='default'").get();
    const config = row ? JSON.parse(row.data) : { dailyCutoff: '14:00', dailyPrepEnabled: false, costReviewEnabled: false };
    db.raw.prepare("INSERT INTO workflows_config(id,data,updated_at)VALUES('default',?,?)ON CONFLICT(id)DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at").run(JSON.stringify({ ...config, timezone: profile.timezone }), new Date().toISOString());
} return profile; }
export const ALLERGEN_STATES = ['contains', 'may_contain', 'verified_absent', 'unknown'];
//# sourceMappingURL=profile.js.map