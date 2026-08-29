import { useBriRules } from "../hooks/useBriData";
import { Code2, FileCode, MapPin, AlertTriangle, CheckCircle2, Clock, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CodeExplorerPage() {
  const { data, isLoading, error } = useBriRules();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="flex items-center gap-3 text-red-400 p-5 text-sm bg-red-500/5 border border-red-500/20 rounded-xl">
      <AlertTriangle className="w-4 h-4 shrink-0" /> Error loading data
    </div>
  );

  const rules = data?.rules ?? [];

  const byFile = rules.reduce<Record<string, typeof rules>>((acc, rule) => {
    const file = rule.evidence.codeLocation.file;
    if (!acc[file]) acc[file] = [];
    acc[file].push(rule);
    return acc;
  }, {});

  const toggle = (file: string) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(file) ? next.delete(file) : next.add(file);
      return next;
    });

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
    if (status === "rejected") return <XCircle      className="w-3 h-3 text-red-400" />;
    return <Clock className="w-3 h-3 text-slate-500" />;
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* Page heading */}
      <div>
        <h1 className="text-lg font-semibold text-white">Code Explorer</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Source files referenced by extracted rules, grouped by file with line-level provenance.
        </p>
      </div>

      {Object.entries(byFile).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-600 gap-2 border border-slate-800/60 rounded-xl bg-slate-900/30">
          <Code2 className="w-8 h-8 opacity-20" />
          <p className="text-sm font-medium text-slate-500">No source files indexed yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(byFile).map(([file, fileRules]) => {
            const isCollapsed = collapsed.has(file);
            const ruleCount   = fileRules.length;
            const contradictions = fileRules.filter(r => r.evidence.contradiction).length;

            return (
              <div key={file} className="card animate-fade-in">
                {/* File header — clickable */}
                <button
                  onClick={() => toggle(file)}
                  className="w-full card-header hover:bg-slate-800/30 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-md bg-teal-500/10 border border-teal-500/15 flex items-center justify-center shrink-0">
                    <FileCode className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <span className="font-mono text-sm text-slate-200 flex-1 truncate">{file}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {contradictions > 0 && (
                      <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                        {contradictions} conflict{contradictions !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-700/60 px-2 py-0.5 rounded-full">
                      {ruleCount} rule{ruleCount !== 1 ? "s" : ""}
                    </span>
                    {isCollapsed
                      ? <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      : <ChevronDown  className="w-3.5 h-3.5 text-slate-600" />
                    }
                  </div>
                </button>

                {/* Rule rows */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-800/50">
                    {fileRules.map((rule, i) => (
                      <div
                        key={rule.id}
                        className="group flex items-start gap-4 px-5 py-3.5 hover:bg-slate-800/20 transition-colors animate-fade-in"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        {/* Line badge */}
                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          <div className="font-mono text-[11px] text-slate-700 bg-slate-800/80 border border-slate-700/50 rounded px-1.5 py-0.5 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            L{rule.evidence.codeLocation.startLine}–{rule.evidence.codeLocation.endLine}
                          </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-teal-400">{rule.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                              rule.type === "explicit"
                                ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            }`}>
                              {rule.type}
                            </span>
                            {rule.evidence.contradiction && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                                <AlertTriangle className="w-2.5 h-2.5" /> conflict
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{rule.title}</p>
                        </div>

                        {/* Status */}
                        <div className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg font-medium shrink-0 ${
                          rule.approvalStatus === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : rule.approvalStatus === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-slate-700/60 text-slate-400 border border-slate-700"
                        }`}>
                          {statusIcon(rule.approvalStatus)}
                          {rule.approvalStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
