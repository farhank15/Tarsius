export interface WriteFindingInput {
    ruleId: string;
    module: string;
    type: "explicit" | "implicit";
    title: string;
    description: string;
    confidence: "high" | "medium" | "low";
    source: ("code" | "document")[];
    filePath: string;
    startLine: number;
    endLine: number;
    docQuote?: string;
    contradiction?: boolean;
    contradictionNote?: string;
    category?: string;
    affectsModules?: string[];
}
export declare function handleWriteFinding(input: WriteFindingInput): {
    success: boolean;
    ruleId: string;
    triage: "🟢 auto-approve" | "🟡 glance" | "🔴 must-review";
    riskScore: number;
    totalRules: number;
};
//# sourceMappingURL=writeFinding.d.ts.map