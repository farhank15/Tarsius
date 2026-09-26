import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { BusinessRulesPage } from "./pages/BusinessRulesPage.js";
import { RiskMapPage } from "./pages/RiskMapPage.js";
import { DecisionHistory } from "./components/DecisionHistory.js";
import { useDecisions } from "./hooks/useBriData.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2_000,
      retry: 1,
    },
  },
});

// Audit ledger page — thin wrapper so Layout can nest it via routes
function AuditPage() {
  const { data: decisions, isLoading } = useDecisions();
  if (isLoading) return <p className="text-slate-400 text-sm animate-pulse">Loading ledger…</p>;
  if (!decisions) return null;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Audit Ledger</h1>
        <p className="text-sm text-slate-500 mt-1">
          Full cryptographic decision chain · {decisions.decisions.length} entries
        </p>
      </div>
      <DecisionHistory decisions={decisions.decisions} lastChainHash={decisions.lastChainHash} />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rules" element={<BusinessRulesPage />} />
            <Route path="/risk-map" element={<RiskMapPage />} />
            <Route path="/audit" element={<AuditPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
