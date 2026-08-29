import { Settings, Server, Database, FileJson, RefreshCw, Terminal, CheckCircle2, Info, Copy, Check } from "lucide-react";
import { useState } from "react";

const CONFIG_ROWS = [
  { label: "BRI File",        value: "sample-data/tarsius-bri.json",       icon: FileJson  },
  { label: "Decisions File",  value: "sample-data/tarsius-decisions.json",  icon: FileJson  },
  { label: "Gotchas File",    value: "sample-data/tarsius-gotchas.json",    icon: FileJson  },
  { label: "MCP Server",      value: "mcp-server/dist/index.js (stdio)",    icon: Server    },
  { label: "Poll Interval",   value: "Rules: 3 s  ·  Decisions: 5 s",      icon: RefreshCw },
  { label: "Persistence",     value: "JSON flat-file (no DB required)",     icon: Database  },
];

const MCP_TOOLS = [
  { tool: "write_finding",         desc: "Record extracted business rule into BRI"        },
  { tool: "get_pending_approvals", desc: "Fetch rules pending human review"               },
  { tool: "mark_approved",         desc: "Approve / reject a rule + write audit trail"   },
  { tool: "record_decision",       desc: "Hash-chained immutable decision record"         },
  { tool: "check_gotchas",         desc: "Query institutional knowledge warnings"         },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="p-1 rounded text-slate-700 hover:text-slate-400 hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-5 max-w-2xl">

      {/* Page heading */}
      <div>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Runtime configuration and registered MCP tools.</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
        <Info className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
        This page is read-only. To change configuration, edit the project files directly.
      </div>

      {/* Runtime config */}
      <div className="card">
        <div className="card-header">
          <div className="w-6 h-6 rounded-md bg-slate-700/50 flex items-center justify-center shrink-0">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-white flex-1">Runtime Configuration</h3>
          <span className="text-[10px] text-slate-600 bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded-full font-mono">{CONFIG_ROWS.length} entries</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {CONFIG_ROWS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="group flex items-center gap-4 px-5 py-3 hover:bg-slate-800/20 transition-colors">
              <Icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="text-xs text-slate-500 w-32 shrink-0">{label}</span>
              <span className="font-mono text-xs text-slate-300 truncate flex-1">{value}</span>
              <CopyButton value={value} />
            </div>
          ))}
        </div>
      </div>

      {/* MCP Tools */}
      <div className="card">
        <div className="card-header">
          <div className="w-6 h-6 rounded-md bg-teal-500/10 border border-teal-500/15 flex items-center justify-center shrink-0">
            <Terminal className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <h3 className="text-sm font-semibold text-white flex-1">MCP Tools</h3>
          <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-semibold">alwaysAllow</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {MCP_TOOLS.map(({ tool, desc }) => (
            <div key={tool} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-800/20 transition-colors">
              <div className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-teal-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-semibold text-teal-300 mb-0.5">{tool}<span className="text-teal-600">()</span></p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
