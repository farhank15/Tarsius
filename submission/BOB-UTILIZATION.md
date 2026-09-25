# How IBM Bob 2.0 Was Utilized in Tarsius

> **Submission deliverable for IBM TechXchange 2026 Hackathon**
> This document explains how IBM Bob 2.0 was used both as a development tool AND as an active component of the Tarsius solution.

---

## Summary

Tarsius uses IBM Bob 2.0 in **two distinct ways**:

1. **Bob as Development Tool** — Tarsius was built entirely using Bob 2.0 as the IDE and AI coding assistant. All code, documentation, and configuration were generated with Bob's assistance.

2. **Bob as Execution Engine** — At runtime, Bob 2.0 is the core execution engine that powers Tarsius. Bob reads legacy code, surfaces tacit knowledge via structured interview sessions, and generates modernized code constrained by approved rules.

### Why Bob's Built-in Tools Cannot Reach This

| What Bob Does | The Gap | What Tarsius Adds |
|---|---|---|
| **Business Rules Extraction** reads logic already encoded in source | Cannot extract rules that were never written in code | **Structured interview** surfaces undocumented exceptions |
| **RAG** retrieves answers from documentation and Redbooks | Cannot retrieve knowledge that was never documented | **Tacit knowledge capture** turns person-memory into structured artifact |
| **Context window** starts fresh each session | Rules approved in Session 1 forgotten by Session 5 | **Persistence layer** re-injects rules regardless of session boundaries |
| **Code generation** is unconstrained by prior approvals | AI can silently violate a rule no one stated | **Binding contract** (RISK-CONTEXT.md) constrains what AI can generate |
| **Review workflow** is post-generation | Deviations caught after code is written | **Pre-generation knowledge capture** catches deviations before code exists |

### Measurable Impact

| Metric | Without Tarsius | With Tarsius | Improvement |
|---|---|---|---|
| Knowledge on departure | Total — knowledge is gone | Captured once, reusable indefinitely | **Institutional memory preserved** |
| Rule consistency across sessions | Not guaranteed — rules forgotten | Enforced — rules re-injected | **Context window persistence** |
| Review focus | Developer reviews 200 lines of code | Developer approves flagged rules only | **Focused, not scanning** |
| Contradiction detection | Manual — often missed | Automated — 🔴 must-review | **Eliminates blind spots** |

---

## Bob Features Used (Bob Native)

### 1. Custom Modes (2 modes configured)

| Mode | Purpose | Bob Features Used |
|---|---|---|
| **Legacy Analyzer** | Structured interview session — surfaces tacit knowledge from senior engineers via guided review of RPG/COBOL code + documentation | Agent Mode, Document Understanding, Subagents, MCP Tools, Parallel Tool Calling |
| **Modernization Transformer** | Generate modern code ONLY from approved business rules in RISK-CONTEXT.md | Agent Mode, RISK-CONTEXT.md reading, Restricted file editing (fileRegex) |

**Configuration:** `.bob/custom_modes.yaml` — Bob native YAML format

### 2. Subagents

The Legacy Analyzer mode uses Bob's **native subagent** capability for parallel extraction:
- Each function in the RPG codebase gets its own subagent
- Subagents work with clean context windows (isolated analysis)
- Results are summarized back to the main agent
- This follows the pipeline pattern from the AgentModernize paper

### 3. Document Understanding

Bob's native document understanding reads and understands:
- **RPG source code** (`.rpgle` files) — extracts business logic, control flow, exceptions
- **Technical specifications** (`.md` files) — extracts documented business rules
- **Cross-references** code vs documentation to detect contradictions

This is critical because Document Understanding establishes the "what Bob already knows" baseline — so the interview workflow only asks about genuinely *undocumented* gaps.

### 4. Parallel Tool Calling

Bob 2.0's parallel tool calling enables:
- Multiple `write_finding()` calls in parallel during extraction
- Subagent coordination without sequential bottlenecks

### 5. Skills + Rules + Personas

Bob native configuration files:
- **Skills:** Reusable workflows for extraction and generation
- **Rules:** Standing instructions for each custom mode
- **Personas:** Subagent role definitions for parallel extraction

---

## Tarsius Innovations (Custom Code, Not in Bob)

### 1. 5 Custom MCP Tools

Tarsius implements a custom MCP server with 5 tools that Bob calls during execution:

| MCP Tool | What It Does | Why Bob Can't Do This Natively |
|---|---|---|
| `write_finding()` | Records structured business rule with triage classification | Bob outputs free-form text; Tarsius converts to typed BRI JSON |
| `get_pending_approvals()` | Lists rules awaiting human review with filters | Bob has no approval queue concept |
| `mark_approved()` | Approves/rejects a rule + generates RISK-CONTEXT.md | Bob has no contract generation concept |
| `record_decision()` | Immutable hash-based audit trail of every decision | Bob has no decision tracking |
| `check_gotchas()` | Cross-references rules against institutional knowledge | Bob has no institutional memory |

**Note:** Tarsius intentionally uses only 5 MCP tools (not more) to keep the persistence layer minimal and reliable.

### 2. MCP Resources (Advanced Bob Feature)

Tarsius exposes structured data as MCP resources that can be accessed via @mention:
- `@tarsius/bri` — Business Rule Inventory (structured JSON)
- `@tarsius/gotchas` — Institutional Knowledge (tribal knowledge)
- `@tarsius/decisions` — Decision History (immutable audit trail)

This allows developers to reference Tarsius data directly in prompts: *"Based on @tarsius/bri, generate code that follows all approved rules."*

### 3. Lifecycle Hooks (Advanced Bob Feature)

Tarsius uses Bob's lifecycle hooks to auto-inject captured knowledge:
- `session_start` — Load BRI + decisions + gotchas at session start
- `before_edit` — Inject approved rules + gotcha warnings before every file edit
- `after_edit` — Verify output vs approved rules after every file edit

This ensures Bob **always** has the right context before generating code — even across session boundaries and context compaction events. This is the "Reinforce" step that makes Tarsius's persistence layer actually work.

### 4. Mode-Specific Rules (Advanced Bob Feature)

Tarsius defines persistence rules per custom mode:
- `.bob/rules-legacy-analyzer/` — Extraction rules (MUST call write_finding(), MUST check gotchas)
- `.bob/rules-modernization-transformer/` — Generation rules (MUST read RISK-CONTEXT.md, MUST NOT infer business logic)

This enforces persistence at the mode level — Bob cannot skip rules even if the developer forgets.

**Configuration:** `.bob/mcp.json` — registers Tarsius MCP server

### 5. Deterministic Risk Triage 🟢🟡🔴

Tarsius classifies rules using a **deterministic classifier** (5 conditions, zero LLM calls):
- Contradiction → 🔴 must-review
- Low confidence → 🔴 must-review
- Medium confidence → 🟡 glance
- Single source → 🟡 glance
- High confidence + dual source → 🟢 auto-approve

**Bob has no equivalent.** All rules would need manual review without this.

### 6. Business Rule Inventory (BRI)

Tarsius converts Bob's free-form output into a **structured JSON format** with typed fields:
- ruleId, type (explicit/implicit), confidence, source, triage, riskScore
- Evidence: codeLocation, docQuote, contradiction flag
- Approval status tracking

**Bob outputs text; Tarsius outputs data.** This enables deterministic triage and automated persistence.

### 7. RISK-CONTEXT.md Generation (Binding Contract)

After developer approval, Tarsius generates `.bob/RISK-CONTEXT.md`:
- Lists all approved rules (safe for Bob to implement)
- Includes gotcha warnings (institutional knowledge)
- **Bob reads this file BEFORE generating any code** — constraint enforced by Bob Rules

**Bob has no contract concept.** Without Tarsius, Bob generates from whatever context it has.

### 8. Confidence Badge (Verification)

After Bob generates code, Tarsius compares output against approved rules:
- AST structural diff (TypeScript/JavaScript)
- Heuristic fallback (keyword + regex)
- Confidence score: HIGH/LOW

**Bob Review is post-generation and checks code quality, not rule compliance.** Tarsius checks behavioral rule survival.

---

## How Bob Was Used During Development

| Phase | Bob Feature | What It Did |
|---|---|---|
| **Project Setup** | Agent Mode | Generated project structure, package.json, tsconfig.json |
| **MCP Server** | Agent Mode + Code Generation | Generated MCP server code, TypeScript types, tool implementations |
| **Dashboard** | Agent Mode + Code Generation | Generated React components, hooks, data fetching |
| **Custom Modes** | Agent Mode | Configured legacy-analyzer and modernization-transformer modes |
| **Testing** | Agent Mode + Debugging | Generated test scripts, debugged issues, verified flows |
| **Documentation** | Agent Mode + Document Generation | Generated all markdown documentation, specs, prompts |

---

## Bob Report

The exported Bob report (attached to submission) contains:
- All sessions used during development
- All MCP tool calls made during testing
- Custom mode configurations tested
- Code generated by Bob across all phases

---

## Why This Matters

**Bob + Tarsius = Complementary, Not Competing**

```
Bob Native:     Code Gen + Subagents + Doc Understanding + Custom Modes + Skills
Tarsius Added:  Knowledge Capture + Triage + Binding Contract + Decision History + Verification

Without Bob:    No AI execution engine
Without Tarsius: No way to capture knowledge that was never written down
With Both:      AI-speed modernization that actually preserves institutional knowledge
```

This is the **knowledge gap** that >70% of mainframe exit projects fall into (Gartner Jun 2026). Bob provides the engine. Tarsius provides the knowledge capture and persistence layer. Together = modernization at AI speed with enterprise-grade knowledge preservation.
