# Tarsius — Hackathon Submission & Architecture Summary
*IBM Bob 2.0 Hackathon (lablab.ai — September 25–27, 2026)*

### **Behavioral Safety Layer for AI Legacy Modernization**

> **Bob changes the code. Tarsius protects the business behavior.**
> Tarsius prevents AI from deleting business rules that only humans know — a developer-workflow improvement for AI-assisted legacy modernization: **Detect → Ask SME → Bind → Modernize → Verify.**

---

## 1. Problem Statement

Mission-critical enterprise applications on IBM i (RPG) and mainframes (COBOL) are maintained by a workforce on the edge of retirement:
* **72% of RPG developers are over the age of 50** (*Fortra 2026 IBM i Marketplace Survey*).
* **Skills shortage has displaced cybersecurity** as the #1 concern of enterprise IT leaders for the first time in 9 years (69%, Fortra 2026).
* Gartner (press release, June 18 2026) predicts **more than 70% of mainframe exit projects initiated in 2026 will fail** due to overestimating generative AI.

When senior developers retire, they take with them **tacit knowledge**: undocumented legal carve-outs, oral agreements, and branch exceptions that were never recorded in code comments, technical documentation, or any IBM Redbook.

### The Dangerous Blind Spot for AI-Assisted Modernization
Modern AI platforms like **IBM Bob 2.0** excel at reading what is written — full-repository context, document understanding, code generation. However, **AI cannot extract or retrieve knowledge that was never written down**.
* Unconstrained AI falls into the **Self-Fulfilling Test Fallacy**: it translates legacy code on partial understanding, generates its own unit tests, marks them green, and ships subtle logic regressions to production.
* Research (*AgentModernize*, arXiv:2605.17535, May 2026) shows LLM-driven legacy modernization retains only a **0–19% Behavioral Equivalence Rate (BER)** on edge cases.
* Real-world cost of a migration that lost behavioral fidelity: **TSB Bank — £48.65M FCA fine**.

---

## 2. Solution Statement: Tarsius

**Tarsius is a tacit-knowledge capture and behavioral-equivalence governance layer engineered into IBM Bob 2.0's native architecture (custom modes, subagents, MCP, lifecycle hooks).**

The workflow it improves — legacy modernization — end to end:

1. **Socratic Anomaly Discovery:** Tarsius scans legacy code for branch contradictions and unhandled conditions, then asks the human SME one targeted question before any code is generated: *"Lines 77–81 allow suspended accounts to submit DISC orders — the spec says 'no exceptions.' What is the business intent?"*
2. **Deterministic Triage (🟢🟡🔴):** A 4-condition, zero-LLM classifier categorizes rules. Standard logic is auto-approved; contradictions and legal carve-outs are flagged for human review — developers spend time only where it matters.
3. **Binding Rule Contracts (`RISK-CONTEXT.md`):** Human-approved rules compile into a contract re-injected into Bob's working context, binding parallel subagents across sessions and context compactions (*PreCompact/PostCompact hooks, Bob Shell 2.0.3*).
4. **Behavioral Equivalence Test Harness (BETH):** A differential oracle executes the **SME-approved rules** — not a re-translation of the code, which would be self-fulfilling — across 12 deterministic test vectors. Measured result: **naive modernization 67% (8/12) → governed 100% (12/12) on the ORDVAL demo vectors**.
5. **Cryptographic Provenance Ledger + Rule Passport:** Every rule, SME decision, and verification lands in a **SHA-256 hash chain** (EU AI Act Art. 12-style audit readiness) — and ships as a **Rule Passport**: SME identity, legal basis, hash chain, verified badge. Enforcement is not advisory: **EnforcedHooks (Bob Shell 2.0.2)** makes the approval flow an org-wide policy that cannot be bypassed.

---

## 3. How IBM Bob 2.0 Was Deeply Utilized

Tarsius is not an external wrapper; it extends Bob 2.0's native capabilities:

* **Agent Mode & Plan Mode Integration:** Tarsius injects a *pre-generation tacit-discovery step* before task fan-out.
* **Subagents Engine:** Bob spawns parallel subagents in isolated contexts to analyze modules without saturating the 270k token context window. Tarsius binds them via `RISK-CONTEXT.md`.
* **Model Context Protocol (MCP):** A TypeScript MCP server exposes **6 tools** (`write_finding`, `get_pending_approvals`, `mark_approved`, `record_decision`, `check_gotchas`, **`verify_equivalence`**), configured with `alwaysAllow` within Bob's 300 KB payload limit.
* **Compaction Lifecycle Hooks (Bob Shell 2.0.3):** `PreCompact`/`PostCompact` keep approved business rules persistent across memory compactions and multi-session lifecycles.
* **EnforcedHooks (Bob Shell 2.0.2):** org-wide policy hooks — governance that individual developers cannot disable.
* **Document Understanding:** Ingests `.rpgle` sources and markdown specifications, enabling Bob to cross-reference code structure against human tacit input.

**Disclosure:** *"Demo scenario (sample data only) prepared in advance; all product code built during the event with IBM Bob (see session report)."*

---

## 4. Measured Impact

| Dimension | Without Tarsius | With Tarsius | Evidence |
|---|---|---|---|
| **Behavioral Equivalence (ORDVAL demo)** | Naive modernization: **67% (8/12 vectors)** | Governed: **100% (12/12)** | `verify_equivalence` — runnable live; **38/38 automated tests** |
| **Implicit rules captured** | 0 — invisible to code-only tools | **2** (+1 contradiction unsynced for 11 years) | Business Rule Inventory |
| **Cross-session rule durability** | Lost at context compaction | Persisted + re-injected | PreCompact/PostCompact demo |
| **Review scope** | Full manual reverse-engineering | Deterministic triage → flagged rules only | 4-condition classifier, zero LLM |
| **Audit readiness** | Ephemeral chat logs | SHA-256 hash chain + Rule Passport | Decision ledger |
| **Known limitations** | — | Dependency-graph demo uses stub modules; BER claim scoped to the 12 demo vectors | Stated proactively |

---

## 5. Alignment with Judging Pillars

| Judging Pillar (Weight) | Tarsius Execution & Proof |
|---|---|
| **Application of Technology (25%)** | Native integration across Bob 2.0: custom modes, subagents, 6-tool MCP server, PreCompact/PostCompact hooks, EnforcedHooks policy, exportable session reports. |
| **Business Value (25%)** | Targets the failure mode Gartner quantifies (>70% of exits fail) at the cost TSB paid (£48.65M). Review effort concentrated on flagged rules only. |
| **Originality (25%)** | First entrant to attack the *tacit knowledge gap* pre-generation — with a differential equivalence oracle, not static checks. |
| **Presentation (25%)** | 3-minute video, two measured aha-moments (contradiction surfaced; BETH 67%→100%), interactive dashboard, Rule Passport artifact, every claim live-provable. |

---

## 6. Verification Artifacts & Deliverables

* **Bob Utilization Report:** [`BOB-UTILIZATION.md`](BOB-UTILIZATION.md)
* **Automated Test Suite:** [`test/flow-test.ts`](../test/flow-test.ts) *(38/38 tests passing — includes BETH differential oracle)*
* **Sample Data Scenario:** [`sample-data/ORDVAL.rpgle`](../sample-data/ORDVAL.rpgle) & [`sample-data/tarsius-bri.json`](../sample-data/tarsius-bri.json)
* **Demo & Pitch Script (kanon angka):** [`docs/demo/DEMO-MASTER.md`](../docs/demo/DEMO-MASTER.md)
* **Exported IBM Bob Session Logs:** [`submission/bob-task-*.md`](.) — plus session reports exported live during the event
