import { readBri } from "../bri/writer.js";

export function handleGetPendingApprovals(input: { filterTriage?: string; limit?: number }) {
  const bri = readBri();
  let pending = bri.rules.filter((r) => r.approvalStatus === "pending");
  if (input.filterTriage) pending = pending.filter((r) => r.triage.includes(input.filterTriage!));
  if (input.limit) pending = pending.slice(0, input.limit);
  return { rules: pending, total: pending.length, summary: bri.summary };
}
