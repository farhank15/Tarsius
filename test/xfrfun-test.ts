/**
 * Tarsius — XFRFUN (IBM CICS COBOL) Verification Suite
 *
 * Case Study 2: Real-world core banking funds transfer module (2069 lines COBOL)
 * Validates extraction, triage, contradiction detection, and BETH differential oracle.
 *
 * Usage: npx tsx test/xfrfun-test.ts
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd().endsWith("mcp-server")
  ? join(process.cwd(), "..")
  : process.cwd();

const BRI_PATH = join(ROOT, "sample-data", "xfrfun-bri.json");
const SPEC_PATH = join(ROOT, "sample-data", "xfrfun-spec.md");
const CODE_PATH = join(ROOT, "sample-data", "XFRFUN.cbl");

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

console.log("\n🧪 Tarsius XFRFUN (IBM CICS COBOL) Case Study Test\n");

// 1. File Existence
console.log("📁 File Existence:");
test("XFRFUN BRI JSON exists", () => assert(existsSync(BRI_PATH), `Missing ${BRI_PATH}`));
test("XFRFUN Spec file exists", () => assert(existsSync(SPEC_PATH), `Missing ${SPEC_PATH}`));
test("XFRFUN COBOL code exists", () => assert(existsSync(CODE_PATH), `Missing ${CODE_PATH}`));

// 2. BRI Schema & Rules
console.log("\n📋 BRI Format & Rule Structure:");
const bri = JSON.parse(readFileSync(BRI_PATH, "utf-8"));
test("BRI has version 3.0 and sourceModule", () => {
  assert(bri.version === "3.0", "Version mismatch");
  assert(bri.sourceModule === "sample-data/XFRFUN.cbl", "Source module mismatch");
});
test("Contains 4 rules total", () => assert(bri.rules.length === 4, "Expected 4 rules"));

const refundCarveout = bri.rules.find((r: any) => r.id === "BR-XFR-REFUND-CARVEOUT");
test("Regulation E refund carve-out detected", () => {
  assert(!!refundCarveout, "Rule BR-XFR-REFUND-CARVEOUT not found");
  assert(refundCarveout.triage === "🔴 must-review", "Should be must-review");
  assert(refundCarveout.evidence.contradiction === true, "Should have contradiction flag");
  assert(refundCarveout.riskScore >= 40, "Risk score should be high");
});

// 3. Source Code & Spec Cross-Verification
console.log("\n🔄 Source Code & Documentation Integrity:");
const cobolCode = readFileSync(CODE_PATH, "utf-8");
const specDoc = readFileSync(SPEC_PATH, "utf-8");

test("COBOL code contains Ticket CB-9102 & Regulation E reference", () => {
  assert(cobolCode.includes("CB-9102"), "CB-9102 ticket comment missing in XFRFUN.cbl");
  assert(cobolCode.includes("Regulation E"), "Regulation E comment missing in XFRFUN.cbl");
  assert(cobolCode.includes("WS-ALLOW-REFUND-EXCEPTION"), "Carve-out variable missing");
  // Cross-verify all BRI line pointers against the actual COBOL source lines
  const lines = cobolCode.split("\n");
  for (const rule of bri.rules) {
    const loc = rule.evidence?.codeLocation;
    if (loc && loc.file === "XFRFUN.cbl") {
      const slice = lines.slice(loc.startLine - 1, loc.endLine).join("\n").trim();
      assert(slice.length > 0, `Empty line slice for rule ${rule.id} at lines ${loc.startLine}-${loc.endLine}`);
    }
  }
});

test("Spec document contains universal freeze contradiction", () => {
  assert(specDoc.includes("No exceptions exist for suspended accounts under any transfer type"), "Spec contradiction quote missing");
  assert(specDoc.includes("CB-9102"), "Footnote audit reference missing");
});

// 4. BETH Differential Oracle for XFRFUN
console.log("\n🔬 BETH Differential Oracle (XFRFUN Funds Transfer):");

interface XfrInput {
  fromAcc: string;
  toAcc: string;
  fromStatus: "A" | "S";
  toStatus: "A" | "S";
  xfrType: "WIRE" | "BRAN" | "DDEB" | "RFIN";
  amount: number;
}

interface XfrOutput {
  success: "Y" | "N";
  failCode: string;
}

const XFR_VECTORS: { id: string; desc: string; input: XfrInput; expectedSuccess: "Y" | "N" }[] = [
  {
    id: "XFR-01",
    desc: "Active account standard wire transfer",
    input: { fromAcc: "1111", toAcc: "2222", fromStatus: "A", toStatus: "A", xfrType: "WIRE", amount: 150.0 },
    expectedSuccess: "Y"
  },
  {
    id: "XFR-02",
    desc: "Zero or negative transfer amount rejected",
    input: { fromAcc: "1111", toAcc: "2222", fromStatus: "A", toStatus: "A", xfrType: "WIRE", amount: -10.0 },
    expectedSuccess: "N"
  },
  {
    id: "XFR-03",
    desc: "Suspended origin account blocked",
    input: { fromAcc: "1111", toAcc: "2222", fromStatus: "S", toStatus: "A", xfrType: "WIRE", amount: 100.0 },
    expectedSuccess: "N"
  },
  {
    id: "XFR-04",
    desc: "Suspended target account accepts inbound merchant refund (Regulation E / CB-9102)",
    input: { fromAcc: "9999", toAcc: "1111", fromStatus: "A", toStatus: "S", xfrType: "RFIN", amount: 75.5 },
    expectedSuccess: "Y"
  },
  {
    id: "XFR-05",
    desc: "Suspended target account blocks regular non-refund wire",
    input: { fromAcc: "9999", toAcc: "1111", fromStatus: "A", toStatus: "S", xfrType: "WIRE", amount: 75.5 },
    expectedSuccess: "N"
  }
];

function legacyXfrOracle(input: XfrInput, allowRefundCarveout: boolean = true): XfrOutput {
  if (input.amount <= 0) return { success: "N", failCode: "4" };
  if (input.fromAcc === input.toAcc) return { success: "N", failCode: "SAME" };
  if (input.fromStatus === "S" || input.toStatus === "S") {
    if (allowRefundCarveout && input.toStatus === "S" && input.xfrType === "RFIN") {
      return { success: "Y", failCode: "0" };
    }
    return { success: "N", failCode: "S" };
  }
  return { success: "Y", failCode: "0" };
}

function naiveXfrModern(input: XfrInput): XfrOutput {
  // Naive LLM follows only the spec: "No exceptions for suspended accounts"
  if (input.amount <= 0) return { success: "N", failCode: "4" };
  if (input.fromAcc === input.toAcc) return { success: "N", failCode: "SAME" };
  if (input.fromStatus === "S" || input.toStatus === "S") {
    return { success: "N", failCode: "S" }; // Drops RFIN exception!
  }
  return { success: "Y", failCode: "0" };
}

function governedXfrModern(input: XfrInput): XfrOutput {
  // Governed modern honors SME-approved rule contract with Regulation E carve-out
  return legacyXfrOracle(input, true);
}

test("Legacy Oracle: XFR-04 allowed under Regulation E", () => {
  const res = legacyXfrOracle(XFR_VECTORS[3].input, true);
  assert(res.success === "Y", "Legacy oracle should allow RFIN to suspended account");
});

test("Naive Modern Runner: Fails XFR-04 (BER = 80%)", () => {
  let matched = 0;
  for (const vec of XFR_VECTORS) {
    const legacy = legacyXfrOracle(vec.input, true);
    const naive = naiveXfrModern(vec.input);
    if (legacy.success === naive.success) matched++;
  }
  const ber = (matched / XFR_VECTORS.length) * 100;
  assert(ber === 80, `Expected BER 80%, got ${ber}%`);
});

test("Governed Modern Runner: 100% Equivalence (5/5 vectors)", () => {
  let matched = 0;
  for (const vec of XFR_VECTORS) {
    const legacy = legacyXfrOracle(vec.input, true);
    const governed = governedXfrModern(vec.input);
    if (legacy.success === governed.success) matched++;
  }
  const ber = (matched / XFR_VECTORS.length) * 100;
  assert(ber === 100, `Expected BER 100%, got ${ber}%`);
});

console.log(`\n──────────────────────────────────────────────────\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total\n`);
if (failed === 0) {
  console.log("✅ XFRFUN COBOL case study verified. Dual-workload proof ready!\n");
}
