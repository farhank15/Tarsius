export interface BusinessRule {
  id: string; type: "explicit" | "implicit"; title: string; description: string;
  confidence: { label: "high" | "medium" | "low"; score: number };
  triage: "🟢 auto-approve" | "🟡 glance" | "🔴 must-review";
  riskScore: number; source: ("code" | "document")[];
  evidence: { codeLocation: { file: string; startLine: number; endLine: number };
    docQuote: string | null; contradiction: boolean; contradictionNote?: string };
  approvalStatus: "pending" | "approved" | "rejected";
  category: string; affectsModules: string[];
}

export interface BriSummary {
  totalRules: number; explicit: number; implicit: number;
  contradictions: number; modulesTracked: number;
  byTriage: { "auto-approve": number; glance: number; "must-review": number };
}

export interface DecisionRecord {
  id: string; hash: string; chainHash: string; ruleId: string;
  decision: { previousStatus: string; newStatus: string };
  decidedBy: { userId: string; userName: string; role: string };
  timestamp: string; justification: string;
  context: { overrideAutoApprove: boolean; reversed: boolean; riskScoreAtDecision: number; triageAtDecision: string };
}

export interface GotchaRecord {
  id: string; title: string; description: string;
  category: string; severity: string;
  triggerCount: number; active: boolean;
}
