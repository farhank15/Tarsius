import { checkGotchas, type Gotcha } from "../bri/gotcha-store.js";

export interface CheckGotchasInput {
  ruleId?: string;
  category?: string;
}

export interface CheckGotchasResult {
  gotchas: Gotcha[];
  count: number;
}

/**
 * Thin wrapper around checkGotchas() for use as an MCP tool handler.
 */
export async function handleCheckGotchas(
  input: CheckGotchasInput
): Promise<CheckGotchasResult> {
  const gotchas = await checkGotchas(input.ruleId, input.category);
  return { gotchas, count: gotchas.length };
}
