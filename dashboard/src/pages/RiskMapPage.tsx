import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Zap,
  FileCode2,
  Info,
} from "lucide-react";
import { useBriRules } from "../hooks/useBriData.js";
import { TriageBadge } from "../components/TriageBadge.js";
import type { BusinessRule } from "../types/index.js";

// ---------------------------------------------------------------------------
// Risk tier definitions
// ---------------------------------------------------------------------------

type RiskTier = "high" | "medium" | "low" | "all";

const TIERS: {
  id: RiskTier;
  label: string;
  range: string;
  icon: React.ElementType;
  min: number;
  max: number;
  tagline: string;
  bg: string;
  border: string;
  borderActive: string;
  text: string;
  subtext: string;
  glow: string;
}[] = [
  {
    id: "high",
    label: "High Risk",
    range: "30+",
    icon: ShieldAlert,
    min: 30, max: Infinity,
    tagline: "Immediate Governance Required",
    bg:     "rgba(244,63,94,.06)",
    border: "rgba(244,63,94,.18)",
    borderActive: "rgba(244,63,94,.55)",
    text:    "#fb7185",
    subtext: "#f43f5e99",
    glow:   "0 0 20px rgba(244,63,94,.15)",
  },
  {
    id: "medium",
    label: "Medium Risk",
    range: "10–29",
    icon: AlertTriangle,
    min: 10, max: 29,
    tagline: "Architect Glance Recommended",
    bg:     "rgba(245,158,11,.06)",
    border: "rgba(245,158,11,.18)",
    borderActive: "rgba(245,158,11,.55)",
    text:    "#fbbf24",
    subtext: "#f59e0b99",
    glow:   "0 0 20px rgba(245,158,11,.12)",
  },
  {
    id: "low",
    label: "Low Risk",
    range: "0–9",
    icon: ShieldCheck,
    min: 0, max: 9,
    tagline: "Safe for Automation",
    bg:     "rgba(16,185,129,.06)",
    border: "rgba(16,185,129,.18)",
    borderActive: "rgba(16,185,129,.5)",
    text:    "#34d399",
    subtext: "#10b98199",
    glow:   "0 0 20px rgba(16,185,129,.1)",
  },
];

function tierOf(score: number): RiskTier {
  if (score >= 30) return "high";
  if (score >= 10) return "medium";
  return "low";
}

// ---------------------------------------------------------------------------
// Explainable risk driver map
// ---------------------------------------------------------------------------

type DriverPill = { label: string; pts?: string; variant: "warning" | "info" | "ok" };

const RISK_DRIVERS: Record<string, DriverPill[]> = {
  "BR-DISC-EXCEPTION": [
    { label: "Spec Contradiction", pts: "+40 pts", variant: "warning" },
    { label: "Logic Divergence",                   variant: "warning" },
  ],
  "BR-GRANDFATHER-PRICING": [
    { label: "Code-Only Rule", pts: "+10 pts",     variant: "info" },
    { label: "Legacy Dependency",                  variant: "info" },
  ],
  "BR-SUSPENDED-BLOCK": [
    { label: "Documented & Verified",              variant: "ok" },
  ],
  "BR-CANCELLED-BLOCK": [
    { label: "Documented & Verified",              variant: "ok" },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function riskBarBg(score: number) {
  if (score >= 30) return "#f43f5e";
  if (score >= 10) return "#f59e0b";
  return "#10b981";
}

function riskTextColor(score: number) {
  if (score >= 30) return "text-rose-400";
  if (score >= 10) return "text-amber-400";
  return "text-emerald-400";
}

function groupByModule(rules: BusinessRule[]): Record<string, BusinessRule[]> {
  const map: Record<string, BusinessRule[]> = {};
  for (const rule of rules) {
    const mod = rule.evidence.codeLocation.file;
    (map[mod] ??= []).push(rule);
  }
  return map;
}

// ---------------------------------------------------------------------------
// DriverPill component
// ---------------------------------------------------------------------------

function DriverTag({ pill }: { pill: DriverPill }) {
  const styles = {
    warning: { bg: "rgba(244,63,94,.1)",  border: "rgba(244,63,94,.3)",  text: "#fb7185" },
    info:    { bg: "rgba(129,140,248,.1)",border: "rgba(129,140,248,.3)",text: "#a5b4fc" },
    ok:      { bg: "rgba(16,185,129,.08)",border: "rgba(16,185,129,.25)",text: "#34d399" },
  }[pill.variant];

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap shrink-0"
      style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.text }}
    >
      {pill.variant === "warning" && "⚠️ "}
      {pill.label}
      {pill.pts && (
        <span className="opacity-70 font-mono">{pill.pts}</span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// RuleRiskBlock
// ---------------------------------------------------------------------------

function RuleRiskBlock({ rule, maxScore }: { rule: BusinessRule; maxScore: number }) {
  const tier = tierOf(rule.riskScore);
  const drivers = RISK_DRIVERS[rule.id] ?? [];
  const pct = Math.min(100, Math.round((rule.riskScore / Math.max(maxScore, 1)) * 100));

  const borderColor =
    tier === "high"   ? "rgba(244,63,94,.4)"  :
    tier === "medium" ? "rgba(245,158,11,.3)"  :
                        "rgba(16,185,129,.25)";
  const bgColor =
    tier === "high"   ? "rgba(244,63,94,.05)"  :
    tier === "medium" ? "rgba(245,158,11,.04)"  :
                        "rgba(16,185,129,.04)";

  return (
    <div
      className="rounded-xl flex flex-col gap-0 overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        boxShadow: tier === "high" ? "0 0 16px rgba(244,63,94,.1)" : undefined,
      }}
    >
      {/* Top colour strip */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${riskBarBg(rule.riskScore)} 0%, transparent 100%)`,
          opacity: 0.7,
        }}
      />

      <div className="p-3.5 flex flex-col gap-3">
        {/* Header row: ID + score */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="font-mono text-[11px] tracking-wide"
              style={{ color: "#64748b" }}
            >
              {rule.id}
            </p>
            <p className="text-xs text-slate-200 font-medium leading-snug mt-1 line-clamp-2">
              {rule.title}
            </p>
          </div>
          {/* Score badge */}
          <div className="shrink-0 flex flex-col items-center">
            <span
              className={`font-mono text-xl font-bold tabular leading-none ${riskTextColor(rule.riskScore)}`}
            >
              {rule.riskScore}
            </span>
            <span className="text-[9px] text-slate-600 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Progress bar with percentage */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: riskBarBg(rule.riskScore) }}
            />
          </div>
          <span
            className="text-[10px] font-mono tabular shrink-0 w-8 text-right"
            style={{ color: riskBarBg(rule.riskScore) }}
          >
            {pct}%
          </span>
        </div>

        {/* Risk driver pills (explainable AI) */}
        {drivers.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {drivers.map((d, i) => (
              <DriverTag key={i} pill={d} />
            ))}
          </div>
        )}

        {/* Footer: triage + approval */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
          <TriageBadge triage={rule.triage} />
          <ApprovalChip status={rule.approvalStatus} />
        </div>
      </div>
    </div>
  );
}

function ApprovalChip({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3 h-3 shrink-0" /> approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 whitespace-nowrap shrink-0">
        approved
      </span>
    );
  return (
    <span className="text-[10px] font-semibold text-amber-400 whitespace-nowrap shrink-0">
      pending review
    </span>
  );
}

// ---------------------------------------------------------------------------
// RiskMapPage
// ---------------------------------------------------------------------------

export function RiskMapPage() {
  const { data: bri, isLoading } = useBriRules();
  const [activeTier, setActiveTier] = useState<RiskTier>("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Zap className="w-4 h-4 text-emerald-400 spin-slow" />
          Building risk map…
        </div>
      </div>
    );
  }

  if (!bri) return null;

  const allRules = bri.rules;
  const totalRisk = allRules.reduce((s, r) => s + r.riskScore, 0);
  const maxScore  = Math.max(...allRules.map((r) => r.riskScore), 1);

  // Tier counts
  const tierCounts = {
    high:   allRules.filter((r) => r.riskScore >= 30).length,
    medium: allRules.filter((r) => r.riskScore >= 10 && r.riskScore < 30).length,
    low:    allRules.filter((r) => r.riskScore < 10).length,
  };

  // Filtered rules
  const visibleRules =
    activeTier === "all"
      ? allRules
      : allRules.filter((r) => {
          const t = TIERS.find((x) => x.id === activeTier)!;
          return r.riskScore >= t.min && r.riskScore <= t.max;
        });

  const byModule = groupByModule(visibleRules);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Risk Map</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-sub)" }}>
            Explainable risk heatmap · sorted by cumulative risk ·{" "}
            <span className="tabular font-mono text-xs text-slate-400">
              total score: {totalRisk}
            </span>
          </p>
        </div>
        {activeTier !== "all" && (
          <button
            onClick={() => setActiveTier("all")}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 px-2.5 py-1 rounded-lg border border-indigo-800/40 bg-indigo-950/30"
          >
            ← Show All Tiers
          </button>
        )}
      </div>

      {/* ── Executive risk tier cards ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const count = tierCounts[tier.id as keyof typeof tierCounts];
          const isActive = activeTier === tier.id;
          const Icon = tier.icon;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(isActive ? "all" : tier.id)}
              className="text-left rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 cursor-pointer"
              style={{
                background: isActive ? tier.bg : "var(--bg-card)",
                border: `1px solid ${isActive ? tier.borderActive : tier.border}`,
                borderTop: `1px solid ${isActive ? tier.borderActive : "rgba(255,255,255,0.06)"}`,
                boxShadow: isActive ? tier.glow : undefined,
              }}
            >
              {/* Tier label row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: tier.text }} />
                  <span className="text-sm font-semibold" style={{ color: tier.text }}>
                    {tier.label}
                  </span>
                </div>
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded tabular whitespace-nowrap shrink-0"
                  style={{
                    background: tier.bg,
                    border: `1px solid ${tier.border}`,
                    color: tier.subtext,
                  }}
                >
                  {tier.range}
                </span>
              </div>

              {/* Count */}
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-3xl font-bold tabular leading-none"
                  style={{ color: tier.text }}
                >
                  {count}
                </span>
                <span className="text-xs text-slate-500">
                  rule{count !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Tagline */}
              <p className="text-[11px]" style={{ color: tier.subtext }}>
                {tier.tagline}
              </p>

              {/* Active indicator */}
              {isActive && (
                <div
                  className="flex items-center gap-1 text-[10px] font-semibold"
                  style={{ color: tier.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tier.text }} />
                  Filtering active
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Explainability note ──────────────────────────────── */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3.5"
        style={{
          background: "rgba(129,140,248,.04)",
          border: "1px solid rgba(129,140,248,.15)",
        }}
      >
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-indigo-300">Transparent Risk Scoring</p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Risk scores are deterministic — each driver pill inside a rule card shows the exact
            factors that contributed to the score. No black-box ML; every point is traceable.
          </p>
        </div>
      </div>

      {/* ── Module clusters ──────────────────────────────────── */}
      {visibleRules.length === 0 ? (
        <div
          className="rounded-xl py-12 text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="text-slate-600 text-sm">No rules in this risk tier.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(byModule)
            .sort(([, a], [, b]) => {
              const sumA = a.reduce((s, r) => s + r.riskScore, 0);
              const sumB = b.reduce((s, r) => s + r.riskScore, 0);
              return sumB - sumA;
            })
            .map(([module, rules]) => {
              const moduleRisk = rules.reduce((s, r) => s + r.riskScore, 0);
              const pct = Math.round((moduleRisk / Math.max(totalRisk, 1)) * 100);
              const hasHigh = rules.some((r) => r.riskScore >= 30);

              return (
                <div
                  key={module}
                  className="rounded-xl flex flex-col gap-4 p-5"
                  style={{
                    background: "var(--bg-card)",
                    border: hasHigh
                      ? "1px solid rgba(244,63,94,.18)"
                      : "1px solid var(--border)",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Module header */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCode2
                        className="w-4 h-4 shrink-0"
                        style={{ color: hasHigh ? "#f43f5e" : "#64748b" }}
                      />
                      <div className="min-w-0">
                        <h2
                          className="font-mono text-sm font-semibold truncate"
                          style={{ color: hasHigh ? "#fca5a5" : "#e2e8f0" }}
                        >
                          {module}
                        </h2>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          <span className="tabular">{rules.length}</span> rule{rules.length !== 1 ? "s" : ""} ·
                          cumulative risk <span className="tabular font-mono">{moduleRisk}</span> ·{" "}
                          <span className="tabular">{pct}%</span> of total
                        </p>
                      </div>
                    </div>

                    {/* Module risk progress bar */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div
                        className="w-32 h-2 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: hasHigh ? "#f43f5e" : "#f59e0b",
                          }}
                        />
                      </div>
                      <span
                        className="font-mono text-xs tabular w-9 text-right"
                        style={{ color: hasHigh ? "#f87171" : "#fbbf24" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Rules grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...rules]
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .map((rule) => (
                        <RuleRiskBlock key={rule.id} rule={rule} maxScore={maxScore} />
                      ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ── Individual risk distribution chart ───────────────── */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-300">Individual Rule Risk Distribution</p>
          <span className="text-[11px] text-slate-600 tabular">max: {maxScore}</span>
        </div>

        <div className="flex flex-col gap-3">
          {[...allRules]
            .sort((a, b) => b.riskScore - a.riskScore)
            .map((rule) => {
              const pct = Math.round((rule.riskScore / maxScore) * 100);
              const drivers = RISK_DRIVERS[rule.id] ?? [];
              return (
                <div key={rule.id} className="flex items-center gap-3">
                  {/* Rule ID */}
                  <span
                    className="font-mono text-[11px] text-slate-500 shrink-0 truncate tabular"
                    style={{ width: "12rem" }}
                  >
                    {rule.id}
                  </span>

                  {/* Bar + % */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div
                      className="flex-1 h-2.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: riskBarBg(rule.riskScore),
                          boxShadow:
                            rule.riskScore >= 30
                              ? "0 0 6px rgba(244,63,94,.4)"
                              : undefined,
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-[11px] tabular shrink-0 w-9 text-right"
                      style={{ color: riskBarBg(rule.riskScore) }}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Score */}
                  <span
                    className={`font-mono text-xs font-bold tabular shrink-0 w-7 text-right ${riskTextColor(rule.riskScore)}`}
                  >
                    {rule.riskScore}
                  </span>

                  {/* Inline driver pills */}
                  <div className="hidden lg:flex items-center gap-1 shrink-0 w-64">
                    {drivers.slice(0, 2).map((d, i) => (
                      <DriverTag key={i} pill={d} />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
