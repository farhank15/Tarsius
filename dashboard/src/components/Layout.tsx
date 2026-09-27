import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ShieldAlert,
  Map,
  GitBranch,
  Activity,
  Cpu,
  Zap,
  Layers,
} from "lucide-react";

interface Props {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: "/",        label: "Overview",       icon: LayoutDashboard, end: true  },
  { to: "/rules",   label: "Business Rules", icon: BookOpen,        end: false },
  { to: "/risk-map",label: "Risk Map",       icon: Map,             end: false },
  { to: "/audit",   label: "Audit Ledger",   icon: ShieldAlert,     end: false },
];

export function Layout({ children }: Props) {
  return (
    <div className="flex h-full min-h-screen">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">

        {/* Brand block */}
        <div className="px-4 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5 mb-3">
            {/* Gradient logo badge */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,.35) 0%, rgba(129,140,248,.35) 100%)",
                border: "1px solid rgba(16,185,129,.4)",
                boxShadow: "0 0 12px rgba(16,185,129,.15)",
              }}
            >
              <GitBranch className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100 tracking-tight leading-none">
                Tarsius
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                Enterprise Legacy Governance
              </p>
            </div>
          </div>

          {/* Live status pill */}
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
            style={{
              background: "rgba(16,185,129,.06)",
              border: "1px solid rgba(16,185,129,.18)",
            }}
          >
            {/* Breathing green dot */}
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 breathe-green"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold text-emerald-300 leading-tight truncate">
                IBM Bob 2.0 Synced
              </span>
              <span className="text-[10px] text-emerald-500/70 leading-tight">
                BETH Oracle: 100%
              </span>
            </div>
          </div>
          {/* Workspace Status Card */}
          <div className="mt-3 px-2.5 py-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] font-semibold text-slate-300 leading-tight truncate">
                  Active Workspace
                </p>
                <p className="text-[9px] text-slate-500 font-mono leading-tight mt-0.5 truncate">
                  .tarsius/bri.json
                </p>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
              v3.0
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-950/50 text-emerald-200 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active left indicator */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-emerald-400"
                      style={{ boxShadow: "0 0 8px rgba(16,185,129,.6)" }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer status bar */}
        <div className="px-4 py-3.5 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <Activity className="w-3 h-3" />
              Live polling
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <Cpu className="w-3 h-3" />
              BRI v3.0
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600">
              <Zap className="w-3 h-3" />
              Active
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content area ────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
