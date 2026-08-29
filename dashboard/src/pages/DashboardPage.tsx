import { useBriRules, useApproveRule, useDecisions, useGotchas } from "../hooks/useBriData";
import RuleCard from "../components/RuleCard";
import { DecisionHistory } from "../components/DecisionHistory";
import {
  BookOpen, Brain, AlertTriangle, ShieldAlert,
  ShieldCheck, Eye, Clock, Hash, Activity,
} from "lucide-react";
import { useState } from "react";

type Tab = "rules" | "learning";

export default function DashboardPage() {
  const { data, isLoading, error } = useBriRules();
  const { data: decisionsData } = useDecisions();
  const { data: gotchasData } = useGotchas();
  const approveMutation = useApproveRule();
  const [activeTab, setActiveTab] = useState<Tab>("rules");

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  const rules          = data?.rules ?? [];
  const summary        = data?.summary;
  const gotchas        = gotchasData?.gotchas ?? [];
  const decisions      = decisionsData?.decisions ?? [];
  const pending        = rules.filter(r => r.approvalStatus === "pending").length;
  const approved       = rules.filter(r => r.approvalStatus === "approved").length;
  const contradictions = rules.filter(r => r.evidence.contradiction).length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ── Page heading ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-lg font-semibold text-white">Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time extraction status and rule health for the active BRI session.</p>
      </div>

      {/* ── Stat strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Rules"    value={summary?.totalRules ?? rules.length} icon={BookOpen}    iconColor="text-teal-400"    iconBg="bg-teal-500/10"    />
        <StatCard label="Pending Review" value={pending}   icon={Clock}       iconColor="text-amber-400"   iconBg="bg-amber-500/10"   highlight={pending > 0}        />
        <StatCard label="Approved"       value={approved}  icon={ShieldCheck} iconColor="text-emerald-400" iconBg="bg-emerald-500/10"                                 />
        <StatCard label="Contradictions" value={contradictions} icon={AlertTriangle} iconColor="text-red-400" iconBg="bg-red-500/10" highlight={contradictions > 0} />
      </div>

      {/* ── Triage overview ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "must-review",  label: "Must Review",  icon: ShieldAlert,  color: "text-red-400",     border: "border-red-500/20",     bg: "bg-red-500/5",     bar: "bg-red-500"     },
          { key: "glance",       label: "Glance",       icon: Eye,          color: "text-amber-400",   border: "border-amber-500/20",   bg: "bg-amber-500/5",   bar: "bg-amber-500"   },
          { key: "auto-approve", label: "Auto-Approve", icon: ShieldCheck,  color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5", bar: "bg-emerald-500" },
        ].map(({ key, label, icon: Icon, color, border, bg, bar }) => {
          const count = summary?.byTriage[key as keyof typeof summary.byTriage] ?? rules.filter(r => r.triage.includes(key)).length;
          const total = rules.length || 1;
          const pct   = Math.round((count / total) * 100);
          return (
            <div key={key} className={`rounded-xl border ${border} ${bg} p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 leading-none mb-0.5">{label}</p>
                  <p className={`text-2xl font-bold leading-none ${color}`}>{count}</p>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full animate-grow-bar ${bar}`} style={{ width: `${pct}%` }} />
              </div>
              <p className={`text-[10px] mt-1 ${color} opacity-60`}>{pct}% of rules</p>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1 w-fit">
        {([["rules", BookOpen, "Rules"], ["learning", Brain, "Learning Loop"]] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === key
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${activeTab === key ? "text-teal-400" : ""}`} />
            {label}
            {key === "rules" && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${activeTab === key ? "bg-teal-500/20 text-teal-400" : "bg-slate-700/60 text-slate-500"}`}>
                {rules.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Rules tab ──────────────────────────────────────────────────── */}
      {activeTab === "rules" && (
        rules.length === 0
          ? <EmptyState icon={BookOpen} message="No rules extracted yet" sub="Run an extraction session to populate the Business Rule Inventory." />
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule, i) => (
                <div key={rule.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <RuleCard rule={rule}
                    onApprove={id => approveMutation.mutate({ ruleId: id, decision: "approved" })}
                    onReject={id  => approveMutation.mutate({ ruleId: id, decision: "rejected" })} />
                </div>
              ))}
            </div>
          )
      )}

      {/* ── Learning loop tab ──────────────────────────────────────────── */}
      {activeTab === "learning" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DecisionHistory decisions={decisions} />

          {/* Gotcha Memory */}
          <div className="card">
            <div className="card-header">
              <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-white flex-1">Gotcha Memory</h3>
              {gotchas.length > 0 && (
                <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">{gotchas.length} active</span>
              )}
            </div>
            <div className="divide-y divide-slate-800/60">
              {gotchas.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-700 gap-2">
                    <Brain className="w-6 h-6 opacity-40" />
                    <p className="text-xs">No gotchas recorded</p>
                  </div>
                )
                : gotchas.map(g => {
                  const isCritical = g.severity === "critical";
                  const isHigh     = g.severity === "high";
                  return (
                    <div key={g.id} className="p-4 hover:bg-slate-800/25 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isCritical ? "bg-red-500/15 text-red-400 border-red-500/25"
                          : isHigh   ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                          : "bg-slate-700/60 text-slate-400 border-slate-700"
                        }`}>
                          {g.severity}
                        </span>
                        <span className="text-xs text-white font-semibold truncate">{g.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{g.description}</p>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Quick stats */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-3">
            {[
              { icon: Activity,   iconCls: "text-slate-400",   label: "Total Decisions", value: decisions.length,                                                        valueCls: "text-white"       },
              { icon: ShieldCheck, iconCls: "text-emerald-400", label: "Approved",        value: decisions.filter(d => d.decision.newStatus === "approved").length,       valueCls: "text-emerald-400" },
              { icon: Brain,       iconCls: "text-purple-400",  label: "Active Gotchas",  value: gotchas.filter(g => g.active).length,                                   valueCls: "text-purple-400"  },
            ].map(({ icon: Icon, iconCls, label, value, valueCls }) => (
              <div key={label} className="card p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${iconCls}`} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 leading-none mb-1">{label}</p>
                  <p className={`text-xl font-bold leading-none ${valueCls}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared sub-components ─────────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, iconColor, iconBg, highlight = false }: {
  label: string; value: number;
  icon: React.ElementType; iconColor: string; iconBg: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-4 flex items-center gap-4 transition-all ${highlight && value > 0 ? "ring-1 ring-inset ring-amber-500/25" : ""}`}>
      <div className={`w-10 h-10 rounded-xl ${iconBg} border border-white/5 flex items-center justify-center shrink-0`}>
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 leading-none mb-1.5">{label}</p>
        <p className={`text-2xl font-bold leading-none tabular-nums ${highlight && value > 0 ? "text-amber-300" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      <p className="text-sm text-slate-500">Loading BRI data…</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex items-center gap-3 text-red-400 p-5 text-sm bg-red-500/5 border border-red-500/20 rounded-xl">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <div>
        <p className="font-medium">Failed to load BRI data</p>
        <p className="text-xs text-red-400/70 mt-0.5">Is the dev server running?</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, sub }: { icon: React.ElementType; message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-slate-600 gap-2 border border-slate-800/60 rounded-xl bg-slate-900/30">
      <Icon className="w-8 h-8 opacity-20" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
      {sub && <p className="text-xs text-slate-600 text-center max-w-xs">{sub}</p>}
    </div>
  );
}
