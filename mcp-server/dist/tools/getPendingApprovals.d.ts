export declare function handleGetPendingApprovals(input: {
    filterTriage?: string;
    limit?: number;
}): {
    rules: import("../bri/schema.js").BusinessRule[];
    total: number;
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
};
//# sourceMappingURL=getPendingApprovals.d.ts.map