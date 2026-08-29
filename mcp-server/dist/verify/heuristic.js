export function heuristicVerify(approvedRules, newCode) {
    const deviations = [];
    for (const rule of approvedRules) {
        // Simple keyword check: does the rule title appear in the code?
        const keywords = rule.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const found = keywords.some((k) => newCode.toLowerCase().includes(k));
        if (!found) {
            deviations.push({
                ruleId: rule.id,
                type: "MISSING",
                detail: `Rule "${rule.title}" — keywords not found in generated code`,
            });
        }
    }
    const score = ((approvedRules.length - deviations.length) / Math.max(approvedRules.length, 1)) * 100;
    const overallConfidence = score > 80 ? "high" : score > 40 ? "medium" : "low";
    return { overallConfidence, score, deviations };
}
//# sourceMappingURL=heuristic.js.map