/**
 * PostCompact lifecycle hook — Tarsius
 *
 * Re-injects the governance contract (approved rules + active gotcha warnings)
 * into the fresh context window after compaction. Bob reads this script's
 * stdout and prepends it to the new context.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../../../");
const SESSION_PATH = resolve(ROOT, "sample-data/tarsius-session.json");
const GOTCHAS_PATH = resolve(ROOT, "sample-data/tarsius-gotchas.json");

interface ApprovedRule {
  id: string;
  title: string;
  description: string;
  category: string;
  triage: string;
  riskScore: number;
}

interface SessionSnapshot {
  savedAt: string;
  approvedRules: ApprovedRule[];
  lastChainHash: string;
}

interface Gotcha {
  id: string;
  title: string;
  description: string;
  severity: string;
  active: boolean;
  relatedRules: string[];
}

interface GotchasDocument {
  gotchas: Gotcha[];
}

const session: SessionSnapshot = JSON.parse(
  readFileSync(SESSION_PATH, "utf8")
);
const gotchasDoc: GotchasDocument = JSON.parse(
  readFileSync(GOTCHAS_PATH, "utf8")
);

const activeGotchas = gotchasDoc.gotchas.filter((g) => g.active);

// ---------------------------------------------------------------------------
// Build the re-injection prompt for Bob
// ---------------------------------------------------------------------------

const lines: string[] = [];

lines.push("## 🔄 Tarsius Governance Contract — Restored After Compaction");
lines.push("");
lines.push(
  `> Snapshot saved at: ${session.savedAt}  |  Audit chain: \`${session.lastChainHash}\``
);
lines.push("");

// --- Approved rules ---
lines.push("### ✅ Approved Business Rules");
lines.push("");
if (session.approvedRules.length === 0) {
  lines.push("_No approved rules found in session snapshot._");
} else {
  for (const rule of session.approvedRules) {
    lines.push(
      `- **${rule.id}** (${rule.triage}, risk ${rule.riskScore}): ${rule.title}`
    );
    lines.push(`  ${rule.description}`);
  }
}
lines.push("");

// --- Active gotcha warnings ---
lines.push("### ⚠️ Active Gotcha Warnings");
lines.push("");
if (activeGotchas.length === 0) {
  lines.push("_No active gotcha warnings._");
} else {
  for (const g of activeGotchas) {
    lines.push(
      `- **[${g.severity.toUpperCase()}] ${g.id} — ${g.title}**`
    );
    lines.push(`  ${g.description}`);
    if (g.relatedRules.length > 0) {
      lines.push(`  Related rules: ${g.relatedRules.join(", ")}`);
    }
  }
}
lines.push("");
lines.push(
  "> **IMPORTANT**: Only implement rules listed above as Approved. " +
    "Never infer business logic not in this list. " +
    "Record all decisions with the audit trail tools."
);
lines.push("");

console.log(lines.join("\n"));

console.error(
  "[Tarsius Hook] PostCompact: Re-injected governance contract into context."
);
