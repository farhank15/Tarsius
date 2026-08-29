export declare function handleRecordDecision(input: {
    ruleId: string;
    decision: "approved" | "rejected";
    userId?: string;
    userName?: string;
    role?: string;
    justification: string;
}): {
    success: boolean;
    error: string;
    decisionId?: undefined;
    hash?: undefined;
} | {
    success: boolean;
    decisionId: string;
    hash: string;
    error?: undefined;
};
//# sourceMappingURL=recordDecision.d.ts.map