import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { DecisionStore, DecisionRecord } from "./decision-schema.js";
import { computeDecisionHash, computeChainHash } from "./decision-hash.js";

const DECISIONS_PATH = join(process.cwd(), "sample-data", "tarsius-decisions.json");

function createEmptyStore(): DecisionStore {
  return {
    version: "1.0", decisions: [],
    summary: { totalDecisions: 0, approved: 0, rejected: 0, reversed: 0, overrides: 0 },
    lastChainHash: "0000000000000000",
  };
}

export function readDecisions(): DecisionStore {
  if (!existsSync(DECISIONS_PATH)) return createEmptyStore();
  return JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
}

export function writeDecisions(store: DecisionStore): void {
  writeFileSync(DECISIONS_PATH, JSON.stringify(store, null, 2));
}

export function recordDecision(input: {
  ruleId: string;
  decision: "approved" | "rejected";
  previousStatus: "pending" | "approved" | "rejected";
  userId: string;
  userName: string;
  role: string;
  justification: string;
  riskScore: number;
  triage: string;
  gotchaId?: string;
  rationale?: {
    reason: string;
    context: string;
    consequence?: string;
    consulted?: string[];
  };
}): DecisionRecord {
  const store = readDecisions();
  const id = `DEC-${String(store.decisions.length + 1).padStart(5, "0")}`;
  const timestamp = new Date().toISOString();
  const hash = computeDecisionHash({
    ruleId: input.ruleId,
    decision: { previousStatus: input.previousStatus, newStatus: input.decision },
    userId: input.userId, timestamp, justification: input.justification,
  });
  const chainHash = computeChainHash(hash, store.lastChainHash);
  const record: DecisionRecord = {
    id, hash, chainHash, ruleId: input.ruleId,
    decision: { previousStatus: input.previousStatus, newStatus: input.decision },
    decidedBy: { userId: input.userId, userName: input.userName, role: input.role },
    timestamp, justification: input.justification,
    rationale: input.rationale,
    context: { overrideAutoApprove: false, reversed: false, gotchaId: input.gotchaId,
      riskScoreAtDecision: input.riskScore, triageAtDecision: input.triage },
  };
  store.decisions.push(record);
  store.lastChainHash = chainHash;
  store.summary.totalDecisions++;
  if (input.decision === "approved") store.summary.approved++;
  else store.summary.rejected++;
  writeDecisions(store);
  return record;
}
