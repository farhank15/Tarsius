import { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-64 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="font-bold text-sm tracking-tight">Tarsius</h1>
              <p className="text-xs text-slate-500">Rule Guardian</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavItem icon="📊" label="Dashboard" active />
          <NavItem icon="📋" label="Business Rules" />
          <NavItem icon="🔍" label="Code Explorer" />
          <NavItem icon="📈" label="Risk Map" />
          <NavItem icon="⚙️" label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            MCP Connected
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-sm font-medium text-slate-400">
            Business Rule Inventory
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Last scan: —</span>
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-slate-300">
              Refresh
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-tarsius-900/40 text-tarsius-300 font-medium"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </a>
  );
}
