import { CheckCircle2, XCircle, ClipboardList, User, Hash, Clock } from "lucide-react";
import type { DecisionRecord } from "../types";

interface Props { decisions: DecisionRecord[] }

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function DecisionHistory({ decisions }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="w-6 h-6 rounded-md bg-slate-700/60 flex items-center justify-center shrink-0">
          <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-white flex-1">Decision History</h3>
        {decisions.length > 0 && (
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded-full">
            {decisions.length}
          </span>
        )}
      </div>

      {decisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-700 gap-2">
          <ClipboardList className="w-6 h-6 opacity-40" />
          <p className="text-xs">No decisions recorded yet</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline spine */}
          <div className="absolute left-[1.85rem] top-4 bottom-4 w-px bg-slate-800 pointer-events-none" />

          <div className="divide-y divide-slate-800/50">
            {decisions.map((d) => {
              const isApproved = d.decision.newStatus === "approved";
              return (
                <div key={d.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-800/20 transition-colors group">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    isApproved
                      ? "bg-emerald-500/15 border-emerald-500/40"
                      : "bg-red-500/15 border-red-500/40"
                  }`}>
                    {isApproved
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      : <XCircle      className="w-3 h-3 text-red-400" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-slate-200">{d.ruleId}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {d.decision.newStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {d.decidedBy.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono">{d.hash}</span>
                      </span>
                      <span className="flex items-center gap-1 ml-auto text-slate-700">
                        <Clock className="w-3 h-3" />
                        {timeAgo(d.timestamp)}
                      </span>
                    </div>
                    {d.justification && (
                      <p className="text-[11px] text-slate-600 mt-1 italic truncate">{d.justification}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
