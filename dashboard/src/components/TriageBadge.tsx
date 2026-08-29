import { ShieldAlert, Eye, CheckCircle } from "lucide-react";

interface Props {
  triage: string;
  /** When true, renders as a compact icon-only badge (for dense layouts). */
  compact?: boolean;
}

const CONFIG = {
  "must-review": {
    icon: ShieldAlert,
    label: "Must Review",
    cls: "bg-red-500/12 text-red-400 border-red-500/25",
    iconCls: "text-red-400",
  },
  "glance": {
    icon: Eye,
    label: "Glance",
    cls: "bg-amber-500/12 text-amber-400 border-amber-500/25",
    iconCls: "text-amber-400",
  },
  "auto-approve": {
    icon: CheckCircle,
    label: "Auto-Approve",
    cls: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
    iconCls: "text-emerald-400",
  },
} as const;

export default function TriageBadge({ triage, compact = false }: Props) {
  const key = triage.includes("must-review") ? "must-review"
    : triage.includes("glance")       ? "glance"
    : "auto-approve";

  const { icon: Icon, label, cls, iconCls } = CONFIG[key];

  if (compact) {
    return <Icon className={`w-4 h-4 shrink-0 ${iconCls}`} />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </span>
  );
}
