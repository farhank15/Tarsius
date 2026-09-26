import type { TriageLevel } from "../types/index.js";

interface Props {
  triage: TriageLevel;
  pulse?: boolean;
}

const CONFIG: Record<
  TriageLevel,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  "🟢 auto-approve": {
    label: "auto-approve",
    bg: "bg-emerald-950/60",
    text: "text-emerald-400",
    border: "border-emerald-800",
    dot: "bg-emerald-400",
  },
  "🟡 glance": {
    label: "glance",
    bg: "bg-amber-950/60",
    text: "text-amber-400",
    border: "border-amber-800",
    dot: "bg-amber-400",
  },
  "🔴 must-review": {
    label: "must-review",
    bg: "bg-rose-950/60",
    text: "text-rose-400",
    border: "border-rose-800",
    dot: "bg-rose-400",
  },
};

export function TriageBadge({ triage, pulse = false }: Props) {
  const c = CONFIG[triage];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0 ${c.bg} ${c.text} ${c.border}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot} ${
          pulse && triage === "🔴 must-review" ? "pulse-rose" : ""
        }`}
      />
      {c.label}
    </span>
  );
}
