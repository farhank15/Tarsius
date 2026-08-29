/**
 * Business Rule Inventory (BRI) TypeScript types.
 *
 * Full schema will be implemented during hackathon.
 * See docs/reference/blueprint.md 2.3 for the complete field specification.
 */

export interface BusinessRule {
  id: string;
  module: string;
  description: string;
  triage: "must-review" | "glance" | "auto-approve";
  confidence: {
    label: "high" | "medium" | "low";
    method: "z3-formal-proof" | "differential-fuzzing" | "llm-heuristic";
    score: number;
  };
  evidence: {
    contradiction: boolean;
    codeLocation: {
      file: string;
      startLine: number;
      endLine: number;
    };
    docQuote?: string;
  };
  status: "pending" | "approved" | "rejected";
}

export interface BriIndex {
  modules: Record<
    string,
    {
      totalRules: number;
      pending: number;
      approved: number;
      rejected: number;
      lastScanned: string;
    }
  >;
}
