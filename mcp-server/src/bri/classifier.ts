import type { BusinessRule, TriageLevel } from "./schema.js";

export interface ClassificationResult {
  triage: TriageLevel;
  riskScore: number;
}

/**
 * Classify a business rule by computing a risk score and assigning a triage level.
 *
 * Scoring:
 *   Contradiction present    → +40
 *   (1 - confidence.score) * 30
 *   Affects > 3 modules      → +20
 *   Single source            → +10
 *   Cap at 100
 *
 * Triage:
 *   Contradiction OR confidence.label == "low"    → 🔴 must-review
 *   confidence.label == "medium" OR single source → 🟡 glance
 *   Otherwise                                     → 🟢 auto-approve
 */
export function classifyRule(rule: BusinessRule): ClassificationResult {
  let score = 0;

  if (rule.evidence.contradiction) {
    score += 40;
  }

  score += (1 - rule.confidence.score) * 30;

  if (rule.affectsModules.length > 3) {
    score += 20;
  }

  if (rule.source.length === 1) {
    score += 10;
  }

  const riskScore = Math.min(Math.round(score), 100);

  let triage: TriageLevel;

  if (rule.evidence.contradiction || rule.confidence.label === "low") {
    triage = "🔴 must-review";
  } else if (rule.confidence.label === "medium" || rule.source.length === 1) {
    triage = "🟡 glance";
  } else {
    triage = "🟢 auto-approve";
  }

  return { triage, riskScore };
}
