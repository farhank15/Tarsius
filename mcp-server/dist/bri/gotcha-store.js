import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
const GOTCHAS_PATH = join(process.cwd(), "sample-data", "tarsius-gotchas.json");
function createEmptyStore() {
    return {
        version: "1.0", gotchas: [],
        summary: { totalGotchas: 0, active: 0, byCategory: {}, bySeverity: {} },
    };
}
export function readGotchas() {
    if (!existsSync(GOTCHAS_PATH))
        return createEmptyStore();
    return JSON.parse(readFileSync(GOTCHAS_PATH, "utf-8"));
}
export function writeGotchas(store) {
    writeFileSync(GOTCHAS_PATH, JSON.stringify(store, null, 2));
}
export function addGotcha(input) {
    const store = readGotchas();
    const id = `GOT-${String(store.gotchas.length + 1).padStart(3, "0")}`;
    const record = {
        id, title: input.title, description: input.description,
        category: input.category, severity: input.severity,
        triggerCount: 1, active: true,
        addedAt: new Date().toISOString(), addedBy: input.addedBy,
        relatedRules: input.relatedRules,
    };
    store.gotchas.push(record);
    store.summary.totalGotchas++;
    store.summary.active++;
    store.summary.byCategory[input.category] = (store.summary.byCategory[input.category] || 0) + 1;
    store.summary.bySeverity[input.severity] = (store.summary.bySeverity[input.severity] || 0) + 1;
    writeGotchas(store);
    return record;
}
export function checkGotchas(input) {
    const store = readGotchas();
    let active = store.gotchas.filter((g) => g.active);
    if (input.category)
        active = active.filter((g) => g.category === input.category);
    if (input.ruleId)
        active = active.filter((g) => g.relatedRules.includes(input.ruleId));
    // Increment trigger count
    active.forEach((g) => { g.triggerCount++; });
    writeGotchas(store);
    return active;
}
//# sourceMappingURL=gotcha-store.js.map