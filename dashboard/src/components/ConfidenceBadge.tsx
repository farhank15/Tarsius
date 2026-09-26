import type { ConfidenceLabel } from "../types/index.js";

interface Props {
  label: ConfidenceLabel;
  score?: number;
}

const CONFIG: Record<
  ConfidenceLabel,
  { bg: string; text: string; border: string }
> = {
  high:   { bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-800" },
  medium: { bg: "bg-amber-950/60",   text: "text-amber-400",   border: "border-amber-800"   },
  low:    { bg: "bg-slate-800/60",   text: "text-slate-400",   border: "border-slate-700"   },
};

export function ConfidenceBadge({ label, score }: Props) {
  const c = CONFIG[label];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0 ${c.bg} ${c.text} ${c.border}`}
    >
      {label}
      {score !== undefined && (
        <span className="opacity-60 text-[10px] whitespace-nowrap">({Math.round(score * 100)}%)</span>
      )}
    </span>
  );
}
