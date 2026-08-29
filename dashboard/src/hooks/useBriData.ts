import { useQuery } from "@tanstack/react-query";
import type { BusinessRule } from "../types";

/**
 * Placeholder hook for fetching Business Rule Inventory data.
 *
 * During hackathon, this will read from .tarsius/bri/ JSON files
 * or query the MCP server via HTTP bridge.
 */
export function useBriRules() {
  return useQuery<BusinessRule[]>({
    queryKey: ["bri-rules"],
    queryFn: async () => {
      // STUB: Replace with actual data fetching during hackathon
      return [];
    },
    enabled: false, // Disabled until MCP server is connected
  });
}

export function useBriIndex() {
  return useQuery({
    queryKey: ["bri-index"],
    queryFn: async () => {
      // STUB: Replace with actual data fetching during hackathon
      return { modules: {} };
    },
    enabled: false,
  });
}
