import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  BriDocument,
  DecisionsDocument,
  GotchasDocument,
  ApprovePayload,
  ApproveResponse,
} from "../types/index.js";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const QUERY_KEYS = {
  bri: ["bri"] as const,
  decisions: ["decisions"] as const,
  gotchas: ["gotchas"] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Polls BRI data every 3 seconds. */
export function useBriRules() {
  return useQuery<BriDocument>({
    queryKey: QUERY_KEYS.bri,
    queryFn: () => fetchJson<BriDocument>("/sample-data/tarsius-bri.json"),
    refetchInterval: 3_000,
  });
}

/** Polls decisions ledger every 5 seconds. */
export function useDecisions() {
  return useQuery<DecisionsDocument>({
    queryKey: QUERY_KEYS.decisions,
    queryFn: () =>
      fetchJson<DecisionsDocument>("/sample-data/tarsius-decisions.json"),
    refetchInterval: 5_000,
  });
}

/** Polls gotchas every 5 seconds. */
export function useGotchas() {
  return useQuery<GotchasDocument>({
    queryKey: QUERY_KEYS.gotchas,
    queryFn: () =>
      fetchJson<GotchasDocument>("/sample-data/tarsius-gotchas.json"),
    refetchInterval: 5_000,
  });
}

/** Posts an approve/reject decision and invalidates BRI + decisions caches. */
export function useApproveRule() {
  const queryClient = useQueryClient();

  return useMutation<ApproveResponse, Error, ApprovePayload>({
    mutationFn: async (payload) => {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Approve failed: ${text}`);
      }
      return res.json() as Promise<ApproveResponse>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bri });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.decisions });
    },
  });
}
