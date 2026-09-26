import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  FileText,
  GitCompare,
  Cpu,
} from "lucide-react";
import type { BusinessRule } from "../types/index.js";
import { TriageBadge } from "./TriageBadge.js";
import { ConfidenceBadge } from "./ConfidenceBadge.js";
import { useApproveRule } from "../hooks/useBriData.js";

interface Props {
  rule: BusinessRule;
}

export function RuleCard({ rule }: Props) {
  const approve = useApproveRule();

  const handleDecision = (decision: "approved" | "rejected") => {
    approve.mutate({ ruleId: rule.id, decision });
  };

  const isContradiction = rule.evidence.contradiction;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl transition-all duration-200"
      style={{
        background: "var(--bg-card)",
        border: isContradiction
          ? "1px solid rgba(244,63,94,.35)"
          : "1px solid var(--border)",
        borderTop: isContradiction
          ? "1px solid rgba(244,63,94,.5)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isContradiction ? "0 0 20px rgba(244,63,94,.06)" : undefined,
      }}
    >
      {/* ── Card top accent bar (contradiction only) ────── */}
      {isContradiction && (
        <div
          className="h-0.5 w-full"
          style={{
            background: "linear-gradient(90deg, rgba(244,63,94,.7) 0%, rgba(244,63,94,.2) 60%, transparent 100%)",
          }}
        />
      )}

      <div className="flex flex-col gap-0 flex-1">

        {/* ── Header section ──────────────────────────────── */}
        <div className="px-5 pt-4 pb-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              {/* ID + badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748b",
                  }}
                >
                  {rule.id}
                </span>
                {/* Explicit / implicit type pill */}
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background:
                      rule.type === "explicit"
                        ? "rgba(16,185,129,.08)"
                        : "rgba(129,140,248,.08)",
                    border:
                      rule.type === "explicit"
                        ? "1px solid rgba(16,185,129,.2)"
                        : "1px solid rgba(129,140,248,.2)",
                    color:
                      rule.type === "explicit" ? "#34d399" : "#a5b4fc",
                  }}
                >
                  {rule.type}
                </span>
                <TriageBadge triage={rule.triage} pulse />
                <ConfidenceBadge label={rule.confidence.label} score={rule.confidence.score} />
              </div>
              {/* Title */}
              <h3 className="font-semibold text-slate-100 text-sm leading-snug">{rule.title}</h3>
            </div>
            {/* Approval status badge */}
            <ApprovalBadge status={rule.approvalStatus} />
          </div>
        </div>

        {/* ── Body section ────────────────────────────────── */}
        <div className="px-5 py-4 flex flex-col gap-4 flex-1">

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed">{rule.description}</p>

          {/* Contradiction diff box */}
          {isContradiction && (
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(244,63,94,.25)" }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  background: "rgba(244,63,94,.1)",
                  borderBottom: "1px solid rgba(244,63,94,.18)",
                }}
              >
                <GitCompare className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wide">
                  Code ≠ Spec
                </span>
                <AlertTriangle className="w-3 h-3 text-rose-400 ml-auto" />
              </div>
              {/* CODE side */}
              <div
                className="px-3 py-2.5 flex items-start gap-2.5"
                style={{ borderBottom: "1px solid rgba(244,63,94,.1)" }}
              >
                <span
                  className="text-[10px] font-bold shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(125,211,252,.12)", border: "1px solid rgba(125,211,252,.2)", color: "#7dd3fc" }}
                >
                  CODE
                </span>
                <p className="text-xs text-sky-300/80 leading-relaxed">
                  {rule.evidence.contradictionNote ?? "Implementation differs from specification."}
                </p>
              </div>
              {/* SPEC side */}
              {rule.evidence.docQuote && (
                <div className="px-3 py-2.5 flex items-start gap-2.5">
                  <span
                    className="text-[10px] font-bold shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.2)", color: "#fbbf24" }}
                  >
                    SPEC
                  </span>
                  <p className="text-xs text-amber-300/80 leading-relaxed italic">
                    "{rule.evidence.docQuote}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Doc quote (non-contradiction only) */}
          {rule.evidence.docQuote && !isContradiction && (
            <div
              className="flex items-start gap-2 text-xs text-slate-500 italic pl-3"
              style={{ borderLeft: "2px solid rgba(255,255,255,0.07)" }}
            >
              <FileText className="w-3 h-3 shrink-0 mt-0.5 text-slate-700" />
              "{rule.evidence.docQuote}"
            </div>
          )}

          {/* Meta chips row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="terminal-badge whitespace-nowrap shrink-0">
              <FileCode2 className="w-2.5 h-2.5 opacity-50 shrink-0" />
              {rule.evidence.codeLocation.file}:{rule.evidence.codeLocation.startLine}–{rule.evidence.codeLocation.endLine}
            </span>

            <span
              className="text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap shrink-0"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#64748b",
              }}
            >
              {rule.category}
            </span>

            <span
              className={`font-mono text-[11px] font-bold tabular whitespace-nowrap shrink-0 ${
                rule.riskScore >= 30
                  ? "text-rose-400"
                  : rule.riskScore >= 10
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              risk: {rule.riskScore}
            </span>

            {/* Source labels */}
            {rule.source.map((s) => (
              <span
                key={s}
                className="text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap shrink-0"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#475569",
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Affects modules */}
          {rule.affectsModules.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Cpu className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="text-[10px] text-slate-600">Affects:</span>
              {rule.affectsModules.map((m) => (
                <span
                  key={m}
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(129,140,248,.07)",
                    border: "1px solid rgba(129,140,248,.15)",
                    color: "#818cf8",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Actions footer ───────────────────────────────── */}
        {rule.approvalStatus === "pending" && (
          <div
            className="px-5 py-3.5 flex items-center gap-2.5"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(0,0,0,.15)",
            }}
          >
            <button
              className="btn-approve flex-1 justify-center"
              onClick={() => handleDecision("approved")}
              disabled={approve.isPending}
            >
              {approve.isPending ? (
                <span className="w-3 h-3 border border-emerald-400/40 border-t-emerald-400 rounded-full spin-slow" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Approve
            </button>
            <button
              className="btn-reject flex-1 justify-center"
              onClick={() => handleDecision("rejected")}
              disabled={approve.isPending}
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        )}

        {approve.isError && (
          <p className="px-5 pb-3 text-xs text-rose-400">{approve.error.message}</p>
        )}
      </div>
    </div>
  );
}

function ApprovalBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full"
        style={{
          background: "rgba(16,185,129,.1)",
          border: "1px solid rgba(16,185,129,.25)",
          color: "#34d399",
        }}
      >
        <CheckCircle2 className="w-3 h-3" /> approved
      </span>
    );
  if (status === "rejected")
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full"
        style={{
          background: "rgba(244,63,94,.1)",
          border: "1px solid rgba(244,63,94,.25)",
          color: "#fb7185",
        }}
      >
        <XCircle className="w-3 h-3" /> rejected
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full"
      style={{
        background: "rgba(245,158,11,.1)",
        border: "1px solid rgba(245,158,11,.25)",
        color: "#fbbf24",
      }}
    >
      pending
    </span>
  );
}
