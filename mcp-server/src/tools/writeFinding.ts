import { classifyRule } from "../bri/classifier.js";
import { appendRule } from "../bri/writer.js";
import { checkGotchas } from "../bri/gotcha-store.js";
import type { BusinessRule, RuleType, SourceLabel } from "../bri/schema.js";

export interface WriteFindingInput {
  ruleId: string;
  module: string;
  type: RuleType;
  title: string;
  description: string;
  confidence: "high" | "medium" | "low";
  source: SourceLabel[];
  filePath: string;
  startLine: number;
  endLine: number;
  category?: string;
  affectsModules?: string[];
  docQuote?: string;
  contradiction?: boolean;
  contradictionNote?: string;
}

export interface WriteFindingResult {
  rule: BusinessRule;
  gotchas: Awaited<ReturnType<typeof checkGotchas>>;
}

/**
 * Convert raw tool input into a BusinessRule, classify it, append to the BRI,
 * and check for matching gotchas. Returns the stored rule and any triggered gotchas.
 */
export async function handleWriteFinding(
  input: WriteFindingInput
): Promise<WriteFindingResult> {
  // Build a provisional rule so we can classify it before persisting
  const provisional: BusinessRule = {
    id: input.ruleId,
    type: input.type,
    title: input.title,
    description: input.description,
    confidence: {
      label: input.confidence,
      method: input.source.length > 1 ? "dual-source" : "code-analysis",
      score:
        input.confidence === "high"
          ? 0.9
          : input.confidence === "medium"
            ? 0.6
            : 0.3,
    },
    triage: "🟡 glance", // placeholder — overwritten by classifier
    riskScore: 0, // placeholder — overwritten by classifier
    source: input.source,
    evidence: {
      codeLocation: {
        file: input.filePath,
        startLine: input.startLine,
        endLine: input.endLine,
      },
      docQuote: input.docQuote ?? null,
      contradiction: input.contradiction ?? false,
      contradictionNote: input.contradictionNote,
    },
    approvalStatus: "pending",
    category: input.category ?? "general",
    affectsModules: input.affectsModules ?? [input.module],
  };

  const { triage, riskScore } = classifyRule(provisional);
  provisional.triage = triage;
  provisional.riskScore = riskScore;

  const rule = await appendRule(provisional);
  const gotchas = await checkGotchas(input.ruleId, input.category);

  return { rule, gotchas };
}
