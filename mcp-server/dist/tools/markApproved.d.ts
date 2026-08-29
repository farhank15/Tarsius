export declare function handleMarkApproved(input: {
    ruleId: string;
    decision: "approved" | "rejected";
    justification?: string;
}): {
    success: boolean;
    ruleId: string;
    decision: "approved" | "rejected";
    updatedCount: number;
};
//# sourceMappingURL=markApproved.d.ts.map