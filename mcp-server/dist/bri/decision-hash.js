import { createHash } from "crypto";
export function computeDecisionHash(data) {
    const content = JSON.stringify({
        ruleId: data.ruleId,
        decision: data.decision,
        userId: data.userId,
        timestamp: data.timestamp,
        justification: data.justification,
    });
    return createHash("sha256").update(content).digest("hex").slice(0, 16);
}
export function computeChainHash(currentHash, previousChainHash) {
    return createHash("sha256")
        .update(currentHash + previousChainHash)
        .digest("hex")
        .slice(0, 16);
}
//# sourceMappingURL=decision-hash.js.map