export interface BusinessRule {
    id: string;
    type: "explicit" | "implicit";
    title: string;
    description: string;
    confidence: {
        label: "high" | "medium" | "low";
        score: number;
    };
    triage: "🟢 auto-approve" | "🟡 glance" | "🔴 must-review";
    riskScore: number;
    source: ("code" | "document")[];
    evidence: {
        codeLocation: {
            file: string;
            startLine: number;
            endLine: number;
        };
        docQuote: string | null;
        contradiction: boolean;
        contradictionNote?: string;
    };
    approvalStatus: "pending" | "approved" | "rejected";
    category: string;
    affectsModules: string[];
}
export interface BriDocument {
    version: string;
    sourceModule: string;
    attachedDocs: string[];
    generatedAt: string;
    rules: BusinessRule[];
    summary: {
        totalRules: number;
        explicit: number;
        implicit: number;
        contradictions: number;
        modulesTracked: number;
        byTriage: {
            "auto-approve": number;
            glance: number;
            "must-review": number;
        };
    };
}
//# sourceMappingURL=schema.d.ts.map