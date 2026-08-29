import { recordDecision as storeDecision } from "../bri/decision-store.js";
import { readBri } from "../bri/writer.js";
export function handleRecordDecision(input) {
    const bri = readBri();
    const rule = bri.rules.find((r) => r.id === input.ruleId);
    if (!rule)
        return { success: false, error: "Rule not found" };
    const record = storeDecision({
        ruleId: input.ruleId,
        decision: input.decision,
        previousStatus: rule.approvalStatus,
        userId: input.userId ?? "developer-1",
        userName: input.userName ?? "Developer",
        role: input.role ?? "developer",
        justification: input.justification,
        riskScore: rule.riskScore,
        triage: rule.triage,
    });
    return { success: true, decisionId: record.id, hash: record.hash };
}
//# sourceMappingURL=recordDecision.js.map