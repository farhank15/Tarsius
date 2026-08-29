interface RiskCardProps {
  title: string;
  count: number;
  color: "red" | "amber" | "green";
  icon: string;
  highlighted?: boolean;
}

const colorMap = {
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "shadow-red-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  green: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
};

export default function RiskCard({
  title,
  count,
  color,
  icon,
  highlighted,
}: RiskCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] ${
        highlighted
          ? "bg-red-500/15 border-red-500/40 shadow-lg shadow-red-500/15 animate-pulse"
          : `${c.bg} ${c.border} ${c.glow} shadow-sm`
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium ${c.text}`}>{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${c.text}`}>{count}</p>
    </div>
  );
}
