import Badge from "./Badge";

interface Rule {
  id: string;
  module: string;
  description: string;
  triage: "must-review" | "glance" | "auto-approve";
  confidence: "high" | "medium" | "low";
  contradiction: boolean;
}

interface RuleTableProps {
  rules: Rule[];
}

const triageConfig = {
  "must-review": {
    label: "Must Review",
    variant: "danger" as const,
  },
  glance: {
    label: "Glance",
    variant: "warning" as const,
  },
  "auto-approve": {
    label: "Auto-Approve",
    variant: "success" as const,
  },
};

export default function RuleTable({ rules }: RuleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
            <th className="text-left px-5 py-3 font-medium">Rule ID</th>
            <th className="text-left px-5 py-3 font-medium">Module</th>
            <th className="text-left px-5 py-3 font-medium">Description</th>
            <th className="text-left px-5 py-3 font-medium">Triage</th>
            <th className="text-left px-5 py-3 font-medium">Confidence</th>
            <th className="text-center px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => {
            const triage = triageConfig[rule.triage];
            return (
              <tr
                key={rule.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-5 py-3.5 font-mono text-xs text-tarsius-300">
                  {rule.id}
                </td>
                <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">
                  {rule.module}
                </td>
                <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate">
                  {rule.description}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={triage.variant}>{triage.label}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <span className="capitalize text-slate-400">
                    {rule.confidence}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  {rule.contradiction ? (
                    <span title="Contradiction detected" className="text-xl">
                      ⚠️
                    </span>
                  ) : (
                    <span title="No issues" className="text-xl">
                      ✅
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
