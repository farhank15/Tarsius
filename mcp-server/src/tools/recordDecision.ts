import {
  recordDecision,
  type RecordDecisionInput,
  type DecisionEntry,
} from "../bri/decision-store.js";

export type { RecordDecisionInput };

export interface RecordDecisionResult {
  entry: DecisionEntry;
}

/**
 * Thin wrapper around recordDecision() for use as an MCP tool handler.
 */
export async function handleRecordDecision(
  input: RecordDecisionInput
): Promise<RecordDecisionResult> {
  const entry = await recordDecision(input);
  return { entry };
}
