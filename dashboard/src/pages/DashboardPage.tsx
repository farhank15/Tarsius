import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useBriRules, useDecisions, useGotchas, useApproveRule } from "../hooks/useBriData.js";
import { TriageBadge } from "../components/TriageBadge.js";
import { ConfidenceBadge } from "../components/ConfidenceBadge.js";
import { DecisionHistory } from "../components/DecisionHistory.js";
import type { BusinessRule } from "../types/index.js";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  accentClass,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accentClass: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className={`card ${accentClass} flex items-center gap-4`}>
      <div
        className="p-2.5 rounded-xl shrink-0"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className={`text-3xl font-bold tabular leading-none ${iconColor}`}>{value}</p>
        <p className="text-xs font-semibold text-slate-300 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick-approve row
// ---------------------------------------------------------------------------

function PendingRow({ rule }: { rule: BusinessRule }) {
  const approve = useApproveRule();

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl transition-all border
        ${rule.evidence.contradiction
          ? "bg-rose-950/15 border-rose-800/40 hover:bg-rose-950/25"
          : "bg-[var(--bg-card)] border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
        }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {rule.evidence.contradiction && (
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-slate-400">{rule.id}</span>
            <TriageBadge triage={rule.triage} pulse />
            <ConfidenceBadge label={rule.confidence.label} score={rule.confidence.score} />
          </div>
          <p className="text-sm text-slate-200 font-medium mt-0.5 truncate">{rule.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="btn-approve"
          onClick={() => approve.mutate({ ruleId: rule.id, decision: "approved" })}
          disabled={approve.isPending}
        >
          {approve.isPending ? (
            <span className="w-3 h-3 border border-emerald-400/40 border-t-emerald-400 rounded-full spin-slow" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          Approve
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const { data: bri, isLoading: briLoading } = useBriRules();
  const { data: decisions, isLoading: decLoading } = useDecisions();
  const { data: gotchas } = useGotchas();

  if (briLoading || decLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-emerald-400 spin-slow" />
          Loading governance data…
        </div>
      </div>
    );
  }

  if (!bri || !decisions) return null;

  const rules = bri.rules;
  const approvedCount  = rules.filter((r) => r.approvalStatus === "approved").length;
  const pendingRules   = rules.filter((r) => r.approvalStatus === "pending");
  const contradictions = rules.filter((r) => r.evidence.contradiction);
  const activeGotchas  = gotchas?.gotchas.filter((g) => g.active) ?? [];

  const byTriage = {
    auto:   rules.filter((r) => r.triage === "🟢 auto-approve").length,
    glance: rules.filter((r) => r.triage === "🟡 glance").length,
    review: rules.filter((r) => r.triage === "🔴 must-review").length,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Overview</h1>
          <p className="text-sm text-[var(--text-sub)] mt-1">
            Business Rule Inventory · Live governance status
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          <span className="tabular">{approvedCount}/{rules.length} approved</span>
        </div>
      </div>

      {/* ── Stat grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp} accentClass="stat-indigo" iconColor="text-indigo-300"
          label="Total Rules" value={rules.length}
          sub={[
            bri.sourceModule.split("/").pop(),
            bri.attachedDocs?.[0]?.split("/").pop(),
          ].filter(Boolean).join(" · ")}
        />
        <StatCard
          icon={CheckCircle2} accentClass="stat-emerald" iconColor="text-emerald-300"
          label="🟢 Auto-approve" value={byTriage.auto}
        />
        <StatCard
          icon={Clock} accentClass="stat-amber" iconColor="text-amber-300"
          label="🟡 Glance" value={byTriage.glance}
        />
        <StatCard
          icon={AlertTriangle} accentClass="stat-rose" iconColor="text-rose-300"
          label="🔴 Must-review" value={byTriage.review}
        />
      </div>

      {/* ── Contradiction incident banner ──────────────── */}
      {contradictions.length > 0 && (
        <div className="incident-bar px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <p className="font-semibold text-rose-200 text-sm">
                  {contradictions.length} Code/Doc Contradiction{contradictions.length > 1 ? "s" : ""} Detected
                </p>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-900/50 border border-rose-700/50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Needs Review
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {contradictions.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 text-xs">
                    <span className="font-mono text-rose-400 shrink-0">{r.id}</span>
                    <span className="text-rose-300/70">—</span>
                    {/* Code vs doc comparison pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-sky-400 font-mono text-[10px]">
                        code
                      </span>
                      <span className="text-slate-600">≠</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-400 font-mono text-[10px]">
                        spec
                      </span>
                      <span className="text-rose-400/70">{r.evidence.contradictionNote}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href="/rules"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Review Carve-out
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Gotcha warnings ────────────────────────────── */}
      {activeGotchas.length > 0 && (
        <div
          className="rounded-xl px-4 py-3.5 flex flex-col gap-2"
          style={{
            background: "linear-gradient(90deg, rgba(245,158,11,.06) 0%, rgba(245,158,11,.02) 100%)",
            border: "1px solid rgba(245,158,11,.2)",
            borderLeft: "3px solid rgba(245,158,11,.6)",
          }}
        >
          <p className="text-sm font-semibold text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Institutional Gotcha Warnings
          </p>
          {activeGotchas.map((g) => (
            <div key={g.id} className="text-xs text-amber-400/90 flex items-start gap-2">
              <span
                className={`font-bold uppercase shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${
                  g.severity === "critical"
                    ? "text-rose-300 bg-rose-900/40 border-rose-700/40"
                    : "text-amber-300 bg-amber-900/30 border-amber-700/30"
                }`}
              >
                {g.severity}
              </span>
              <span><span className="font-medium text-amber-200">{g.title}</span>: {g.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick approvals ────────────────────────────── */}
      {pendingRules.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-200">
              Pending Approvals
            </h2>
            <span className="tabular text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
              {pendingRules.length} waiting
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {pendingRules.map((rule) => (
              <PendingRow key={rule.id} rule={rule} />
            ))}
          </div>
        </section>
      )}

      {/* ── Recent decisions ───────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-200">Recent Decisions</h2>
          <span className="tabular text-[11px] text-slate-500">
            {decisions.decisions.length} total
          </span>
        </div>
        <DecisionHistory
          decisions={decisions.decisions.slice(-5).reverse()}
          lastChainHash={decisions.lastChainHash}
        />
      </section>
    </div>
  );
}
