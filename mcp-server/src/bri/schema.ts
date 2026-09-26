/**
 * Business Rule Inventory (BRI) — TypeScript schema definitions.
 * Mirrors the structure of sample-data/tarsius-bri.json exactly.
 */

export type RuleType = "explicit" | "implicit";
export type ConfidenceLabel = "high" | "medium" | "low";
export type SourceLabel = "code" | "document";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type TriageLevel = "🟢 auto-approve" | "🟡 glance" | "🔴 must-review";

export interface ConfidenceInfo {
  label: ConfidenceLabel;
  /** Method used to determine confidence (e.g. "dual-source", "code-analysis") */
  method: string;
  /** 0–1 numeric score */
  score: number;
}

export interface CodeLocation {
  file: string;
  startLine: number;
  endLine: number;
}

export interface RuleEvidence {
  codeLocation: CodeLocation;
  /** Verbatim quote from the specification document, or null if code-only */
  docQuote: string | null;
  contradiction: boolean;
  contradictionNote?: string;
}

/**
 * A single extracted business rule.
 * The `id` field maps to `ruleId` in write_finding tool calls.
 */
export interface BusinessRule {
  id: string;
  type: RuleType;
  title: string;
  description: string;
  confidence: ConfidenceInfo;
  triage: TriageLevel;
  riskScore: number;
  source: SourceLabel[];
  evidence: RuleEvidence;
  approvalStatus: ApprovalStatus;
  category: string;
  affectsModules: string[];
}

export interface DependencyEntry {
  calls: string[];
  calledBy: string[];
  globalState: string[];
  externalFiles: string[];
}

export interface BriProvenance {
  customMode: string;
  documentUnderstanding: boolean;
  subagentsUsed: number;
}

export interface BriSummary {
  totalRules: number;
  explicit: number;
  implicit: number;
  contradictions: number;
  modulesTracked: number;
  byTriage: Record<string, number>;
  riskDistribution: Record<string, number>;
}

/**
 * Top-level BRI document — the full contents of tarsius-bri.json.
 */
export interface BriDocument {
  version: string;
  sourceModule: string;
  attachedDocs: string[];
  generatedAt: string;
  provenance: BriProvenance;
  dependencies: Record<string, DependencyEntry>;
  rules: BusinessRule[];
  summary: BriSummary;
}
