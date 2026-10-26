import { z } from 'zod';
import type { Db } from '../data/db.js';
export declare const restaurantProfileSchema: z.ZodObject<{
    country: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    unitSystem: z.ZodOptional<z.ZodEnum<{
        metric: "metric";
        "us-customary": "us-customary";
        mixed: "mixed";
    }>>;
    timezone: z.ZodOptional<z.ZodString>;
    foodCostTargetPercent: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type RestaurantProfile = z.infer<typeof restaurantProfileSchema>;
export declare function getRestaurantProfile(db: Db): RestaurantProfile;
export declare function setRestaurantProfile(db: Db, input: unknown): RestaurantProfile;
export declare const ALLERGEN_STATES: readonly ["contains", "may_contain", "verified_absent", "unknown"];
//# sourceMappingURL=profile.d.ts.map