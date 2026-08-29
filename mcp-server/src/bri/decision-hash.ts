import { createHash } from "crypto";

export function computeDecisionHash(data: {
  ruleId: string;
  decision: { previousStatus: string; newStatus: string };
  userId: string;
  timestamp: string;
  justification: string;
}): string {
  const content = JSON.stringify({
    ruleId: data.ruleId,
    decision: data.decision,
    userId: data.userId,
    timestamp: data.timestamp,
    justification: data.justification,
  });
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export function computeChainHash(currentHash: string, previousChainHash: string): string {
  return createHash("sha256")
    .update(currentHash + previousChainHash)
    .digest("hex")
    .slice(0, 16);
}
