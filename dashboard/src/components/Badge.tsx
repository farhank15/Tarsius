import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "danger" | "warning" | "success" | "outline";
  size?: "sm" | "md";
}

const variantStyles: Record<string, string> = {
  default: "bg-slate-700 text-slate-300",
  danger: "bg-red-500/15 text-red-400 border border-red-500/30",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  outline: "bg-transparent text-slate-400 border border-slate-700",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full whitespace-nowrap ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
