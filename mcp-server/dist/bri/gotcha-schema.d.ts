export interface GotchaRecord {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    triggerCount: number;
    active: boolean;
    addedAt: string;
    addedBy: string;
    relatedRules: string[];
    /** Auto-learning fields (from kuma pattern) */
    autoLearning?: {
        /** How was this gotcha discovered */
        discoveredFrom: {
            type: "decision-reversal" | "contradiction" | "manual-entry" | "incident" | "audit" | "pattern-detection";
            reference?: string;
            description: string;
        };
        /** Which rules/modules this applies to */
        appliesTo: {
            ruleIds?: string[];
            modules?: string[];
            categories?: string[];
        };
        /** How many times has this been triggered */
        lastTriggered?: string;
        /** Related gotchas */
        relatedGotchas?: string[];
    };
}
export interface GotchaStore {
    version: string;
    gotchas: GotchaRecord[];
    summary: {
        totalGotchas: number;
        active: number;
        byCategory: Record<string, number>;
        bySeverity: Record<string, number>;
    };
}
//# sourceMappingURL=gotcha-schema.d.ts.map