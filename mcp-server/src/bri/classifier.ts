import type { BusinessRule } from "./schema.js";

export function classifyRule(rule: BusinessRule): { triage: string; riskScore: number } {
  let riskScore = 0;
  if (rule.evidence.contradiction) riskScore += 40;
  riskScore += (1 - rule.confidence.score) * 30;
  if (rule.affectsModules.length > 3) riskScore += 20;
  if (rule.source.length === 1) riskScore += 10;
  riskScore = Math.min(riskScore, 100);

  let triage: string;
  if (rule.evidence.contradiction) triage = "🔴 must-review";
  else if (rule.confidence.label === "low") triage = "🔴 must-review";
  else if (rule.confidence.label === "medium") triage = "🟡 glance";
  else if (rule.source.length === 1) triage = "🟡 glance";
  else triage = "🟢 auto-approve";

  return { triage, riskScore };
}
