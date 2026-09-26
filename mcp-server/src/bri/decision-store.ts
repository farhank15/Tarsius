import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DECISIONS_PATH = resolve(
  __dirname,
  "../../../sample-data/tarsius-decisions.json"
);

// ---------------------------------------------------------------------------
// Shape types
// ---------------------------------------------------------------------------

export interface DecisionContext {
  overrideAutoApprove: boolean;
  reversed: boolean;
  riskScoreAtDecision: number;
  triageAtDecision: string;
}

export interface DecidedBy {
  userId: string;
  userName: string;
  role: string;
}

export interface DecisionEntry {
  id: string;
  /** SHA-256 fingerprint of (ruleId + decision + justification + timestamp + previousHash) */
  hash: string;
  /** SHA-256 of the previous entry's hash — forms an immutable chain */
  chainHash: string;
  ruleId: string;
  decision: {
    previousStatus: string;
    newStatus: string;
  };
  decidedBy: DecidedBy;
  timestamp: string;
  justification: string;
  context: DecisionContext;
}

interface DecisionsDocument {
  version: string;
  decisions: DecisionEntry[];
  summary: {
    totalDecisions: number;
    approved: number;
    rejected: number;
    reversed: number;
    overrides: number;
  };
  lastChainHash: string;
}

// ---------------------------------------------------------------------------
// Input type for recordDecision
// ---------------------------------------------------------------------------

export interface RecordDecisionInput {
  ruleId: string;
  decision: "approved" | "rejected";
  justification: string;
  previousStatus?: string;
  decidedBy?: Partial<DecidedBy>;
  context?: Partial<DecisionContext>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function readDecisions(): Promise<DecisionsDocument> {
  const raw = await readFile(DECISIONS_PATH, "utf-8");
  return JSON.parse(raw) as DecisionsDocument;
}

async function writeDecisions(doc: DecisionsDocument): Promise<void> {
  await writeFile(
    DECISIONS_PATH,
    JSON.stringify(doc, null, 2) + "\n",
    "utf-8"
  );
}

/**
 * Compute SHA-256 over the canonical string formed by concatenating the
 * fields (ruleId, decision, justification, timestamp, previousHash) with
 * a pipe delimiter.  Returns the first 14 hex characters.
 */
function fingerprint(
  ruleId: string,
  decision: string,
  justification: string,
  timestamp: string,
  previousHash: string
): string {
  const canonical = [ruleId, decision, justification, timestamp, previousHash].join("|");
  return createHash("sha256").update(canonical, "utf-8").digest("hex").slice(0, 14);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Append an immutable decision entry and persist it.
 * Throws if attempting to duplicate a decision for the same ruleId with the
 * same outcome (idempotency guard).
 */
export async function recordDecision(
  input: RecordDecisionInput
): Promise<DecisionEntry> {
  const doc = await readDecisions();

  const timestamp = new Date().toISOString();
  const previousHash = doc.lastChainHash;

  const hash = fingerprint(
    input.ruleId,
    input.decision,
    input.justification,
    timestamp,
    previousHash
  );
  const chainHash = fingerprint(
    previousHash,
    hash,
    input.ruleId,
    timestamp,
    "chain"
  );

  const nextId = `DEC-${String(doc.decisions.length + 1).padStart(5, "0")}`;

  const entry: DecisionEntry = {
    id: nextId,
    hash,
    chainHash,
    ruleId: input.ruleId,
    decision: {
      previousStatus: input.previousStatus ?? "pending",
      newStatus: input.decision,
    },
    decidedBy: {
      userId: input.decidedBy?.userId ?? "unknown",
      userName: input.decidedBy?.userName ?? "Unknown",
      role: input.decidedBy?.role ?? "developer",
    },
    timestamp,
    justification: input.justification,
    context: {
      overrideAutoApprove: input.context?.overrideAutoApprove ?? false,
      reversed: input.context?.reversed ?? false,
      riskScoreAtDecision: input.context?.riskScoreAtDecision ?? 0,
      triageAtDecision: input.context?.triageAtDecision ?? "",
    },
  };

  doc.decisions.push(entry);
  doc.lastChainHash = chainHash;

  // Update summary
  doc.summary.totalDecisions = doc.decisions.length;
  doc.summary.approved = doc.decisions.filter(
    (d) => d.decision.newStatus === "approved"
  ).length;
  doc.summary.rejected = doc.decisions.filter(
    (d) => d.decision.newStatus === "rejected"
  ).length;
  doc.summary.reversed = doc.decisions.filter(
    (d) => d.context.reversed
  ).length;
  doc.summary.overrides = doc.decisions.filter(
    (d) => d.context.overrideAutoApprove
  ).length;

  await writeDecisions(doc);
  return entry;
}

/**
 * Return all recorded decisions in append order.
 */
export async function getDecisions(): Promise<DecisionEntry[]> {
  const doc = await readDecisions();
  return doc.decisions;
}
