import type { BusinessRule } from "../bri/schema.js";
export declare function heuristicVerify(approvedRules: BusinessRule[], newCode: string): {
    overallConfidence: "high" | "medium" | "low";
    score: number;
    deviations: {
        ruleId: string;
        type: string;
        detail: string;
    }[];
};
//# sourceMappingURL=heuristic.d.ts.map