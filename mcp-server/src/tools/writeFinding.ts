import type { BusinessRule } from "../bri/schema.js";
import { appendRule } from "../bri/writer.js";
import { classifyRule } from "../bri/classifier.js";

export interface WriteFindingInput {
  ruleId: string; module: string; type: "explicit" | "implicit";
  title: string; description: string; confidence: "high" | "medium" | "low";
  source: ("code" | "document")[]; filePath: string;
  startLine: number; endLine: number; docQuote?: string;
  contradiction?: boolean; contradictionNote?: string;
  category?: string; affectsModules?: string[];
}

export function handleWriteFinding(input: WriteFindingInput) {
  const confidenceScore = input.confidence === "high" ? 0.9 : input.confidence === "medium" ? 0.6 : 0.3;
  const rule: BusinessRule = {
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
  rule.triage = triage as BusinessRule["triage"];
  rule.riskScore = riskScore;
  const bri = appendRule(rule);
  return { success: true, ruleId: rule.id, triage: rule.triage, riskScore: rule.riskScore, totalRules: bri.summary.totalRules };
}
