import { checkGotchas as queryGotchas } from "../bri/gotcha-store.js";
export function handleCheckGotchas(input) {
    const gotchas = queryGotchas(input);
    return {
        gotchas,
        count: gotchas.length,
        warnings: gotchas.map((g) => `[${g.severity.toUpperCase()}] ${g.title}: ${g.description}`),
    };
}
//# sourceMappingURL=checkGotchas.js.map