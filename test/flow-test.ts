/**
 * Tarsius — End-to-End Flow Test
 * 
 * Verifikasi sample data, triage classification, dan approval flow.
 * Jalankan sebelum hackathon untuk pastikan semua komponen siap.
 * 
 * Usage: npx tsx test/flow-test.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT = process.cwd().endsWith("mcp-server") 
  ? join(process.cwd(), "..") 
  : process.cwd();
const BRI_PATH = join(ROOT, "sample-data", "tarsius-bri.json");
const SPEC_PATH = join(ROOT, "sample-data", "order-validation-spec.md");
const CODE_PATH = join(ROOT, "sample-data", "ORDVAL.rpgle");
const RISK_CONTEXT_PATH = join(ROOT, ".bob", "RISK-CONTEXT.md");

// ─── Types ────────────────────────────────────────────────────────────────────
interface BusinessRule {
  id: string;
  type: "explicit" | "implicit";
  title: string;
  description: string;
  confidence: { label: string; score: number };
  triage: string;
  riskScore: number;
  source: string[];
  evidence: {
    codeLocation: { file: string; startLine: number; endLine: number };
    docQuote: string | null;
    contradiction: boolean;
    contradictionNote?: string;
  };
  approvalStatus: string;
  category: string;
  affectsModules: string[];
}

interface BriDocument {
  version: string;
  sourceModule: string;
  attachedDocs: string[];
  rules: BusinessRule[];
  summary: {
    totalRules: number;
    contradictions: number;
    byTriage: Record<string, number>;
  };
}

// ─── Test Runner ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
console.log("\n🧪 Tarsius Flow Test\n");

// ─── 1. File Existence ────────────────────────────────────────────────────────
console.log("📁 File Existence:");

test("BRI JSON exists", () => {
  assert(existsSync(BRI_PATH), `File not found: ${BRI_PATH}`);
});

test("Spec file exists", () => {
  assert(existsSync(SPEC_PATH), `File not found: ${SPEC_PATH}`);
});

test("RPG code exists", () => {
  assert(existsSync(CODE_PATH), `File not found: ${CODE_PATH}`);
});

// ─── 2. BRI JSON Format ───────────────────────────────────────────────────────
console.log("\n📋 BRI JSON Format:");

const bri: BriDocument = JSON.parse(readFileSync(BRI_PATH, "utf-8"));

test("BRI has version", () => {
  assert(bri.version === "3.0", `Expected version "3.0", got "${bri.version}"`);
});

test("BRI has sourceModule", () => {
  assert(bri.sourceModule.includes("ORDVAL"), `Expected sourceModule to include "ORDVAL"`);
});

test("BRI has 4 rules", () => {
  assert(bri.rules.length === 4, `Expected 4 rules, got ${bri.rules.length}`);
});

test("BRI summary matches rules count", () => {
  assert(bri.summary.totalRules === 4, `Expected summary.totalRules = 4, got ${bri.summary.totalRules}`);
});

test("BRI has 1 contradiction", () => {
  assert(bri.summary.contradictions === 1, `Expected 1 contradiction, got ${bri.summary.contradictions}`);
});

// ─── 3. Rule Validation ───────────────────────────────────────────────────────
console.log("\n🔍 Rule Validation:");

test("BR-CANCELLED-BLOCK exists", () => {
  const rule = bri.rules.find(r => r.id === "BR-CANCELLED-BLOCK");
  assert(!!rule, "BR-CANCELLED-BLOCK not found");
  assert(rule!.type === "explicit", "Should be explicit");
  assert(rule!.triage.includes("auto-approve"), "Should be auto-approve");
  assert(!rule!.evidence.contradiction, "Should not have contradiction");
});

test("BR-SUSPENDED-BLOCK exists", () => {
  const rule = bri.rules.find(r => r.id === "BR-SUSPENDED-BLOCK");
  assert(!!rule, "BR-SUSPENDED-BLOCK not found");
  assert(rule!.type === "explicit", "Should be explicit");
  assert(rule!.triage.includes("auto-approve"), "Should be auto-approve");
});

test("BR-DISC-EXCEPTION exists with contradiction", () => {
  const rule = bri.rules.find(r => r.id === "BR-DISC-EXCEPTION");
  assert(!!rule, "BR-DISC-EXCEPTION not found");
  assert(rule!.type === "implicit", "Should be implicit");
  assert(rule!.triage.includes("must-review"), "Should be must-review");
  assert(rule!.evidence.contradiction === true, "Should have contradiction");
});

test("BR-GRANDFATHER-PRICING exists as code-only", () => {
  const rule = bri.rules.find(r => r.id === "BR-GRANDFATHER-PRICING");
  assert(!!rule, "BR-GRANDFATHER-PRICING not found");
  assert(rule!.type === "implicit", "Should be implicit");
  assert(rule!.triage.includes("glance"), "Should be glance");
  assert(rule!.source.length === 1, "Should be code-only (1 source)");
});

// ─── 4. Triage Classification ─────────────────────────────────────────────────
console.log("\n🎯 Triage Classification:");

function classifyRule(rule: BusinessRule): { triage: string; riskScore: number } {
  let riskScore = 0;
  if (rule.evidence.contradiction) riskScore += 40;
  riskScore += (1 - rule.confidence.score) * 30;
  if (rule.affectsModules.length > 3) riskScore += 20;
  if (rule.source.length === 1) riskScore += 10;
  riskScore = Math.min(riskScore, 100);

  let triage: string;
  if (rule.evidence.contradiction) triage = "🔴 must-review";
  else if (rule.confidence.label === "low") triage = "🔴 must-review";
  else if (rule.confidence.label === "medium") triage = "🟡 glance";
  else if (rule.source.length === 1) triage = "🟡 glance";
  else triage = "🟢 auto-approve";

  return { triage, riskScore };
}

test("Cancelled block → auto-approve", () => {
  const rule = bri.rules.find(r => r.id === "BR-CANCELLED-BLOCK")!;
  const { triage } = classifyRule(rule);
  assert(triage.includes("auto-approve"), `Expected auto-approve, got ${triage}`);
});

test("Suspended block → auto-approve", () => {
  const rule = bri.rules.find(r => r.id === "BR-SUSPENDED-BLOCK")!;
  const { triage } = classifyRule(rule);
  assert(triage.includes("auto-approve"), `Expected auto-approve, got ${triage}`);
});

test("DISC exception → must-review (contradiction)", () => {
  const rule = bri.rules.find(r => r.id === "BR-DISC-EXCEPTION")!;
  const { triage } = classifyRule(rule);
  assert(triage.includes("must-review"), `Expected must-review, got ${triage}`);
});

test("Grandfather pricing → glance (code-only)", () => {
  const rule = bri.rules.find(r => r.id === "BR-GRANDFATHER-PRICING")!;
  const { triage } = classifyRule(rule);
  assert(triage.includes("glance"), `Expected glance, got ${triage}`);
});

// ─── 5. Triage Distribution ───────────────────────────────────────────────────
console.log("\n📊 Triage Distribution:");

test("2 rules auto-approve", () => {
  const autoApprove = bri.rules.filter(r => r.triage.includes("auto-approve")).length;
  assert(autoApprove === 2, `Expected 2 auto-approve, got ${autoApprove}`);
});

test("1 rule glance", () => {
  const glance = bri.rules.filter(r => r.triage.includes("glance")).length;
  assert(glance === 1, `Expected 1 glance, got ${glance}`);
});

test("1 rule must-review", () => {
  const mustReview = bri.rules.filter(r => r.triage.includes("must-review")).length;
  assert(mustReview === 1, `Expected 1 must-review, got ${mustReview}`);
});

// ─── 6. Contradiction Detection ───────────────────────────────────────────────
console.log("\n⚠️  Contradiction Detection:");

test("Only BR-DISC-EXCEPTION has contradiction", () => {
  const contradictions = bri.rules.filter(r => r.evidence.contradiction);
  assert(contradictions.length === 1, `Expected 1 contradiction, got ${contradictions.length}`);
  assert(contradictions[0].id === "BR-DISC-EXCEPTION", "Expected DISC exception");
});

test("DISC exception contradiction note is present", () => {
  const rule = bri.rules.find(r => r.id === "BR-DISC-EXCEPTION")!;
  assert(!!rule.evidence.contradictionNote, "Expected contradictionNote");
  assert(rule.evidence.contradictionNote!.includes("11 years"), "Expected '11 years' in note");
});

// ─── 7. Code-Only Rules ───────────────────────────────────────────────────────
console.log("\n📝 Code-Only Rules:");

test("BR-GRANDFATHER-PRICING has no docQuote", () => {
  const rule = bri.rules.find(r => r.id === "BR-GRANDFATHER-PRICING")!;
  assert(rule.evidence.docQuote === null, "Expected null docQuote");
});

test("BR-GRANDFATHER-PRICING is code-only (1 source)", () => {
  const rule = bri.rules.find(r => r.id === "BR-GRANDFATHER-PRICING")!;
  assert(rule.source.length === 1, `Expected 1 source, got ${rule.source.length}`);
  assert(rule.source[0] === "code", 'Expected source "code"');
});

// ─── 8. Sample Data Cross-Check ───────────────────────────────────────────────
console.log("\n🔄 Sample Data Cross-Check:");

test("RPG code contains BR-DISC-EXCEPTION", () => {
  const code = readFileSync(CODE_PATH, "utf-8");
  assert(code.includes("BR-DISC-EXCEPTION"), "RPG code missing BR-DISC-EXCEPTION comment");
});

test("RPG code contains BR-GRANDFATHER-PRICING", () => {
  const code = readFileSync(CODE_PATH, "utf-8");
  assert(code.includes("BR-GRANDFATHER-PRICING"), "RPG code missing BR-GRANDFATHER-PRICING comment");
});

test("Spec contains suspended block rule", () => {
  const spec = readFileSync(SPEC_PATH, "utf-8");
  assert(spec.includes("Suspended"), "Spec missing suspended account rule");
});

test("Spec contradicts DISC exception", () => {
  const spec = readFileSync(SPEC_PATH, "utf-8");
  assert(spec.includes("No exceptions"), 'Spec should say "No exceptions" for contradiction');
});

// ─── 9. Approval Flow Simulation ──────────────────────────────────────────────
console.log("\n✅ Approval Flow Simulation:");

test("Initial state: 2 pending rules", () => {
  const pending = bri.rules.filter(r => r.approvalStatus === "pending");
  assert(pending.length === 2, `Expected 2 pending, got ${pending.length}`);
});

test("Initial state: 2 approved rules", () => {
  const approved = bri.rules.filter(r => r.approvalStatus === "approved");
  assert(approved.length === 2, `Expected 2 approved, got ${approved.length}`);
});

test("Can simulate approval of BR-DISC-EXCEPTION", () => {
  const updatedBri = JSON.parse(JSON.stringify(bri)); // Deep copy
  const rule = updatedBri.rules.find(r => r.id === "BR-DISC-EXCEPTION")!;
  rule.approvalStatus = "approved";
  const pending = updatedBri.rules.filter(r => r.approvalStatus === "pending");
  assert(pending.length === 1, `After approval, expected 1 pending, got ${pending.length}`);
});

// ─── 10. RISK-CONTEXT.md Generation ───────────────────────────────────────────
console.log("\n📄 RISK-CONTEXT.md Generation:");

function generateRiskContext(bri: BriDocument): string {
  const approved = bri.rules.filter(r => r.approvalStatus === "approved");
  const pending = bri.rules.filter(r => r.approvalStatus === "pending");
  const rejected = bri.rules.filter(r => r.approvalStatus === "rejected");

  let content = `# Tarsius Risk Context\n\n`;
  content += `## ✅ Approved Rules\n\n`;
  approved.forEach(r => { content += `- **${r.id}**: ${r.title}\n`; });
  content += `\n## ⏳ Pending Rules\n\n`;
  pending.forEach(r => {
    const contradiction = r.evidence.contradiction ? " ⚠️ CONTRADICTION" : "";
    content += `- **${r.id}**: ${r.title}${contradiction}\n`;
  });
  content += `\n## ❌ Rejected Rules\n\n`;
  if (rejected.length === 0) content += `(none)\n`;
  else rejected.forEach(r => { content += `- **${r.id}**: ${r.title}\n`; });

  return content;
}

test("RISK-CONTEXT.md contains approved rules", () => {
  const content = generateRiskContext(bri);
  assert(content.includes("BR-CANCELLED-BLOCK"), "Missing BR-CANCELLED-BLOCK");
  assert(content.includes("BR-SUSPENDED-BLOCK"), "Missing BR-SUSPENDED-BLOCK");
});

test("RISK-CONTEXT.md contains pending rules with contradiction marker", () => {
  const content = generateRiskContext(bri);
  assert(content.includes("BR-DISC-EXCEPTION"), "Missing BR-DISC-EXCEPTION");
  // Check for contradiction marker
  const hasMarker = content.includes("CONTRADICTION") || content.includes("⚠️");
  assert(hasMarker, "Missing CONTRADICTION marker in generated content");
});

test("RISK-CONTEXT.md contains pending rules", () => {
  const content = generateRiskContext(bri);
  assert(content.includes("BR-GRANDFATHER-PRICING"), "Missing BR-GRANDFATHER-PRICING");
});

// ─── Results ──────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total\n`);

if (failed > 0) {
  console.log("❌ Some tests failed. Fix before hackathon.\n");
  process.exit(1);
} else {
  console.log("✅ All tests passed. Ready for hackathon.\n");
}
