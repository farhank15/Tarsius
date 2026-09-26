// ---------------------------------------------------------------------------
// Business Rule Inventory types
// ---------------------------------------------------------------------------

export type RuleType = "explicit" | "implicit";
export type ConfidenceLabel = "high" | "medium" | "low";
export type SourceLabel = "code" | "document";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type TriageLevel = "🟢 auto-approve" | "🟡 glance" | "🔴 must-review";

export interface CodeLocation {
  file: string;
  startLine: number;
  endLine: number;
}

export interface RuleEvidence {
  codeLocation: CodeLocation;
  docQuote: string | null;
  contradiction: boolean;
  contradictionNote?: string;
}

export interface ConfidenceInfo {
  label: ConfidenceLabel;
  method: string;
  score: number;
}

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

export interface BriSummary {
  totalRules: number;
  explicit: number;
  implicit: number;
  contradictions: number;
  modulesTracked: number;
  byTriage: Record<string, number>;
  riskDistribution: Record<string, number>;
}

export interface BriDocument {
  version: string;
  sourceModule: string;
  attachedDocs: string[];
  generatedAt: string;
  rules: BusinessRule[];
  summary: BriSummary;
}

// ---------------------------------------------------------------------------
// Decision ledger types
// ---------------------------------------------------------------------------

export interface DecisionContext {
  overrideAutoApprove: boolean;
  reversed: boolean;
  riskScoreAtDecision?: number;
  triageAtDecision?: string;
}

export interface DecisionMaker {
  userId: string;
  userName: string;
  role: string;
}

export interface DecisionRecord {
  id: string;
  hash: string;
  chainHash: string;
  ruleId: string;
  decision: {
    previousStatus: string;
    newStatus: string;
  };
  decidedBy: DecisionMaker;
  timestamp: string;
  justification: string;
  context: DecisionContext;
}

export interface DecisionSummary {
  totalDecisions: number;
  approved: number;
  rejected: number;
  reversed: number;
  overrides: number;
}

export interface DecisionsDocument {
  version: string;
  decisions: DecisionRecord[];
  summary: DecisionSummary;
  lastChainHash: string;
}

// ---------------------------------------------------------------------------
// Gotcha types
// ---------------------------------------------------------------------------

export type GotchaSeverity = "critical" | "high" | "medium" | "low";

export interface GotchaRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: GotchaSeverity;
  triggerCount: number;
  active: boolean;
  addedAt: string;
  addedBy: string;
  relatedRules: string[];
}

export interface GotchasDocument {
  version: string;
  gotchas: GotchaRecord[];
}

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

export interface ApprovePayload {
  ruleId: string;
  decision: "approved" | "rejected";
  justification?: string;
}

export interface ApproveResponse {
  success: boolean;
  ruleId: string;
  hash: string;
  chainHash: string;
}
