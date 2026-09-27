import { useState } from "react";
import {
  Search,
  X,
  LayoutList,
  LayoutGrid,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Zap,
  FileCode2,
  FileText,
  Bot,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { useBriRules } from "../hooks/useBriData.js";
import { RuleCard } from "../components/RuleCard.js";
import { RuleTable } from "../components/RuleTable.js";
import type { ApprovalStatus, BusinessRule } from "../types/index.js";

type ViewMode = "table" | "cards";

// ---------------------------------------------------------------------------
// Status filter tabs with live counts
// ---------------------------------------------------------------------------

const STATUS_TABS: { label: string; value: ApprovalStatus | "all"; icon: React.ElementType; color: string }[] = [
  { label: "All",      value: "all",      icon: LayoutList,   color: "text-slate-400" },
  { label: "Pending",  value: "pending",  icon: Clock,        color: "text-amber-400" },
  { label: "Approved", value: "approved", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Rejected", value: "rejected", icon: XCircle,      color: "text-rose-400"  },
];

function matchesSearch(r: BusinessRule, q: string) {
  if (!q) return true;
  const lq = q.toLowerCase();
  return (
    r.id.toLowerCase().includes(lq) ||
    r.title.toLowerCase().includes(lq) ||
    r.category.toLowerCase().includes(lq) ||
    r.description.toLowerCase().includes(lq)
  );
}

// ---------------------------------------------------------------------------
// BusinessRulesPage
// ---------------------------------------------------------------------------

export function BusinessRulesPage() {
  const { data: bri, isLoading } = useBriRules();
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | "all">("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [view, setView]               = useState<ViewMode>("table");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Zap className="w-4 h-4 text-emerald-400 spin-slow" />
          Loading rules…
        </div>
      </div>
    );
  }

  if (!bri) return null;

  const rules = bri.rules;

  const availableModules = Array.from(
    new Set(rules.map((r) => r.evidence?.codeLocation?.file).filter(Boolean))
  ) as string[];

  // Per-tab counts (search-independent so counts always reflect full data)
  const counts = {
    all:      rules.length,
    pending:  rules.filter((r) => r.approvalStatus === "pending").length,
    approved: rules.filter((r) => r.approvalStatus === "approved").length,
    rejected: rules.filter((r) => r.approvalStatus === "rejected").length,
  };

  // Filtered rules for card view (table manages its own filter internally)
  const filteredForCards = rules.filter(
    (r) =>
      (filterStatus === "all" || r.approvalStatus === filterStatus) &&
      (filterModule === "all" || r.evidence?.codeLocation?.file === filterModule) &&
      matchesSearch(r, search)
  );

  const contradictions = rules.filter((r) => r.evidence.contradiction).length;

  return (
    <div className="flex flex-col gap-0">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Business Rules</h1>
          </div>
          {/* Quick stats row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Pill label="Approved" count={counts.approved} color="emerald" />
            <Pill label="Pending"  count={counts.pending}  color="amber" />
            {contradictions > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-rose-300 border whitespace-nowrap shrink-0"
                style={{ background: "rgba(244,63,94,.1)", borderColor: "rgba(244,63,94,.3)" }}
              >
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {contradictions} contradiction{contradictions > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Enterprise metadata chip strip */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Code source */}
          <MetaChip
            icon={FileCode2}
            label={bri.sourceModule.split("/").pop() ?? bri.sourceModule}
            title="Code source module"
            color="sky"
          />
          {/* Spec document */}
          {bri.attachedDocs && bri.attachedDocs.length > 0 && (
            <MetaChip
              icon={FileText}
              label={bri.attachedDocs[0].split("/").pop() ?? bri.attachedDocs[0]}
              title="Specification document"
              color="amber"
            />
          )}
          {/* Verified rule count */}
          <MetaChip
            icon={ShieldCheck}
            label={`${rules.length} verified rules`}
            title="Total extracted rules"
            color="emerald"
          />
          {/* Engine */}
          <MetaChip
            icon={Bot}
            label="Bob 2.0 Legacy Analyzer"
            title="Extraction engine"
            color="indigo"
          />
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-3 pb-5"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search ID, title, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(129,140,248,.5)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div
          className="flex items-center rounded-xl p-1 gap-0.5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {STATUS_TABS.map(({ label, value, icon: Icon, color }) => {
            const active = filterStatus === value;
            const count = counts[value as keyof typeof counts];
            return (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-white/[0.07] text-slate-100"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                }`}
              >
                <Icon className={`w-3 h-3 ${active ? color : ""}`} />
                {label}
                <span className={`tabular text-[10px] font-bold ${active ? color : "text-slate-600"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Module tabs (when repo has multiple modules) */}
        {availableModules.length > 1 && (
          <div
            className="flex items-center rounded-xl p-1 gap-0.5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <button
              onClick={() => setFilterModule("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterModule === "all"
                  ? "bg-white/[0.07] text-slate-100"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
              }`}
            >
              <Layers className="w-3 h-3 text-slate-400" />
              All Modules
              <span className="tabular text-[10px] font-bold text-slate-500">
                {rules.length}
              </span>
            </button>
            {availableModules.map((mod) => {
              const active = filterModule === mod;
              const count = rules.filter((r) => r.evidence?.codeLocation?.file === mod).length;
              return (
                <button
                  key={mod}
                  onClick={() => setFilterModule(mod)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    active
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                  }`}
                >
                  <FileCode2 className={`w-3 h-3 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                  {mod}
                  <span className={`tabular text-[10px] font-bold ${active ? "text-indigo-300" : "text-slate-600"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* View toggle */}
        <div
          className="flex items-center rounded-xl p-1 gap-0.5 ml-auto"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <ViewBtn active={view === "table"} onClick={() => setView("table")} title="Table">
            <LayoutList className="w-3.5 h-3.5" />
          </ViewBtn>
          <ViewBtn active={view === "cards"} onClick={() => setView("cards")} title="Cards">
            <LayoutGrid className="w-3.5 h-3.5" />
          </ViewBtn>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      {view === "table" ? (
        <RuleTable rules={rules} search={search} filterStatus={filterStatus} filterModule={filterModule} />
      ) : (
        <>
          {/* Card grid result count */}
          <p className="text-[11px] mb-3 tabular" style={{ color: "var(--muted)" }}>
            Showing {filteredForCards.length} of {rules.length} rules
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredForCards.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
            {filteredForCards.length === 0 && (
              <div
                className="col-span-2 rounded-xl py-16 text-center"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <Search className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--muted)" }} />
                <p className="text-slate-500 text-sm">No rules match your search.</p>
                <button
                  onClick={() => { setSearch(""); setFilterStatus("all"); }}
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function Pill({ label, count, color }: { label: string; count: number; color: "emerald" | "amber" | "rose" }) {
  const styles = {
    emerald: { bg: "rgba(16,185,129,.1)", border: "rgba(16,185,129,.25)", text: "#34d399" },
    amber:   { bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.25)", text: "#fbbf24" },
    rose:    { bg: "rgba(244,63,94,.1)",  border: "rgba(244,63,94,.25)",  text: "#fb7185" },
  }[color];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold tabular"
      style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.text }}
    >
      {count} {label}
    </span>
  );
}

function ViewBtn({ active, onClick, title, children }: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${
        active ? "bg-white/[0.08] text-slate-200" : "text-slate-600 hover:text-slate-300 hover:bg-white/[0.03]"
      }`}
    >
      {children}
    </button>
  );
}

type MetaChipColor = "sky" | "amber" | "emerald" | "indigo";

function MetaChip({
  icon: Icon,
  label,
  title,
  color,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
  color: MetaChipColor;
}) {
  const styles: Record<MetaChipColor, { bg: string; border: string; text: string; icon: string }> = {
    sky:     { bg: "rgba(125,211,252,.06)", border: "rgba(125,211,252,.2)", text: "#7dd3fc", icon: "#38bdf8" },
    amber:   { bg: "rgba(245,158,11,.06)",  border: "rgba(245,158,11,.2)",  text: "#fbbf24", icon: "#f59e0b" },
    emerald: { bg: "rgba(16,185,129,.06)",  border: "rgba(16,185,129,.2)",  text: "#34d399", icon: "#10b981" },
    indigo:  { bg: "rgba(129,140,248,.06)", border: "rgba(129,140,248,.2)", text: "#a5b4fc", icon: "#818cf8" },
  };
  const s = styles[color];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
      title={title}
    >
      <Icon className="w-3 h-3 shrink-0" style={{ color: s.icon }} />
      {label}
    </span>
  );
}
