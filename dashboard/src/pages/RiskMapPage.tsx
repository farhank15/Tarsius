import { useBriRules } from "../hooks/useBriData";
import { TrendingUp, ShieldAlert, Eye, ShieldCheck, AlertTriangle, Info } from "lucide-react";

export default function RiskMapPage() {
  const { data, isLoading, error } = useBriRules();

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="flex items-center gap-3 text-red-400 p-5 text-sm bg-red-500/5 border border-red-500/20 rounded-xl">
      <AlertTriangle className="w-4 h-4 shrink-0" /> Error loading data
    </div>
  );

  const rules  = data?.rules ?? [];
  const sorted = [...rules].sort((a, b) => b.riskScore - a.riskScore);
  const maxScore = sorted[0]?.riskScore ?? 100;

  const triageConfig = [
    { key: "must-review",  label: "Must Review",  icon: ShieldAlert,  textColor: "text-red-400",     bgColor: "bg-red-500/8",      borderColor: "border-red-500/20"     },
    { key: "glance",       label: "Glance",       icon: Eye,          textColor: "text-amber-400",   bgColor: "bg-amber-500/8",    borderColor: "border-amber-500/20"   },
    { key: "auto-approve", label: "Auto-Approve", icon: ShieldCheck,  textColor: "text-emerald-400", bgColor: "bg-emerald-500/8",  borderColor: "border-emerald-500/20" },
  ] as const;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Page heading */}
      <div>
        <h1 className="text-lg font-semibold text-white">Risk Map</h1>
        <p className="text-xs text-slate-500 mt-0.5">Rules ranked by risk score. Higher scores require immediate attention.</p>
      </div>

      {/* Legend */}
      <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
        <Info className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>Risk score (0–100) calculated from: contradiction detected <span className="text-red-400 font-semibold">+40</span>, low confidence <span className="text-amber-400 font-semibold">+30</span>, many affected modules <span className="text-sky-400 font-semibold">+20</span>, single source <span className="text-slate-400 font-semibold">+10</span>.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Risk score bars ──────────────────────────────────────── */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div className="w-6 h-6 rounded-md bg-slate-700/60 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-white flex-1">Risk Score Distribution</h3>
            <span className="text-[10px] text-slate-600 font-mono bg-slate-800/60 px-2 py-0.5 rounded-full">{rules.length} rules</span>
          </div>
          <div className="card-body space-y-5">
            {sorted.map((rule, i) => {
              const pct = maxScore > 0 ? (rule.riskScore / maxScore) * 100 : 0;
              const isHigh = rule.riskScore >= 40;
              const isMid  = rule.riskScore >= 20;
              const barColor   = isHigh ? "bg-red-500"    : isMid ? "bg-amber-500"   : "bg-emerald-500";
              const scoreColor = isHigh ? "text-red-400"  : isMid ? "text-amber-400" : "text-emerald-400";
              const scoreBg    = isHigh ? "bg-red-500/10" : isMid ? "bg-amber-500/10": "bg-emerald-500/10";
              return (
                <div key={rule.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-xs text-slate-200 truncate">{rule.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${
                        rule.type === "explicit"
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }`}>
                        {rule.type}
                      </span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded ${scoreColor} ${scoreBg} shrink-0 ml-3`}>
                      {rule.riskScore}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full animate-grow-bar ${barColor}`}
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1 truncate">{rule.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Triage groups ────────────────────────────────────────── */}
        <div className="space-y-3">
          {triageConfig.map(({ key, label, icon: Icon, textColor, bgColor, borderColor }) => {
            const group = rules.filter(r => r.triage.includes(key));
            return (
              <div key={key} className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden`}>
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${borderColor} bg-white/2`}>
                  <Icon className={`w-4 h-4 ${textColor}`} />
                  <span className={`text-xs font-semibold ${textColor} flex-1`}>{label}</span>
                  <span className={`text-xs font-bold tabular-nums w-5 h-5 rounded-full bg-white/10 flex items-center justify-center ${textColor}`}>
                    {group.length}
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  {group.length === 0
                    ? <p className="text-[11px] text-slate-700 italic pl-1">None</p>
                    : group.map(r => (
                      <div key={r.id} className="flex items-center gap-2 group/row">
                        <span className="font-mono text-[11px] text-slate-300 truncate flex-1">{r.id}</span>
                        <span className={`text-[10px] font-bold tabular-nums ${
                          r.riskScore >= 40 ? "text-red-400" : r.riskScore >= 20 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {r.riskScore}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
