import type { GotchaStore, GotchaRecord } from "./gotcha-schema.js";
export declare function readGotchas(): GotchaStore;
export declare function writeGotchas(store: GotchaStore): void;
export declare function addGotcha(input: {
    title: string;
    description: string;
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    addedBy: string;
    relatedRules: string[];
}): GotchaRecord;
export declare function checkGotchas(input: {
    category?: string;
    ruleId?: string;
}): GotchaRecord[];
//# sourceMappingURL=gotcha-store.d.ts.map