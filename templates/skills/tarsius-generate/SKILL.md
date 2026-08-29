---
name: tarsius-generate
description: Generate modernized code from approved business rules via Tarsius workflow
---

<Steps>
<Step>
Read .bob/RISK-CONTEXT.md to get the list of approved rules.
If RISK-CONTEXT.md does not exist or has 0 approved rules, STOP and notify the developer.
</Step>
<Step>
For each approved rule:
- Verify the rule is listed as "Approved" (not pending or rejected)
- Check for gotcha warnings that apply to this rule
- Include any relevant institutional knowledge in code comments
</Step>
<Step>
Generate code in the SAME language as the source project implementing ONLY the approved rules.
Follow the project's existing coding conventions.
Do NOT infer, guess, or reconstruct business logic not in the approved list.
</Step>
<Step>
After generation:
- Verify all approved rules are implemented
- Check for any gotcha warnings that were missed
- Report the generation summary to the developer
</Step>
<Step>
Present the generated code for developer review before committing.
</Step>
</Steps>
