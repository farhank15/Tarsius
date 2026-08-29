import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

interface Props { score: number; label: "high" | "medium" | "low" }

export default function ConfidenceBadge({ score, label }: Props) {
  const styles = {
    high:   { cls: "text-green-400 bg-green-500/10",  Icon: ShieldCheck },
    medium: { cls: "text-amber-400 bg-amber-500/10",  Icon: AlertTriangle },
    low:    { cls: "text-red-400   bg-red-500/10",    Icon: XCircle },
  }[label];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles.cls}`}>
      <styles.Icon className="w-3 h-3" />
      {Math.round(score * 100)}%
    </span>
  );
}
