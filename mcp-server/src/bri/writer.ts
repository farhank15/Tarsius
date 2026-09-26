import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { BriDocument, BusinessRule, ApprovalStatus } from "./schema.js";

// Resolve BRI path relative to the workspace root (two levels up from mcp-server/src/bri/)
const __dirname = dirname(fileURLToPath(import.meta.url));
const BRI_PATH = resolve(__dirname, "../../../sample-data/tarsius-bri.json");

/**
 * Read and parse the BRI JSON document from disk.
 */
export async function readBri(): Promise<BriDocument> {
  const raw = await readFile(BRI_PATH, "utf-8");
  return JSON.parse(raw) as BriDocument;
}

/**
 * Persist the BRI document back to disk with stable 2-space formatting.
 */
async function writeBri(doc: BriDocument): Promise<void> {
  await writeFile(BRI_PATH, JSON.stringify(doc, null, 2) + "\n", "utf-8");
}

/**
 * Append a new business rule to the BRI.
 * If a rule with the same `id` already exists, the call is a no-op and the
 * existing rule is returned unchanged.
 *
 * @returns The rule as stored (either newly appended or the pre-existing one).
 */
export async function appendRule(rule: BusinessRule): Promise<BusinessRule> {
  const doc = await readBri();

  const existing = doc.rules.find((r) => r.id === rule.id);
  if (existing) {
    return existing;
  }

  doc.rules.push(rule);
  doc.summary.totalRules = doc.rules.length;

  // Recount summary fields from the full rule set
  doc.summary.explicit = doc.rules.filter((r) => r.type === "explicit").length;
  doc.summary.implicit = doc.rules.filter((r) => r.type === "implicit").length;
  doc.summary.contradictions = doc.rules.filter(
    (r) => r.evidence.contradiction
  ).length;

  doc.summary.byTriage = {
    "auto-approve": doc.rules.filter((r) => r.triage.includes("auto-approve")).length,
    glance: doc.rules.filter((r) => r.triage.includes("glance")).length,
    "must-review": doc.rules.filter((r) => r.triage.includes("must-review")).length,
  };

  await writeBri(doc);
  return rule;
}

/**
 * Update the `approvalStatus` field of a rule identified by `ruleId`.
 * Throws if no rule with that id exists.
 *
 * @returns The updated rule.
 */
export async function updateApprovalStatus(
  ruleId: string,
  status: ApprovalStatus
): Promise<BusinessRule> {
  const doc = await readBri();

  const rule = doc.rules.find((r) => r.id === ruleId);
  if (!rule) {
    throw new Error(`BRI rule not found: ${ruleId}`);
  }

  rule.approvalStatus = status;

  await writeBri(doc);
  return rule;
}
