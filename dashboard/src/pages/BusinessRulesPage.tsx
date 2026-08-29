import { useBriRules, useApproveRule } from "../hooks/useBriData";
import RuleCard from "../components/RuleCard";
import {
  BookOpen, AlertTriangle, CheckCircle2, Clock, XCircle,
  Layers, GitBranch, AlertOctagon, Search,
} from "lucide-react";
import { useState } from "react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function BusinessRulesPage() {
  const { data, isLoading, error } = useBriRules();
  const approveMutation = useApproveRule();
  const [filter, setFilter]   = useState<StatusFilter>("all");
  const [search, setSearch]   = useState("");

  if (isLoading) return <Loading />;
  if (error) return <Err />;

  const allRules = data?.rules ?? [];
  const summary  = data?.summary;

  const filtered = allRules
    .filter(r => filter === "all" || r.approvalStatus === filter)
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    });

  const counts = {
    all:      allRules.length,
    pending:  allRules.filter(r => r.approvalStatus === "pending").length,
    approved: allRules.filter(r => r.approvalStatus === "approved").length,
    rejected: allRules.filter(r => r.approvalStatus === "rejected").length,
  };

  const FILTER_CFG = [
    { key: "all"      as StatusFilter, icon: Layers,       label: "All",      color: "text-slate-300" },
    { key: "pending"  as StatusFilter, icon: Clock,        label: "Pending",  color: "text-amber-400" },
    { key: "approved" as StatusFilter, icon: CheckCircle2, label: "Approved", color: "text-emerald-400" },
    { key: "rejected" as StatusFilter, icon: XCircle,      label: "Rejected", color: "text-red-400" },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ── Page heading ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-lg font-semibold text-white">Business Rules</h1>
        <p className="text-xs text-slate-500 mt-0.5">All rules extracted from the Business Rule Inventory. Approve or reject pending rules.</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total",          value: summary.totalRules,     icon: Layers,       valueCls: "text-white",       iconCls: "text-slate-400",   iconBg: "bg-slate-700/50"  },
            { label: "Explicit",       value: summary.explicit,       icon: BookOpen,     valueCls: "text-teal-300",    iconCls: "text-teal-400",    iconBg: "bg-teal-500/10"   },
            { label: "Implicit",       value: summary.implicit,       icon: GitBranch,    valueCls: "text-amber-300",   iconCls: "text-amber-400",   iconBg: "bg-amber-500/10"  },
            { label: "Contradictions", value: summary.contradictions, icon: AlertOctagon, valueCls: "text-red-300",     iconCls: "text-red-400",     iconBg: "bg-red-500/10"    },
          ].map(({ label, value, icon: Icon, valueCls, iconCls, iconBg }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${iconBg} border border-white/5 flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${iconCls}`} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 mb-0.5">{label}</p>
                <p className={`text-2xl font-bold leading-none tabular-nums ${valueCls}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search rules…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none transition-all"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_CFG.map(({ key, icon: Icon, label, color }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-teal-600/20 text-teal-300 border border-teal-500/40 shadow-sm"
                    : "bg-slate-900/80 text-slate-500 border border-slate-800 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-teal-400" : color}`} />
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${active ? "bg-teal-500/20 text-teal-400" : "bg-slate-800 text-slate-500"}`}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rule grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-600 gap-2 border border-slate-800/60 rounded-xl bg-slate-900/30">
          <BookOpen className="w-7 h-7 opacity-20" />
          <p className="text-sm font-medium text-slate-500">No rules match</p>
          <p className="text-xs text-slate-600">{search ? `No results for "${search}"` : "Try changing the filter"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rule, i) => (
            <div key={rule.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <RuleCard rule={rule}
                onApprove={id => approveMutation.mutate({ ruleId: id, decision: "approved" })}
                onReject={id  => approveMutation.mutate({ ruleId: id, decision: "rejected" })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );
}
function Err() {
  return (
    <div className="flex items-center gap-3 text-red-400 p-5 text-sm bg-red-500/5 border border-red-500/20 rounded-xl">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <p>Error loading rules</p>
    </div>
  );
}
