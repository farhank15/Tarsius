import RiskCard from "../components/RiskCard";
import RuleTable from "../components/RuleTable";
import Badge from "../components/Badge";

const MOCK_RULES = [
  {
    id: "BR-CANCELLED-BLOCK",
    module: "ORDVAL.rpgle",
    description: "Cancelled orders must be blocked from fulfillment",
    triage: "must-review" as const,
    confidence: "high" as const,
    contradiction: true,
  },
  {
    id: "BR-DISC-EXCEPTION",
    module: "ORDVAL.rpgle",
    description: "DISC orders bypass suspension check",
    triage: "must-review" as const,
    confidence: "high" as const,
    contradiction: true,
  },
  {
    id: "BR-MAX-AMOUNT",
    module: "ORDVAL.rpgle",
    description: "Orders exceeding $50,000 require manager approval",
    triage: "glance" as const,
    confidence: "medium" as const,
    contradiction: false,
  },
  {
    id: "BR-VIP-PRIORITY",
    module: "ORDVAL.rpgle",
    description: "VIP customers get priority queue placement",
    triage: "auto-approve" as const,
    confidence: "high" as const,
    contradiction: false,
  },
];

export default function DashboardPage() {
  const criticalCount = MOCK_RULES.filter(
    (r) => r.triage === "must-review"
  ).length;
  const glanceCount = MOCK_RULES.filter((r) => r.triage === "glance").length;
  const autoCount = MOCK_RULES.filter(
    (r) => r.triage === "auto-approve"
  ).length;
  const contradictionCount = MOCK_RULES.filter((r) => r.contradiction).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Summary Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <RiskCard
          title="Must Review"
          count={criticalCount}
          color="red"
          icon="🔴"
        />
        <RiskCard
          title="Glance"
          count={glanceCount}
          color="amber"
          icon="🟡"
        />
        <RiskCard
          title="Auto-Approved"
          count={autoCount}
          color="green"
          icon="🟢"
        />
        <RiskCard
          title="Contradictions"
          count={contradictionCount}
          color="red"
          icon="⚠️"
          highlighted
        />
      </div>

      {/* ─── Rule Table ──────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Extracted Business Rules</h3>
          <Badge variant="outline">{MOCK_RULES.length} rules</Badge>
        </div>
        <RuleTable rules={MOCK_RULES} />
      </div>

      {/* ─── Empty State Placeholder ──────────────────────────────────── */}
      <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-12 text-center">
        <div className="text-4xl mb-3">📡</div>
        <h3 className="text-slate-400 font-medium text-sm mb-1">
          Awaiting IBM Bob 2.0 Connection
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Run the Tarsius MCP server and connect it to IBM Bob 2.0 via
          custom_modes.yaml. Extracted business rules will appear here in
          real-time.
        </p>
      </div>
    </div>
  );
}
