import { appendRule } from "../bri/writer.js";
import { classifyRule } from "../bri/classifier.js";
export function handleWriteFinding(input) {
    const confidenceScore = input.confidence === "high" ? 0.9 : input.confidence === "medium" ? 0.6 : 0.3;
    const rule = {
        id: input.ruleId, type: input.type, title: input.title, description: input.description,
        confidence: { label: input.confidence, score: confidenceScore },
        triage: "🟢 auto-approve", riskScore: 0, source: input.source,
        evidence: { codeLocation: { file: input.filePath, startLine: input.startLine, endLine: input.endLine },
            docQuote: input.docQuote ?? null, contradiction: input.contradiction ?? false,
            contradictionNote: input.contradictionNote },
        approvalStatus: "pending", category: input.category ?? "general",
        affectsModules: input.affectsModules ?? [],
    };
    const { triage, riskScore } = classifyRule(rule);
    rule.triage = triage;
    rule.riskScore = riskScore;
    const bri = appendRule(rule);
    return { success: true, ruleId: rule.id, triage: rule.triage, riskScore: rule.riskScore, totalRules: bri.summary.totalRules };
}
//# sourceMappingURL=writeFinding.js.map