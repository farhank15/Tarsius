import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Layers,
} from "lucide-react";
import { useState } from "react";
import type { BusinessRule, ApprovalStatus } from "../types/index.js";
import { TriageBadge } from "./TriageBadge.js";
import { ConfidenceBadge } from "./ConfidenceBadge.js";
import { useApproveRule } from "../hooks/useBriData.js";

interface Props {
  rules: BusinessRule[];
  search?: string;
  filterStatus?: ApprovalStatus | "all";
}

type SortKey = "riskScore" | "id" | "category" | "title";

export function RuleTable({ rules, search = "", filterStatus = "all" }: Props) {
  const [sort,    setSort]    = useState<SortKey>("riskScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const approve = useApproveRule();

  const filtered = rules
    .filter((r) => {
      const matchStatus = filterStatus === "all" || r.approvalStatus === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      if      (sort === "riskScore") cmp = a.riskScore - b.riskScore;
      else if (sort === "id")        cmp = a.id.localeCompare(b.id);
      else if (sort === "category")  cmp = a.category.localeCompare(b.category);
      else                           cmp = a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sort === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(key); setSortDir("desc"); }
  };

  const handleDecision = (ruleId: string, decision: "approved" | "rejected") => {
    approve.mutate({ ruleId, decision });
  };

  // ---------------------------------------------------------------------------
  // Column header component
  // ---------------------------------------------------------------------------
  function Th({
    label,
    sortKey,
    className = "",
    align = "left",
  }: {
    label: string;
    sortKey?: SortKey;
    className?: string;
    align?: "left" | "right" | "center";
  }) {
    const active = sort === sortKey;
    const SortIcon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
    return (
      <th
        className={`py-3 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap select-none
          ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
          ${sortKey ? "cursor-pointer" : ""}
          ${className}`}
        style={{ color: active ? "#818cf8" : "var(--muted)" }}
        onClick={() => sortKey && toggleSort(sortKey)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {sortKey && (
            <SortIcon
              className={`w-2.5 h-2.5 transition-opacity ${active ? "opacity-90" : "opacity-25"}`}
            />
          )}
        </span>
      </th>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-2">

      {/* Result summary */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] tabular" style={{ color: "var(--muted)" }}>
          {filtered.length} of {rules.length} rules
          {filtered.length < rules.length && " · filtered"}
        </span>
        {sort !== "riskScore" || sortDir !== "desc" ? (
          <button
            onClick={() => { setSort("riskScore"); setSortDir("desc"); }}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Reset sort
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl"
        style={{ border: "1px solid var(--border)" }}
      >
        <table className="w-full border-collapse">

          {/* Sticky header */}
          <thead>
            <tr
              style={{
                background: "linear-gradient(180deg, #0e1826 0%, #0f1623 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Th label="Rule"       sortKey="id"        className="pl-5 pr-3" />
              <Th label="Title"      sortKey="title"     className="px-3 min-w-[180px]" />
              <Th label="Category"   sortKey="category"  className="px-3" />
              <Th label="Triage"                         className="px-3" />
              <Th label="Confidence"                     className="px-3" />
              <Th label="Risk"       sortKey="riskScore" className="px-3" align="right" />
              <Th label="Location"                       className="px-3" />
              <Th label="Status"                         className="px-3" />
              <Th label=""                               className="px-3 pr-5 w-24" />
            </tr>
          </thead>

          <tbody>
            {filtered.map((rule, i) => {
              const isContradiction = rule.evidence.contradiction;
              const isEven = i % 2 === 0;
              return (
                <tr
                  key={rule.id}
                  className="group transition-colors duration-100"
                  style={{
                    background: isContradiction
                      ? "rgba(244,63,94,.04)"
                      : isEven
                      ? "transparent"
                      : "rgba(255,255,255,0.012)",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = isContradiction
                      ? "rgba(244,63,94,.08)"
                      : "rgba(255,255,255,0.025)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = isContradiction
                      ? "rgba(244,63,94,.04)"
                      : isEven
                      ? "transparent"
                      : "rgba(255,255,255,0.012)";
                  }}
                >
                  {/* Rule ID */}
                  <td className="pl-5 pr-3 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {isContradiction && (
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                      )}
                      <span className="font-mono text-[11px] text-slate-300 tracking-tight leading-none">
                        {rule.id}
                      </span>
                    </div>
                  </td>

                  {/* Title — intentionally wraps */}
                  <td className="px-3 py-3.5 min-w-[220px] max-w-[340px]">
                    <p className="text-xs text-slate-200 leading-snug line-clamp-2">
                      {rule.title}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "#94a3b8",
                      }}
                    >
                      <Layers className="w-2.5 h-2.5 opacity-50 shrink-0" />
                      {rule.category}
                    </span>
                  </td>

                  {/* Triage */}
                  <td className="px-3 py-3.5 whitespace-nowrap min-w-[130px]">
                    <TriageBadge triage={rule.triage} pulse />
                  </td>

                  {/* Confidence */}
                  <td className="px-3 py-3.5 whitespace-nowrap min-w-[120px]">
                    <ConfidenceBadge label={rule.confidence.label} score={rule.confidence.score} />
                  </td>

                  {/* Risk */}
                  <td className="px-3 py-3.5 whitespace-nowrap min-w-[90px] text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* Mini bar */}
                      <div
                        className="w-10 h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (rule.riskScore / 50) * 100)}%`,
                            background:
                              rule.riskScore >= 30
                                ? "#f43f5e"
                                : rule.riskScore >= 10
                                ? "#f59e0b"
                                : "#10b981",
                          }}
                        />
                      </div>
                      <span
                        className={`font-mono text-xs font-bold tabular ${
                          rule.riskScore >= 30
                            ? "text-rose-400"
                            : rule.riskScore >= 10
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {rule.riskScore}
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-3 py-3.5 whitespace-nowrap min-w-[150px]">
                    <span className="terminal-badge whitespace-nowrap">
                      <FileCode2 className="w-2.5 h-2.5 opacity-50 shrink-0" />
                      {rule.evidence.codeLocation.file}:{rule.evidence.codeLocation.startLine}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5 whitespace-nowrap min-w-[110px]">
                    <StatusChip status={rule.approvalStatus} />
                  </td>

                  {/* Actions */}
                  <td className="px-3 pr-5 py-3.5 whitespace-nowrap min-w-[80px]">
                    {rule.approvalStatus === "pending" ? (
                      <div className="flex items-center gap-1.5">
                        <ActionBtn
                          onClick={() => handleDecision(rule.id, "approved")}
                          disabled={approve.isPending}
                          variant="approve"
                          title="Approve"
                        >
                          {approve.isPending ? (
                            <span className="w-3 h-3 border border-emerald-400/40 border-t-emerald-400 rounded-full spin-slow" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => handleDecision(rule.id, "rejected")}
                          disabled={approve.isPending}
                          variant="reject"
                          title="Reject"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </ActionBtn>
                      </div>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: "12px" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <p className="text-sm text-slate-600">No rules match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusChip({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
        <XCircle className="w-3 h-3" /> rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-rose" />
      pending
    </span>
  );
}

function ActionBtn({
  onClick,
  disabled,
  variant,
  title,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  variant: "approve" | "reject";
  title: string;
  children: React.ReactNode;
}) {
  const styles =
    variant === "approve"
      ? {
          base: "rgba(16,185,129,.12)",
          border: "rgba(16,185,129,.3)",
          color: "#34d399",
          hover: "rgba(16,185,129,.22)",
          hoverBorder: "rgba(16,185,129,.6)",
        }
      : {
          base: "rgba(244,63,94,.1)",
          border: "rgba(244,63,94,.28)",
          color: "#fb7185",
          hover: "rgba(244,63,94,.2)",
          hoverBorder: "rgba(244,63,94,.55)",
        };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: styles.base,
        border: `1px solid ${styles.border}`,
        color: styles.color,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = styles.hover;
          (e.currentTarget as HTMLButtonElement).style.borderColor = styles.hoverBorder;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = styles.base;
        (e.currentTarget as HTMLButtonElement).style.borderColor = styles.border;
      }}
    >
      {children}
    </button>
  );
}
