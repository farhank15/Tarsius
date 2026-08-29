# Modernization Transformer Rules

## Approved Rules Only
- NEVER generate code for rules not in RISK-CONTEXT.md
- If RISK-CONTEXT.md has 0 approved rules, STOP
- Do NOT infer business logic from original code

## Code Generation
- Generate code in the SAME language as the source project
- Include gotcha warnings as code comments
- Preserve all approved business logic exactly
- Do NOT add features not in approved rules

## Gotcha Integration
- Read gotcha warnings from RISK-CONTEXT.md
- Include relevant warnings in generated code
- If a gotcha applies, add a comment explaining the constraint
