/**
 * Tarsius MCP Server
 *
 * Bridges IBM Bob 2.0 with Business Rule Inventory (BRI).
 * Provides tools for rule extraction, triage classification, and approval workflow.
 *
 * @packageDocumentation
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { handleWriteFinding } from "./tools/writeFinding.js";
import { handleGetPendingApprovals } from "./tools/getPendingApprovals.js";
import { handleMarkApproved } from "./tools/markApproved.js";
import { handleRecordDecision } from "./tools/recordDecision.js";
import { handleCheckGotchas } from "./tools/checkGotchas.js";
// ─── Server ───────────────────────────────────────────────────────────────────
const server = new Server({ name: "tarsius-mcp-server", version: "1.0.0" }, { capabilities: { tools: {} } });
// ─── Tool Definitions ─────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "write_finding",
                description: "Record an extracted business rule finding from legacy code analysis into the Business Rule Inventory (BRI). Automatically classifies triage (🟢🟡🔴) and risk score.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ruleId: { type: "string", description: "Unique rule identifier (e.g. BR-CANCELLED-BLOCK)" },
                        module: { type: "string", description: "Source module name (e.g. ORDVAL)" },
                        type: { type: "string", enum: ["explicit", "implicit"], description: "Whether the rule is explicitly documented or implicit in code" },
                        title: { type: "string", description: "Short rule title" },
                        description: { type: "string", description: "Detailed description of the business rule" },
                        confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level of the extraction" },
                        source: { type: "array", items: { type: "string", enum: ["code", "document"] }, description: "Where the rule was found" },
                        filePath: { type: "string", description: "Source file path" },
                        startLine: { type: "number", description: "Start line in source file" },
                        endLine: { type: "number", description: "End line in source file" },
                        docQuote: { type: "string", description: "Exact quote from documentation (omit if code-only)" },
                        contradiction: { type: "boolean", description: "True if code and documentation disagree" },
                        contradictionNote: { type: "string", description: "Explanation of the contradiction" },
                        category: { type: "string", description: "Rule category (e.g. account-status, pricing)" },
                        affectsModules: { type: "array", items: { type: "string" }, description: "Other modules affected by this rule" },
                    },
                    required: ["ruleId", "module", "type", "title", "description", "confidence", "source", "filePath", "startLine", "endLine"],
                },
            },
            {
                name: "get_pending_approvals",
                description: "Retrieve business rules pending human review, with optional filters for triage level and result limit.",
                inputSchema: {
                    type: "object",
                    properties: {
                        filterTriage: { type: "string", enum: ["🟢 auto-approve", "🟡 glance", "🔴 must-review"], description: "Filter by triage level (optional)" },
                        limit: { type: "number", description: "Maximum results to return (default: all)" },
                    },
                },
            },
            {
                name: "mark_approved",
                description: "Mark a business rule as approved or rejected after human review. Automatically regenerates .bob/RISK-CONTEXT.md and records an immutable decision entry.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ruleId: { type: "string", description: "Rule ID to approve or reject" },
                        decision: { type: "string", enum: ["approved", "rejected"], description: "Approval decision" },
                        justification: { type: "string", description: "Reason for the decision (used in decision audit trail)" },
                    },
                    required: ["ruleId", "decision"],
                },
            },
            {
                name: "record_decision",
                description: "Record an immutable, SHA-256-hashed decision entry in the audit trail for a business rule.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ruleId: { type: "string", description: "Rule ID the decision applies to" },
                        decision: { type: "string", enum: ["approved", "rejected"], description: "Decision made" },
                        justification: { type: "string", description: "Reason for the decision" },
                        userId: { type: "string", description: "User ID of the decision maker (optional)" },
                        userName: { type: "string", description: "Display name of the decision maker (optional)" },
                        role: { type: "string", description: "Role of the decision maker (optional)" },
                    },
                    required: ["ruleId", "decision", "justification"],
                },
            },
            {
                name: "check_gotchas",
                description: "Check institutional knowledge warnings (gotchas) for a given rule or category. Returns active warnings that should be reviewed before approving or generating code.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ruleId: { type: "string", description: "Rule ID to check gotchas for (optional)" },
                        category: { type: "string", description: "Rule category to check gotchas for (optional)" },
                    },
                },
            },
        ],
    };
});
// ─── Tool Routing ─────────────────────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const respond = (data) => ({
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    });
    switch (name) {
        case "write_finding":
            return respond(handleWriteFinding(args));
        case "get_pending_approvals":
            return respond(handleGetPendingApprovals((args ?? {})));
        case "mark_approved":
            return respond(handleMarkApproved(args));
        case "record_decision":
            return respond(handleRecordDecision(args));
        case "check_gotchas":
            return respond(handleCheckGotchas((args ?? {})));
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});
// ─── Start ────────────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[Tarsius MCP] Server running on stdio — 5 tools active");
}
main().catch((error) => {
    console.error("[Tarsius MCP] Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map