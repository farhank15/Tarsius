import type { BriDocument, BusinessRule } from "./schema.js";
export declare function readBri(): BriDocument;
export declare function writeBri(bri: BriDocument): void;
export declare function appendRule(rule: BusinessRule): BriDocument;
export declare function updateRuleApproval(ruleId: string, status: "approved" | "rejected"): BriDocument;
//# sourceMappingURL=writer.d.ts.map