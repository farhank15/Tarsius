import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { BriDocument, BusinessRule, ApprovalStatus } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getBriPath(): string {
  const ws = process.env.TARSIUS_WORKSPACE || process.cwd();
  const candidates = [
    resolve(ws, ".tarsius/bri.json"),
    resolve(ws, ".tarsius/tarsius-bri.json"),
    resolve(ws, ".bob/tarsius-bri.json"),
    resolve(ws, "sample-data/tarsius-bri.json"),
    resolve(ws, "tarsius-bri.json"),
  ];
  for (const cand of candidates) {
    if (existsSync(cand)) return cand;
  }
  const fallback = resolve(__dirname, "../../../sample-data/tarsius-bri.json");
  if (existsSync(fallback)) return fallback;
  return resolve(ws, ".tarsius/bri.json");
}

/**
 * Read and parse the BRI JSON document from disk.
 */
export async function readBri(): Promise<BriDocument> {
  const p = getBriPath();
  try {
    const raw = await readFile(p, "utf-8");
    return JSON.parse(raw) as BriDocument;
  } catch {
    return {
      version: "3.0",
      sourceModule: "workspace",
      attachedDocs: [],
      generatedAt: new Date().toISOString(),
      provenance: {
        customMode: "legacy-analyzer",
        documentUnderstanding: true,
        subagentsUsed: 0,
      },
      dependencies: {},
      rules: [],
      summary: {
        totalRules: 0,
        explicit: 0,
        implicit: 0,
        contradictions: 0,
        modulesTracked: 1,
        byTriage: { "auto-approve": 0, glance: 0, "must-review": 0 },
        riskDistribution: { critical: 0, medium: 0, low: 0 },
      },
    };
  }
}

/**
 * Persist the BRI document back to disk with stable 2-space formatting.
 */
async function writeBri(doc: BriDocument): Promise<void> {
  const p = getBriPath();
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(doc, null, 2) + "\n", "utf-8");
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
