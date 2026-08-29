import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BusinessRule, BriSummary, DecisionRecord, GotchaRecord } from "../types";

const BRI_PATH = "/sample-data/tarsius-bri.json";
const DECISIONS_PATH = "/sample-data/tarsius-decisions.json";
const GOTCHAS_PATH = "/sample-data/tarsius-gotchas.json";

export function useBriRules() {
  return useQuery<{ rules: BusinessRule[]; summary: BriSummary }>({
    queryKey: ["bri-rules"],
    queryFn: async () => { const res = await fetch(BRI_PATH); return res.json(); },
    refetchInterval: 3000,
  });
}

export function useDecisions() {
  return useQuery<{ decisions: DecisionRecord[] }>({
    queryKey: ["decisions"],
    queryFn: async () => { const res = await fetch(DECISIONS_PATH); return res.json(); },
    refetchInterval: 5000,
  });
}

export function useGotchas() {
  return useQuery<{ gotchas: GotchaRecord[] }>({
    queryKey: ["gotchas"],
    queryFn: async () => { const res = await fetch(GOTCHAS_PATH); return res.json(); },
    refetchInterval: 5000,
  });
}

export function useApproveRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ruleId, decision }: { ruleId: string; decision: "approved" | "rejected" }) => {
      const res = await fetch("/api/approve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId, decision }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bri-rules"] });
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });
}
