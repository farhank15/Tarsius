import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
const BRI_PATH = join(process.cwd(), "sample-data", "tarsius-bri.json");
export function readBri() {
    if (!existsSync(BRI_PATH))
        return createEmptyBri();
    return JSON.parse(readFileSync(BRI_PATH, "utf-8"));
}
export function writeBri(bri) {
    writeFileSync(BRI_PATH, JSON.stringify(bri, null, 2));
}
export function appendRule(rule) {
    const bri = readBri();
    bri.rules.push(rule);
    bri.summary.totalRules++;
    if (rule.type === "explicit")
        bri.summary.explicit++;
    else
        bri.summary.implicit++;
    if (rule.evidence.contradiction)
        bri.summary.contradictions++;
    if (rule.triage === "🟢 auto-approve")
        bri.summary.byTriage["auto-approve"]++;
    else if (rule.triage === "🟡 glance")
        bri.summary.byTriage.glance++;
    else
        bri.summary.byTriage["must-review"]++;
    bri.generatedAt = new Date().toISOString();
    writeBri(bri);
    return bri;
}
export function updateRuleApproval(ruleId, status) {
    const bri = readBri();
    const rule = bri.rules.find((r) => r.id === ruleId);
    if (rule) {
        rule.approvalStatus = status;
        bri.generatedAt = new Date().toISOString();
        writeBri(bri);
    }
    return bri;
}
function createEmptyBri() {
    return {
        version: "3.0", sourceModule: "", attachedDocs: [],
        generatedAt: new Date().toISOString(), rules: [],
        summary: { totalRules: 0, explicit: 0, implicit: 0, contradictions: 0, modulesTracked: 0,
            byTriage: { "auto-approve": 0, glance: 0, "must-review": 0 } },
    };
}
//# sourceMappingURL=writer.js.map