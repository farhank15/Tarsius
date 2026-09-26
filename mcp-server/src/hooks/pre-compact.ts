/**
 * PreCompact lifecycle hook — Tarsius
 *
 * Persists a snapshot of approved rules and the last audit-chain hash into
 * sample-data/tarsius-session.json before the context window is compacted.
 * Bob will re-inject this data via the PostCompact hook.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../../../");
const BRI_PATH = resolve(ROOT, "sample-data/tarsius-bri.json");
const DECISIONS_PATH = resolve(ROOT, "sample-data/tarsius-decisions.json");
const SESSION_PATH = resolve(ROOT, "sample-data/tarsius-session.json");

interface BriRule {
  id: string;
  approvalStatus: string;
  title: string;
  description: string;
  category: string;
  confidence: { label: string; score: number };
  triage: string;
  riskScore: number;
}

interface BriDocument {
  rules: BriRule[];
}

interface DecisionsDocument {
  lastChainHash: string;
}

const bri: BriDocument = JSON.parse(readFileSync(BRI_PATH, "utf8"));
const decisions: DecisionsDocument = JSON.parse(
  readFileSync(DECISIONS_PATH, "utf8")
);

const approvedRules = bri.rules.filter((r) => r.approvalStatus === "approved");
const lastChainHash: string = decisions.lastChainHash ?? "";

const snapshot = {
  savedAt: new Date().toISOString(),
  approvedRules,
  lastChainHash,
};

writeFileSync(SESSION_PATH, JSON.stringify(snapshot, null, 2), "utf8");

console.error(
  "[Tarsius Hook] PreCompact: Successfully persisted approved rules snapshot before compaction."
);
