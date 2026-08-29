import type { DecisionStore, DecisionRecord } from "./decision-schema.js";
export declare function readDecisions(): DecisionStore;
export declare function writeDecisions(store: DecisionStore): void;
export declare function recordDecision(input: {
    ruleId: string;
    decision: "approved" | "rejected";
    previousStatus: "pending" | "approved" | "rejected";
    userId: string;
    userName: string;
    role: string;
    justification: string;
    riskScore: number;
    triage: string;
    gotchaId?: string;
    rationale?: {
        reason: string;
        context: string;
        consequence?: string;
        consulted?: string[];
    };
}): DecisionRecord;
//# sourceMappingURL=decision-store.d.ts.map