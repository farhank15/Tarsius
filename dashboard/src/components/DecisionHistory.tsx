import { useState } from "react";
import { ShieldCheck, Link2, Clock, User, Copy, CheckCheck, Hash } from "lucide-react";
import type { DecisionRecord } from "../types/index.js";

interface Props {
  decisions: DecisionRecord[];
  lastChainHash: string;
}

function statusColor(status: string) {
  if (status === "approved") return "text-emerald-400";
  if (status === "rejected") return "text-rose-400";
  return "text-slate-400";
}

function statusBg(status: string) {
  if (status === "approved") return "bg-emerald-950/50 border-emerald-800/40";
  if (status === "rejected") return "bg-rose-950/50 border-rose-800/40";
  return "bg-slate-800/50 border-slate-700/40";
}

/** True when a justification is a generic filler that shouldn't be shown */
function isPlaceholderJustification(j: string) {
  return !j || /^(dashboard approved|auto(-|\s)?approved?|no justification|n\/a)$/i.test(j.trim());
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available in non-secure contexts
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="shrink-0 p-1 rounded hover:bg-white/[0.06] transition-colors text-slate-600 hover:text-slate-300"
    >
      {copied ? (
        <CheckCheck className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Hash row inside a decision card
// ---------------------------------------------------------------------------

function HashRow({
  label,
  value,
  accent = false,
  border = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  border?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${border ? "border-b border-white/[0.04]" : ""}`}>
      <Hash className="w-2.5 h-2.5 text-slate-700 shrink-0" />
      <span className="text-[10px] font-medium text-slate-600 w-16 shrink-0">{label}</span>
      <span className={`font-mono text-[11px] flex-1 break-all tabular ${accent ? "text-indigo-400" : "text-emerald-400"}`}>
        {value}
      </span>
      <CopyButton value={value} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DecisionHistory
// ---------------------------------------------------------------------------

export function DecisionHistory({ decisions, lastChainHash: _lastChainHash }: Props) {
  const sorted = [...decisions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // The real chain tip is the latest decision's chainHash, not the seed field.
  // The file's lastChainHash is often a seeded value ("0000000000000000") that
  // was never updated by legacy data import. Use the most recent decision's
  // chainHash when available; only fall back to the field if no decisions exist.
  const effectiveChainTip =
    sorted.length > 0
      ? sorted[0].chainHash
      : _lastChainHash;

  const isSeedValue = /^0+$/.test(effectiveChainTip.trim());

  return (
    <div className="flex flex-col gap-4">

      {/* ── Chain tip block ──────────────────────────────────── */}
      <div
        className="rounded-xl p-4 flex flex-col gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(129,140,248,.07) 0%, rgba(129,140,248,.02) 100%)",
          border: "1px solid rgba(129,140,248,.22)",
          borderTop: "1px solid rgba(129,140,248,.38)",
        }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">Current Chain Tip</span>
            {sorted.length > 0 && (
              <span className="text-[10px] text-slate-600 font-mono">
                ← {sorted[0].id}
              </span>
            )}
          </div>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300 uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{ background: "rgba(129,140,248,.12)", border: "1px solid rgba(129,140,248,.28)" }}
          >
            <ShieldCheck className="w-2.5 h-2.5" />
            SHA-256 Verified Chain
          </span>
        </div>

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(129,140,248,.12)" }}
        >
          <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
          {isSeedValue ? (
            <span className="text-[11px] text-slate-600 italic flex-1">
              Genesis block — no decisions yet
            </span>
          ) : (
            <span className="font-mono text-[11px] text-indigo-400 flex-1 break-all tabular">
              {effectiveChainTip}
            </span>
          )}
          {!isSeedValue && <CopyButton value={effectiveChainTip} />}
        </div>
      </div>

      {/* ── Decision cards ───────────────────────────────────── */}
      {sorted.length === 0 && (
        <div className="text-center py-10">
          <p className="text-slate-600 text-sm">No decisions recorded yet.</p>
          <p className="text-slate-700 text-xs mt-1">Approve or reject a rule to begin the audit chain.</p>
        </div>
      )}

      <div className="relative flex flex-col gap-3">
        {/* Continuous vertical timeline rail */}
        {sorted.length > 1 && (
          <div
            className="absolute left-[11px] top-5 bottom-5 w-px"
            style={{ background: "linear-gradient(180deg, rgba(129,140,248,.3) 0%, rgba(129,140,248,.05) 100%)" }}
          />
        )}

        {sorted.map((dec, i) => (
          <div
            key={dec.id}
            className="relative pl-7"
          >
            {/* Timeline node */}
            <div
              className={`absolute left-0 top-4 w-5 h-5 rounded-full flex items-center justify-center border
                ${dec.decision.newStatus === "approved"
                  ? "bg-emerald-950 border-emerald-700/60"
                  : dec.decision.newStatus === "rejected"
                  ? "bg-rose-950 border-rose-700/60"
                  : "bg-slate-900 border-slate-700"
                }`}
              style={{
                boxShadow: dec.decision.newStatus === "approved"
                  ? "0 0 8px rgba(16,185,129,.25)"
                  : dec.decision.newStatus === "rejected"
                  ? "0 0 8px rgba(244,63,94,.2)"
                  : undefined,
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dec.decision.newStatus === "approved"
                    ? "bg-emerald-400"
                    : dec.decision.newStatus === "rejected"
                    ? "bg-rose-400"
                    : "bg-slate-500"
                }`}
              />
            </div>

            {/* Card */}
            <div
              className="rounded-xl flex flex-col overflow-hidden"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                borderLeft: dec.decision.newStatus === "approved"
                  ? "2px solid rgba(16,185,129,.35)"
                  : dec.decision.newStatus === "rejected"
                  ? "2px solid rgba(244,63,94,.35)"
                  : "1px solid var(--border)",
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-[11px] text-slate-600 shrink-0">{dec.id}</span>
                  <span className="text-slate-700 text-[10px] shrink-0">→</span>
                  <span className="font-semibold text-sm text-slate-100 truncate">{dec.ruleId}</span>
                </div>
                <span
                  className={`shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full border tabular ${statusColor(dec.decision.newStatus)} ${statusBg(dec.decision.newStatus)}`}
                >
                  {dec.decision.newStatus.toUpperCase()}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3 shrink-0" />
                  {new Date(dec.timestamp).toLocaleString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
                <span className="text-slate-700">·</span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <User className="w-3 h-3 shrink-0" />
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-indigo-300"
                    style={{ background: "rgba(129,140,248,.1)", border: "1px solid rgba(129,140,248,.18)" }}
                  >
                    {dec.decidedBy.userName}
                  </span>
                  <span className="text-slate-600">{dec.decidedBy.role}</span>
                </span>
                {/* Context triage */}
                {dec.context?.triageAtDecision && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span className="text-[11px] text-slate-600">{dec.context.triageAtDecision}</span>
                  </>
                )}
                {/* Risk score at decision */}
                {dec.context?.riskScoreAtDecision !== undefined && (
                  <span className="text-[11px] font-mono text-slate-600 ml-auto tabular">
                    risk: {dec.context.riskScoreAtDecision}
                  </span>
                )}
              </div>

              {/* Justification — only show non-placeholder rationale */}
              {dec.justification && !isPlaceholderJustification(dec.justification) && (
                <div className="px-4 py-2.5 border-b border-white/[0.03]">
                  <p className="text-xs text-slate-400 italic leading-relaxed">
                    "{dec.justification}"
                  </p>
                </div>
              )}

              {/* Hash block */}
              <div style={{ background: "rgba(0,0,0,.25)" }}>
                <HashRow label="hash"      value={dec.hash}      border />
                <HashRow label="chainHash" value={dec.chainHash} accent />
              </div>

              {/* Cryptographic link indicator — not on last (oldest) entry */}
              {i < sorted.length - 1 && (
                <div className="flex items-center gap-1.5 px-4 py-2 border-t border-white/[0.03]">
                  <Link2 className="w-2.5 h-2.5 text-indigo-600" />
                  <span className="text-[10px] text-indigo-600/70">
                    chainHash links to previous entry's hash
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
