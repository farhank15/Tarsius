import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { handleWriteFinding } from "./tools/writeFinding.js";
import { handleGetPendingApprovals } from "./tools/getPendingApprovals.js";
import { handleMarkApproved } from "./tools/markApproved.js";
import { handleRecordDecision } from "./tools/recordDecision.js";
import { handleCheckGotchas } from "./tools/checkGotchas.js";
import { runBeth, runNaiveModern, runGovernedModern } from "./verify/beth.js";

// ---------------------------------------------------------------------------
// Server instance
// ---------------------------------------------------------------------------

const server = new McpServer(
  { name: "tarsius-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ---------------------------------------------------------------------------
// Helper: wrap handler result as MCP text content
// ---------------------------------------------------------------------------

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function err(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

// ---------------------------------------------------------------------------
// Tool: write_finding
// ---------------------------------------------------------------------------

server.registerTool(
  "write_finding",
  {
    description:
      "Record an extracted business rule finding from legacy code analysis into the Business Rule Inventory (BRI). Automatically classifies triage and risk score.",
    inputSchema: {
      ruleId: z.string().describe("Unique rule identifier (e.g. BR-CANCELLED-BLOCK)"),
      module: z.string().describe("Source module name (e.g. ORDVAL)"),
      type: z.enum(["explicit", "implicit"]).describe("Whether the rule is explicitly documented or implicit in code"),
      title: z.string().describe("Short rule title"),
      description: z.string().describe("Detailed description of the business rule"),
      confidence: z.enum(["high", "medium", "low"]).describe("Confidence level of the extraction"),
      source: z.array(z.enum(["code", "document"])).describe("Where the rule was found"),
      filePath: z.string().describe("Source file path"),
      startLine: z.number().int().describe("Start line in source file"),
      endLine: z.number().int().describe("End line in source file"),
      category: z.string().optional().describe("Rule category (e.g. account-status, pricing)"),
      affectsModules: z.array(z.string()).optional().describe("Other modules affected by this rule"),
      docQuote: z.string().optional().describe("Exact quote from documentation (omit if code-only)"),
      contradiction: z.boolean().optional().describe("True if code and documentation disagree"),
      contradictionNote: z.string().optional().describe("Explanation of the contradiction"),
    },
  },
  async (args) => {
    try {
      return ok(await handleWriteFinding(args));
    } catch (e) {
      return err(String(e));
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: get_pending_approvals
// ---------------------------------------------------------------------------

server.registerTool(
  "get_pending_approvals",
  {
    description:
      "Retrieve business rules pending human review, with optional filters for triage level and result limit.",
    inputSchema: {
      filterTriage: z
        .enum(["🟢 auto-approve", "🟡 glance", "🔴 must-review"])
        .optional()
        .describe("Filter by triage level (optional)"),
      limit: z.number().int().positive().optional().describe("Maximum results to return (default: all)"),
    },
  },
  async (args) => {
    try {
      return ok(await handleGetPendingApprovals(args));
    } catch (e) {
      return err(String(e));
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: mark_approved
// ---------------------------------------------------------------------------

server.registerTool(
  "mark_approved",
  {
    description:
      "Mark a business rule as approved or rejected after human review. Automatically regenerates .bob/RISK-CONTEXT.md and records an immutable decision entry.",
    inputSchema: {
      ruleId: z.string().describe("Rule ID to approve or reject"),
      decision: z.enum(["approved", "rejected"]).describe("Approval decision"),
      justification: z.string().optional().describe("Reason for the decision (used in decision audit trail)"),
      userId: z.string().optional().describe("User ID of the decision maker"),
      userName: z.string().optional().describe("Display name of the decision maker"),
      role: z.string().optional().describe("Role of the decision maker"),
    },
  },
  async (args) => {
    try {
      return ok(await handleMarkApproved(args));
    } catch (e) {
      return err(String(e));
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: record_decision
// ---------------------------------------------------------------------------

server.registerTool(
  "record_decision",
  {
    description:
      "Record an immutable, SHA-256-hashed decision entry in the audit trail for a business rule.",
    inputSchema: {
      ruleId: z.string().describe("Rule ID the decision applies to"),
      decision: z.enum(["approved", "rejected"]).describe("Decision made"),
      justification: z.string().describe("Reason for the decision"),
      previousStatus: z.string().optional().describe("Previous approval status of the rule"),
      decidedBy: z
        .object({
          userId: z.string().optional(),
          userName: z.string().optional(),
          role: z.string().optional(),
        })
        .optional()
        .describe("Identity of the decision maker"),
      context: z
        .object({
          overrideAutoApprove: z.boolean().optional(),
          reversed: z.boolean().optional(),
          riskScoreAtDecision: z.number().optional(),
          triageAtDecision: z.string().optional(),
        })
        .optional()
        .describe("Additional context for the decision"),
    },
  },
  async (args) => {
    try {
      return ok(await handleRecordDecision(args));
    } catch (e) {
      return err(String(e));
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: check_gotchas
// ---------------------------------------------------------------------------

server.registerTool(
  "check_gotchas",
  {
    description:
      "Check institutional knowledge warnings (gotchas) for a given rule or category. Returns active warnings that should be reviewed before approving or generating code.",
    inputSchema: {
      ruleId: z.string().optional().describe("Rule ID to check gotchas for (optional)"),
      category: z.string().optional().describe("Rule category to check gotchas for (optional)"),
    },
  },
  async (args) => {
    try {
      return ok(await handleCheckGotchas(args));
    } catch (e) {
      return err(String(e));
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: verify_equivalence
// ---------------------------------------------------------------------------

server.registerTool(
  "verify_equivalence",
  {
    description:
      "Run the BETH differential oracle: execute the 12 ORDVAL test vectors against the legacy oracle and modern runner. Reports BER.",
    inputSchema: {
      runner: z
        .enum(["naive", "governed"])
        .default("governed")
        .describe("Which modernized implementation to test"),
    },
  },
  async (args) => {
    try {
      const selectedRunner = args.runner === "naive" ? runNaiveModern : runGovernedModern;
      const report = runBeth(selectedRunner, { runnerName: args.runner });
      return ok(report);
    } catch (e) {
      return err(String(e));
    }
  }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
