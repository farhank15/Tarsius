import { readBri } from "../bri/writer.js";
import type { BusinessRule, TriageLevel } from "../bri/schema.js";

export interface GetPendingApprovalsInput {
  filterTriage?: string;
  limit?: number;
}

export interface GetPendingApprovalsResult {
  rules: BusinessRule[];
  total: number;
}

/**
 * Return rules whose approvalStatus is "pending", optionally filtered by
 * triage level and capped at `limit` entries.
 */
export async function handleGetPendingApprovals(
  input: GetPendingApprovalsInput
): Promise<GetPendingApprovalsResult> {
  const doc = await readBri();

  let rules = doc.rules.filter((r) => r.approvalStatus === "pending");

  if (input.filterTriage) {
    rules = rules.filter((r) => r.triage === (input.filterTriage as TriageLevel));
  }

  const total = rules.length;

  if (input.limit !== undefined && input.limit > 0) {
    rules = rules.slice(0, input.limit);
  }

  return { rules, total };
}
