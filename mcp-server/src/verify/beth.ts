/**
 * BETH — Behavioral Equivalence Test Harness
 *
 * Implements the differential oracle that executes the 12 ORDVAL test vectors
 * against both the legacy oracle (SME-approved BRI rules) and a modernized
 * runner, reporting a Behavioral Equivalence Rate (BER) per vector.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRI_PATH = resolve(__dirname, "../../../sample-data/tarsius-bri.json");

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface OrderInput {
  custId: string;
  custStatus: string;
  suspendedFlag: "Y" | "N";
  orderType: "STND" | "DISC" | "EXPR" | "CORP";
  planId: string;
  amount: number;
}

export interface BehaviorOutput {
  result: "A" | "R";
  priceSource: "legacy" | "std" | null;
  trace: string[];
}

export interface VectorResult {
  vectorId: string;
  description: string;
  input: OrderInput;
  legacyOutput: BehaviorOutput;
  modernOutput: BehaviorOutput;
  equivalent: boolean;
}

export interface BethReport {
  runnerName: string;
  totalVectors: number;
  equivalent: number;
  nonEquivalent: number;
  /** Behavioral Equivalence Rate as a percentage (0–100) */
  berRate: number;
  /** Behavioral Equivalence Rate as a fraction (0–1) */
  ber: number;
  confidence: "high" | "medium" | "low";
  vectors: VectorResult[];
}

// ---------------------------------------------------------------------------
// Legacy oracle
// ---------------------------------------------------------------------------

function resolveApproved(explicitApprovedIds?: string[]): Set<string> {
  if (explicitApprovedIds) return new Set(explicitApprovedIds);
  try {
    const raw = readFileSync(BRI_PATH, "utf-8");
    const bri = JSON.parse(raw);
    return new Set(
      bri.rules
        .filter((r: { approvalStatus: string }) => r.approvalStatus === "approved")
        .map((r: { id: string }) => r.id)
    );
  } catch {
    return new Set([
      "BR-CANCELLED-BLOCK",
      "BR-SUSPENDED-BLOCK",
      "BR-DISC-EXCEPTION",
      "BR-GRANDFATHER-PRICING",
    ]);
  }
}

/**
 * Implements the SME-approved legacy ORDVAL business rules.
 * `approvedRuleIds` controls which rules are active; when omitted, reads the
 * currently approved rules from sample-data/tarsius-bri.json on disk.
 */
export function legacyOracle(
  input: OrderInput,
  approvedRuleIds?: string[]
): BehaviorOutput {
  const approvedSet = resolveApproved(approvedRuleIds);
  const approved = (id: string): boolean => approvedSet.has(id);

  const trace: string[] = [];

  // BR-CANCELLED-BLOCK: reject customers with status "C"
  if (approved("BR-CANCELLED-BLOCK") && input.custStatus === "C") {
    trace.push("BR-CANCELLED-BLOCK");
    return { result: "R", priceSource: null, trace };
  }

  // BR-SUSPENDED-BLOCK: reject customers with status "S"
  if (approved("BR-SUSPENDED-BLOCK") && input.custStatus === "S") {
    trace.push("BR-SUSPENDED-BLOCK");
    return { result: "R", priceSource: null, trace };
  }

  // suspendedFlag = "Y" path
  if (input.suspendedFlag === "Y") {
    // BR-DISC-EXCEPTION: DISC orders for suspended-flag customers are allowed
    if (approved("BR-DISC-EXCEPTION") && input.orderType === "DISC") {
      trace.push("BR-DISC-EXCEPTION");
      const priceSource: "legacy" | "std" =
        approved("BR-GRANDFATHER-PRICING") && input.planId === "PLAN7"
          ? "legacy"
          : "std";
      return { result: "A", priceSource, trace };
    }
    // All other suspended-flag orders are rejected
    return { result: "R", priceSource: null, trace };
  }

  // Any non-active status (not "A") is rejected
  if (input.custStatus !== "A") {
    return { result: "R", priceSource: null, trace };
  }

  // Active customer — determine price source
  // BR-GRANDFATHER-PRICING: PLAN7 customers use legacy pricing
  const priceSource: "legacy" | "std" =
    approved("BR-GRANDFATHER-PRICING") && input.planId === "PLAN7"
      ? "legacy"
      : "std";

  return { result: "A", priceSource, trace };
}

// ---------------------------------------------------------------------------
// 12 ORDVAL test vectors
// ---------------------------------------------------------------------------

export const ORDVAL_VECTORS: Array<{
  vectorId: string;
  description: string;
  input: OrderInput;
}> = [
  {
    vectorId: "V01",
    description: "baseline — active customer, standard order",
    input: { custId: "C001", custStatus: "A", suspendedFlag: "N", orderType: "STND", planId: "PLAN1", amount: 100 },
  },
  {
    vectorId: "V02",
    description: "cancelled customer blocked",
    input: { custId: "C002", custStatus: "C", suspendedFlag: "N", orderType: "STND", planId: "PLAN1", amount: 100 },
  },
  {
    vectorId: "V03",
    description: "suspended status customer blocked",
    input: { custId: "C003", custStatus: "S", suspendedFlag: "N", orderType: "STND", planId: "PLAN1", amount: 100 },
  },
  {
    vectorId: "V04",
    description: "suspended-flag DISC order — carve-out applies",
    input: { custId: "C004", custStatus: "A", suspendedFlag: "Y", orderType: "DISC", planId: "PLAN1", amount: 100 },
  },
  {
    vectorId: "V05",
    description: "suspended-flag standard order — rejected",
    input: { custId: "C005", custStatus: "A", suspendedFlag: "Y", orderType: "STND", planId: "PLAN1", amount: 100 },
  },
  {
    vectorId: "V06",
    description: "PLAN7 active customer — grandfather pricing",
    input: { custId: "C006", custStatus: "A", suspendedFlag: "N", orderType: "STND", planId: "PLAN7", amount: 100 },
  },
  {
    vectorId: "V07",
    description: "PLAN7 active DISC order",
    input: { custId: "C007", custStatus: "A", suspendedFlag: "N", orderType: "DISC", planId: "PLAN7", amount: 100 },
  },
  {
    vectorId: "V08",
    description: "express order — active customer",
    input: { custId: "C008", custStatus: "A", suspendedFlag: "N", orderType: "EXPR", planId: "PLAN1", amount: 200 },
  },
  {
    vectorId: "V09",
    description: "corporate order — active customer",
    input: { custId: "C009", custStatus: "A", suspendedFlag: "N", orderType: "CORP", planId: "PLAN1", amount: 500 },
  },
  {
    vectorId: "V10",
    description: "unknown/inactive status — rejected",
    input: { custId: "C010", custStatus: "X", suspendedFlag: "N", orderType: "STND", planId: "PLAN1", amount: 100 },
  },
  {
    vectorId: "V11",
    description: "negative amount — active customer (amount not a gate)",
    input: { custId: "C011", custStatus: "A", suspendedFlag: "N", orderType: "STND", planId: "PLAN1", amount: -50 },
  },
  {
    vectorId: "V12",
    description: "PLAN7 suspended-flag DISC order — carve-out + grandfather pricing",
    input: { custId: "C012", custStatus: "A", suspendedFlag: "Y", orderType: "DISC", planId: "PLAN7", amount: 100 },
  },
];

// ---------------------------------------------------------------------------
// Naive modern runner
// ---------------------------------------------------------------------------

/**
 * Spec-literal modernization: blocks any customer with status "C" or "S", and
 * any order with suspendedFlag="Y" — without the DISC carve-out.
 * This intentionally breaks V04 and V12 to demonstrate the missing exception.
 */
export function runNaiveModern(input: OrderInput): BehaviorOutput {
  const trace: string[] = [];

  if (input.custStatus === "C") {
    trace.push("BR-CANCELLED-BLOCK");
    return { result: "R", priceSource: null, trace };
  }

  if (input.custStatus === "S") {
    trace.push("BR-SUSPENDED-BLOCK");
    return { result: "R", priceSource: null, trace };
  }

  // Naively rejects all suspended-flag orders — missing the DISC carve-out
  if (input.suspendedFlag === "Y") {
    return { result: "R", priceSource: null, trace };
  }

  if (input.custStatus !== "A") {
    return { result: "R", priceSource: null, trace };
  }

  const priceSource: "legacy" | "std" = input.planId === "PLAN7" ? "legacy" : "std";
  return { result: "A", priceSource, trace };
}

// ---------------------------------------------------------------------------
// Governed modern runner
// ---------------------------------------------------------------------------

/**
 * RISK-CONTEXT-compliant modernization: implements all approved rules including
 * the DISC suspended-flag carve-out (BR-DISC-EXCEPTION) and Plan-7 grandfather
 * pricing (BR-GRANDFATHER-PRICING).
 */
export function runGovernedModern(input: OrderInput): BehaviorOutput {
  const trace: string[] = [];

  if (input.custStatus === "C") {
    trace.push("BR-CANCELLED-BLOCK");
    return { result: "R", priceSource: null, trace };
  }

  if (input.custStatus === "S") {
    trace.push("BR-SUSPENDED-BLOCK");
    return { result: "R", priceSource: null, trace };
  }

  if (input.suspendedFlag === "Y") {
    if (input.orderType === "DISC") {
      trace.push("BR-DISC-EXCEPTION");
      const priceSource: "legacy" | "std" = input.planId === "PLAN7" ? "legacy" : "std";
      return { result: "A", priceSource, trace };
    }
    return { result: "R", priceSource: null, trace };
  }

  if (input.custStatus !== "A") {
    return { result: "R", priceSource: null, trace };
  }

  const priceSource: "legacy" | "std" = input.planId === "PLAN7" ? "legacy" : "std";
  return { result: "A", priceSource, trace };
}

// ---------------------------------------------------------------------------
// BETH runner
// ---------------------------------------------------------------------------

function outputsEquivalent(a: BehaviorOutput, b: BehaviorOutput): boolean {
  return a.result === b.result && a.priceSource === b.priceSource;
}

/**
 * Execute the 12 ORDVAL test vectors against the legacy oracle and the
 * supplied modern runner, returning a BethReport with per-vector results and
 * an overall Behavioral Equivalence Rate (BER).
 */
export function runBeth(
  runner: (input: OrderInput) => BehaviorOutput,
  options?: { runnerName?: string; approvedRuleIds?: string[] }
): BethReport {
  const runnerName = options?.runnerName ?? "unknown";
  const approvedRuleIds = options?.approvedRuleIds;

  const vectors: VectorResult[] = ORDVAL_VECTORS.map((v) => {
    const legacyOutput = legacyOracle(v.input, approvedRuleIds);
    const modernOutput = runner(v.input);
    return {
      vectorId: v.vectorId,
      description: v.description,
      input: v.input,
      legacyOutput,
      modernOutput,
      equivalent: outputsEquivalent(legacyOutput, modernOutput),
    };
  });

  const equivalent = vectors.filter((v) => v.equivalent).length;
  const total = vectors.length;
  const berRate = Math.round((equivalent / total) * 100);
  const ber = equivalent / total;
  const confidence: "high" | "medium" | "low" =
    berRate === 100 ? "high" : berRate >= 75 ? "medium" : "low";

  return {
    runnerName,
    totalVectors: total,
    equivalent,
    nonEquivalent: total - equivalent,
    berRate,
    ber,
    confidence,
    vectors,
  };
}
