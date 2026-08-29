# Tarsius — Submission Draft
*IBM TechXchange 2026 Pre-conference Dev Day Hackathon*

---

## 1. Problem Statement

Legacy IBM i applications — written in RPG and ILE COBOL — run mission-critical operations across banking, insurance, and government systems worldwide. But the workforce that understands these systems is disappearing. 72% of RPG developers are over the age of 50, and the median age of COBOL maintainers is now 55–61, with roughly 10% retiring every year. When these developers leave, they don't just take syntax knowledge with them — they take the undocumented business rules, exceptions, and workarounds that were never written into code comments, technical documentation, or any Redbook. This is tacit knowledge: the "don't touch this field because of a hidden downstream dependency" kind of knowledge that only lives in a person's memory.

This creates a specific and dangerous blind spot for AI-assisted modernization. Tools like IBM Bob's Retrieval-Augmented Generation and Business Rules Extraction are highly effective — but only when the answer exists somewhere in writing (source code, documentation, or a Redbook). When a critical rule was never written down anywhere, RAG has nothing to retrieve, and code-reading extraction has nothing to extract. The system will confidently generate plausible-looking code that silently violates a rule no one remembered to state.

The cost of this gap is measurable: undocumented business logic is cited as the leading cause of failed modernization projects, with 30–50% cost overruns common when teams must reverse-engineer intent from code alone. Once a senior developer retires without a structured handoff, that knowledge gap becomes permanent and unrecoverable — no future AI tool, however capable, can extract knowledge from a document that was never written.

**The core problem: critical operational knowledge is disappearing from IBM i teams faster than it can be captured, and existing AI tooling — no matter how sophisticated — cannot recover knowledge that was never externalized in the first place.**

---

## 2. Solution Statement

Tarsius is a tacit-knowledge capture and persistence layer that works alongside IBM Bob to close the specific gap that code-reading and document-retrieval tools cannot reach.

Where IBM Bob's Business Rules Extraction reads existing RPG/COBOL source to surface the logic that is already encoded, and Bob's RAG retrieves accurate answers from documentation and Redbooks that already exist, Tarsius targets the knowledge that exists in neither place: the exceptions, edge cases, and "gotchas" that a senior developer knows but has never written anywhere.

Tarsius does this through a structured interview and approval workflow, run as a custom Bob mode with dedicated subagents:

1. **Capture** — A senior engineer is guided through a structured review session (using a Bob custom mode) that surfaces implicit rules Bob's static analysis cannot detect on its own — for example, an undocumented exception tied to a specific customer type, encoded as a hard-coded workaround with no comment explaining why. The engineer confirms, corrects, or adds context to each finding.
2. **Persist** — Approved rules are written to a structured, versioned rule ledger (Business Rule Inventory) stored *outside* Bob's active context window, with an immutable, hash-based decision record of who approved what, and when.
3. **Reinforce** — Before any subsequent code generation task touches related logic, the relevant rules are automatically re-injected into Bob's working context — regardless of whether the original approval happened in the same session, a prior session, or before a context compaction event erased the detailed history in favor of a summary.
4. **Learn** — A "gotcha memory" stores institutional knowledge — manually seeded examples of exceptions, legal requirements, and gotchas that the team has identified. This knowledge persists across sessions and is surfaced during future extraction and generation tasks. The system is designed to accumulate patterns over time as more decisions are recorded.

This is not a replacement for Bob's native capabilities — it is a companion layer that ensures the knowledge Bob cannot see (because it was never written down) gets captured once, by a human, before it's gone for good, and then never has to be re-explained or re-discovered again.

---

## 3. How IBM Bob Was Utilized

- **Agent Mode / Custom Modes** — Two purpose-built modes: a "Legacy Analyzer" mode for the capture/interview phase, and a "Transformer" mode for code generation constrained by approved rules.
- **Subagents / Parallel Tasks** — Per-function subagents scan different modules of a legacy codebase in parallel during the capture phase, each surfacing candidate implicit-rule findings for human review, keeping the main context window focused.
- **Document Understanding** — Bob reads existing RPG/COBOL source and any available documentation as the baseline "what is already known" layer, so the interview workflow only asks about genuinely undocumented gaps rather than re-deriving things Bob can already extract on its own.
- **MCP Tools (custom)** — A small MCP server exposes tools (`write_finding`, `get_pending`, `mark_approved`, `record_decision`, `check_gotchas`) that Bob calls during both modes to read from and write to the persistent rule ledger.

---

## 4. Measurable Impact

| Metric | Without Tarsius | With Tarsius |
|---|---|---|
| Time to review generated changes against tribal knowledge | ~2 hours reviewing 200 lines of code | ~5 minutes approving a small set of flagged rules |
| Knowledge loss on developer departure | Total — knowledge is gone | Captured once, reusable indefinitely |
| Rule consistency across sessions/compaction events | Not guaranteed — rules can be forgotten as context is summarized | Enforced — rules are re-injected regardless of session boundaries |

*In our demo scenario with 5 extracted business rules, the developer reviews and approves rules in minutes rather than re-reading hundreds of lines of legacy code. The deterministic triage classifier automatically classifies rules by risk level, surfacing the ones that need human attention.*

---

## 5. Anticipated Judge Question: "Why not just use Bob's built-in Business Rules Extraction or RAG?"

**Answer:** Business Rules Extraction reads logic that is already encoded in source. RAG retrieves answers that already exist in documentation or Redbooks. Both require the knowledge to already be written down somewhere. Tarsius addresses the case neither can reach: knowledge that was never externalized at all, and exists only in a person's memory. Tarsius is the step that happens *before* extraction and retrieval become possible — turning tacit knowledge into the kind of written artifact that Bob's existing tools can then read, retrieve, and act on with confidence.
