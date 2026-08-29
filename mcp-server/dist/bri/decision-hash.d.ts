export declare function computeDecisionHash(data: {
    ruleId: string;
    decision: {
        previousStatus: string;
        newStatus: string;
    };
    userId: string;
    timestamp: string;
    justification: string;
}): string;
export declare function computeChainHash(currentHash: string, previousChainHash: string): string;
//# sourceMappingURL=decision-hash.d.ts.map