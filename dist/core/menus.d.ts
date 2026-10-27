import { z } from 'zod';
export declare const MENU_TEMPLATES: readonly [{
    readonly id: "restaurant";
    readonly name: "Restaurant";
    readonly description: "Quiet two-column menu with section rules, restrained headings and aligned prices.";
}, {
    readonly id: "counter";
    readonly name: "Cafe / food truck";
    readonly description: "Single-column list with larger item names and clear prices.";
}, {
    readonly id: "bakery";
    readonly name: "Bakery price list";
    readonly description: "Compact two-column list with room for user-supplied unit labels.";
}, {
    readonly id: "prix-fixe";
    readonly name: "Prix fixe";
    readonly description: "Centered course sections with one explicit menu price.";
}];
export declare const menuSchema: z.ZodObject<{
    templateId: z.ZodEnum<{
        bakery: "bakery";
        restaurant: "restaurant";
        counter: "counter";
        "prix-fixe": "prix-fixe";
    }>;
    paper: z.ZodEnum<{
        Letter: "Letter";
        A4: "A4";
    }>;
    title: z.ZodString;
    businessName: z.ZodOptional<z.ZodString>;
    subtitle: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    locale: z.ZodDefault<z.ZodString>;
    menuPriceCents: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    footer: z.ZodOptional<z.ZodString>;
    sections: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            priceCents: z.ZodNullable<z.ZodNumber>;
            priceLabel: z.ZodOptional<z.ZodString>;
            unitLabel: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type MenuInput = z.input<typeof menuSchema>;
export declare function formatMenu(input: unknown): {
    template: {
        readonly id: "restaurant";
        readonly name: "Restaurant";
        readonly description: "Quiet two-column menu with section rules, restrained headings and aligned prices.";
    } | {
        readonly id: "counter";
        readonly name: "Cafe / food truck";
        readonly description: "Single-column list with larger item names and clear prices.";
    } | {
        readonly id: "bakery";
        readonly name: "Bakery price list";
        readonly description: "Compact two-column list with room for user-supplied unit labels.";
    } | {
        readonly id: "prix-fixe";
        readonly name: "Prix fixe";
        readonly description: "Centered course sections with one explicit menu price.";
    } | undefined;
    paper: "Letter" | "A4";
    currency: string | null;
    contentStatus: string;
    humanReviewRequired: boolean;
    publicationBlockers: string[];
    html: string;
    plainText: string;
    saved: boolean;
    basis: string;
};
//# sourceMappingURL=menus.d.ts.map