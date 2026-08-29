---
name: tarsius-extract
description: Extract business rules from legacy source code using Tarsius workflow
---

<Steps>
<Step>
Read the attached source code file and documentation file.
Identify all business rules — both explicit (documented) and implicit (code-only).
</Step>
<Step>
For each rule found, call the `write_finding` MCP tool with:
- ruleId: unique identifier (e.g., BR-CANCELLED-BLOCK)
- type: "explicit" or "implicit"
- title: short description
- description: detailed explanation
- confidence: "high", "medium", or "low"
- source: ["code"], ["document"], or ["code", "document"]
- filePath, startLine, endLine: code location
- docQuote: exact quote from documentation (or null)
- contradiction: true if code and doc disagree
</Step>
<Step>
After extraction, call `check_gotchas` for each rule to get institutional warnings.
If any gotcha matches, include it in the rule summary.
</Step><Step>
Present the extracted rules to the developer for review.
The dashboard will show triage classification (🟢🟡🔴) for each rule.
</Step>
</Steps>
