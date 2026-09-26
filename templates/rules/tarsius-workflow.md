# Tarsius Workflow Rules

## General
- Always check RISK-CONTEXT.md before generating code
- Never modify approved rules without developer approval
- Record all decisions with hash-based audit trail
- Preserve gotcha warnings in all generated code

## Extraction
- Cross-reference code against documentation
- Flag contradictions immediately
- Classify rules by risk score using the classifier
- Call check_gotchas() for every extracted rule

## Approval
- Require human approval for must-review rules
- Auto-approve only dual-source high-confidence rules
- Record justification for every decision
- Never approve rules with gotcha warnings without explicit override

## Generation
- ONLY implement rules listed as "Approved" in RISK-CONTEXT.md
- Include gotcha warnings in generated code comments
- Never infer business logic not in approved rules
- Verify all approved rules are implemented before presenting
