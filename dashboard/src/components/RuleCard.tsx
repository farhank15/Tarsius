import { AlertTriangle, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, MapPin, FileCode, ExternalLink } from "lucide-react";
import type { BusinessRule } from "../types";
import TriageBadge from "./TriageBadge";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  rule: BusinessRule;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const SOURCE_LABELS: Record<string, { label: string; cls: string }> = {
  code:     { label: "Code",     cls: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  document: { label: "Document", cls: "bg-sky-500/10    text-sky-400    border-sky-500/20"    },
};

export default function RuleCard({ rule, onApprove, onReject }: Props) {
  const isPending  = rule.approvalStatus === "pending";
  const isApproved = rule.approvalStatus === "approved";
  const isRejected = rule.approvalStatus === "rejected";

  const cardBorder = rule.evidence.contradiction
    ? "border-red-500/35 bg-gradient-to-b from-red-500/5 to-transparent"
    : rule.triage.includes("glance")
    ? "border-amber-500/25 bg-gradient-to-b from-amber-500/4 to-transparent"
    : "border-slate-700/80 bg-slate-800/30";

  return (
    <div className={`rounded-xl border transition-all duration-200 hover:shadow-lg hover:shadow-black/20 ${cardBorder}`}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 gap-3">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <TriageBadge triage={rule.triage} />
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${rule.type === "explicit" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
              {rule.type}
            </span>
          </div>
          <span className="font-mono text-xs text-slate-400 truncate">{rule.id}</span>
        </div>

        {rule.evidence.contradiction ? (
          <div className="flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-[10px] font-semibold uppercase tracking-wide">Conflict</span>
          </div>
        ) : isApproved ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : isRejected ? (
          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        ) : null}
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="mx-4 border-t border-slate-800/60" />

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-white leading-snug mb-1">{rule.title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{rule.description}</p>
        </div>

        {/* Contradiction note */}
        {rule.evidence.contradiction && rule.evidence.contradictionNote && (
          <div className="flex gap-2 bg-red-500/8 border border-red-500/20 rounded-lg p-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{rule.evidence.contradictionNote}</p>
          </div>
        )}

        {/* Doc quote */}
        {rule.evidence.docQuote && !rule.evidence.contradiction && (
          <blockquote className="border-l-2 border-teal-500/40 pl-3 text-xs text-slate-500 italic leading-relaxed">
            "{rule.evidence.docQuote}"
          </blockquote>
        )}
      </div>

      {/* ── Meta row ─────────────────────────────────────────────────── */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        <ConfidenceBadge score={rule.confidence.score} label={rule.confidence.label} />
        {rule.source.map(s => {
          const cfg = SOURCE_LABELS[s] ?? { label: s, cls: "bg-slate-700 text-slate-400 border-slate-600" };
          return (
            <span key={s} className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${cfg.cls}`}>
              {cfg.label}
            </span>
          );
        })}
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-600 font-mono">
          <FileCode className="w-3 h-3" />
          <MapPin className="w-3 h-3" />
          L{rule.evidence.codeLocation.startLine}–{rule.evidence.codeLocation.endLine}
        </span>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      {isPending && (
        <>
          <div className="mx-4 border-t border-slate-800/60" />
          <div className="px-4 py-3 flex items-center gap-2 justify-between">
            <span className="text-[11px] text-slate-600">Awaiting review</span>
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(rule.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-500 border border-emerald-600/40 hover:border-emerald-500 text-emerald-300 hover:text-white rounded-lg transition-all duration-150 font-medium"
              >
                <ThumbsUp className="w-3 h-3" /> Approve
              </button>
              <button
                onClick={() => onReject(rule.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600/15 hover:bg-red-600 border border-red-600/30 hover:border-red-600 text-red-400 hover:text-white rounded-lg transition-all duration-150 font-medium"
              >
                <ThumbsDown className="w-3 h-3" /> Reject
              </button>
            </div>
          </div>
        </>
      )}

      {!isPending && (
        <>
          <div className="mx-4 border-t border-slate-800/60" />
          <div className="px-4 py-2.5 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              isApproved ? "text-emerald-400" : isRejected ? "text-red-400" : "text-slate-500"
            }`}>
              {isApproved && <CheckCircle2 className="w-3 h-3" />}
              {isRejected && <XCircle className="w-3 h-3" />}
              <span className="capitalize">{rule.approvalStatus}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
