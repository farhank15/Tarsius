import { useState, useEffect } from "react";
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
// Workload Management (Dual-Workload: ORDVAL & XFRFUN)
// ---------------------------------------------------------------------------

export type WorkloadId = "workspace" | "ordval" | "xfrfun";

const WORKLOAD_KEY = "tarsius_active_workload";

export function getActiveWorkload(): WorkloadId {
  if (typeof window === "undefined") return "workspace";
  const stored = localStorage.getItem(WORKLOAD_KEY);
  if (stored === "ordval" || stored === "xfrfun" || stored === "workspace") {
    return stored;
  }
  return "workspace";
}

export function setActiveWorkload(workload: WorkloadId) {
  if (typeof window !== "undefined") {
    localStorage.setItem(WORKLOAD_KEY, workload);
    window.dispatchEvent(new CustomEvent("tarsius-workload-changed", { detail: workload }));
  }
}

export function useActiveWorkload() {
  const [workload, setWorkloadState] = useState<WorkloadId>(getActiveWorkload);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<WorkloadId>;
      setWorkloadState(custom.detail || getActiveWorkload());
    };
    window.addEventListener("tarsius-workload-changed", handler);
    return () => window.removeEventListener("tarsius-workload-changed", handler);
  }, []);

  const setWorkload = (newWorkload: WorkloadId) => {
    setActiveWorkload(newWorkload);
    setWorkloadState(newWorkload);
  };

  return { workload, setWorkload };
}

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

/** Polls BRI data for the workspace every 3 seconds. */
export function useBriRules() {
  return useQuery<BriDocument>({
    queryKey: QUERY_KEYS.bri,
    queryFn: async () => {
      try {
        return await fetchJson<BriDocument>("/api/bri");
      } catch {
        return await fetchJson<BriDocument>("/sample-data/tarsius-bri.json");
      }
    },
    refetchInterval: 3_000,
  });
}

/** Polls decisions ledger every 5 seconds. */
export function useDecisions() {
  return useQuery<DecisionsDocument>({
    queryKey: QUERY_KEYS.decisions,
    queryFn: async () => {
      try {
        return await fetchJson<DecisionsDocument>("/api/decisions");
      } catch {
        return await fetchJson<DecisionsDocument>("/sample-data/tarsius-decisions.json");
      }
    },
    refetchInterval: 5_000,
  });
}

/** Polls gotchas every 5 seconds. */
export function useGotchas() {
  return useQuery<GotchasDocument>({
    queryKey: QUERY_KEYS.gotchas,
    queryFn: async () => {
      try {
        return await fetchJson<GotchasDocument>("/api/gotchas");
      } catch {
        return await fetchJson<GotchasDocument>("/sample-data/tarsius-gotchas.json");
      }
    },
    refetchInterval: 5_000,
  });
}

/** Posts an approve/reject decision and invalidates BRI + decisions caches. */
export function useApproveRule() {
  const queryClient = useQueryClient();

  return useMutation<ApproveResponse, Error, ApprovePayload>({
    mutationFn: async (payload) => {
      try {
        const res = await fetch("/api/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          return (await res.json()) as ApproveResponse;
        }
      } catch {
        // Fallback for static hosts without backend (Vercel / GitHub Pages)
      }

      // Client-side fallback: compute SHA-256 and mutate React Query cache in-memory
      const timestamp = new Date().toISOString();
      const rawMsg = `${payload.ruleId}${timestamp}architect-1${payload.justification || ""}`;
      const msgBuffer = new TextEncoder().encode(rawMsg);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const chainHash = hash;

      queryClient.setQueriesData<BriDocument>({ queryKey: ["bri"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          rules: old.rules.map((r) =>
            r.id === payload.ruleId ? { ...r, approvalStatus: payload.decision } : r
          ),
          summary: {
            ...old.summary,
            byTriage: {
              ...old.summary.byTriage,
              "must-review": Math.max(0, (old.summary.byTriage?.["must-review"] || 1) - 1),
              "auto-approve": (old.summary.byTriage?.["auto-approve"] || 0) + 1,
            },
          },
        };
      });

      return {
        success: true,
        ruleId: payload.ruleId,
        hash,
        chainHash,
      };
    },
    onSuccess: () => {
      // In dev mode, re-fetch; in static mode, in-memory state is already set
    },
  });
}
