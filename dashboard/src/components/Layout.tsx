import { type ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  BookOpen,
  Code2,
  TrendingUp,
  Settings,
  Wifi,
  RefreshCw,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface LayoutProps { children: ReactNode }

const NAV_ITEMS = [
  { to: "/",              icon: LayoutDashboard, label: "Dashboard"      },
  { to: "/rules",         icon: BookOpen,        label: "Business Rules" },
  { to: "/code-explorer", icon: Code2,           label: "Code Explorer"  },
  { to: "/risk-map",      icon: TrendingUp,      label: "Risk Map"       },
  { to: "/settings",      icon: Settings,        label: "Settings"       },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/":              "Overview",
  "/rules":         "Business Rules",
  "/code-explorer": "Code Explorer",
  "/risk-map":      "Risk Map",
  "/settings":      "Settings",
};

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] ?? "Tarsius";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">

      {/* ── Mobile overlay ───────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-60 flex flex-col shrink-0
        bg-slate-950 border-r border-slate-800/80
        transition-transform duration-250 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white tracking-tight leading-none mb-0.5">Tarsius</p>
              <p className="text-[11px] text-slate-500 leading-none">Knowledge Capture</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-4 pt-5 pb-1.5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Navigation</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 pb-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-teal-500/12 text-teal-300 font-medium"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Version + status */}
        <div className="px-4 py-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-slate-400">MCP Connected</span>
            <Wifi className="w-3 h-3 text-emerald-400 ml-auto" />
          </div>
          <p className="text-[10px] text-slate-700 font-mono">v0.1.0 · tarsius-mcp-server</p>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-slate-950/80 backdrop-blur-sm gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 text-xs hidden sm:inline">Tarsius</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700 hidden sm:inline" />
              <span className="font-medium text-slate-200 truncate">{pageTitle}</span>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white shrink-0">
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
