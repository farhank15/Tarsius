---
name: tarsius-review
description: Review and approve/reject extracted business rules via Tarsius dashboard
---

<Steps>
<Step>
Call `get_pending_approvals` to list all rules awaiting review.
Present the rules with their triage classification (🟢🟡🔴).
</Step>
<Step>
For each rule, display:
- Rule ID and title
- Triage level (auto-approve, glance, must-review)
- Risk score (0-100)
- Evidence (code location + doc quote)
- Contradiction status
- Gotcha warnings (if any)
</Step>
<Step>
For 🔴 must-review rules:
- Highlight the contradiction or risk
- Show gotcha warnings from institutional memory
- Require developer justification before approval
</Step>
<Step>
For 🟢 auto-approve rules:
- Confirm dual-source verification
- Auto-approve if confidence is high
- Record decision with hash
</Step>
<Step>
After all rules are approved/rejected:
- Call `record_decision` for each decision
- Call `analyze_patterns` to update pattern detection
- Regenerate RISK-CONTEXT.md with approved rules + gotcha warnings
</Step>
</Steps>
