export interface DecisionRecord {
  id: string;
  hash: string;
  chainHash: string;
  ruleId: string;
  decision: {
    previousStatus: "pending" | "approved" | "rejected";
    newStatus: "approved" | "rejected";
  };
  decidedBy: {
    userId: string;
    userName: string;
    role: string;
  };
  timestamp: string;
  justification: string;
  /** ADR-style rationale (from kuma pattern) */
  rationale?: {
    /** WHY this decision was made */
    reason: string;
    /** WHAT was the context at decision time */
    context: string;
    /** WHAT happened after this decision */
    consequence?: string;
    /** WHO was consulted */
    consulted?: string[];
  };
  context: {
    overrideAutoApprove: boolean;
    reversed: boolean;
    gotchaId?: string;
    riskScoreAtDecision: number;
    triageAtDecision: string;
  };
}

export interface DecisionStore {
  version: string;
  decisions: DecisionRecord[];
  summary: {
    totalDecisions: number;
    approved: number;
    rejected: number;
    reversed: number;
    overrides: number;
  };
  lastChainHash: string;
}
