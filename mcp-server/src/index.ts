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
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ─── Types ────────────────────────────────────────────────────────────────────
// Placeholder: full BRI schema types will be added during hackathon

// ─── Tools ─────────────────────────────────────────────────────────────────────
const server = new Server(
  {
    name: "tarsius-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "write_finding",
        description:
          "Record an extracted business rule finding from legacy code analysis into the Business Rule Inventory (BRI).",
        inputSchema: {
          type: "object",
          properties: {
            ruleId: { type: "string", description: "Unique rule identifier" },
            module: { type: "string", description: "Source module name" },
            description: {
              type: "string",
              description: "Description of the business rule",
            },
          },
          required: ["ruleId", "module", "description"],
        },
      },
      {
        name: "get_pending_approvals",
        description:
          "Retrieve business rules pending human review, with optional filters for module and triage level.",
        inputSchema: {
          type: "object",
          properties: {
            module: {
              type: "string",
              description: "Filter by module name (optional)",
            },
            triage: {
              type: "string",
              enum: ["must-review", "glance", "auto-approve"],
              description: "Filter by triage level (optional)",
            },
            limit: {
              type: "number",
              description: "Maximum results to return (default: 20)",
            },
          },
        },
      },
      {
        name: "mark_approved",
        description:
          "Mark a business rule as approved or rejected after human review.",
        inputSchema: {
          type: "object",
          properties: {
            ruleId: {
              type: "string",
              description: "Rule ID to approve or reject",
            },
            approved: {
              type: "boolean",
              description: "true = approve, false = reject",
            },
            comment: {
              type: "string",
              description: "Optional reviewer comment",
            },
          },
          required: ["ruleId", "approved"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "write_finding": {
      return {
        content: [
          {
            type: "text",
            text: `[STUB] Finding recorded: ${args?.ruleId} in ${args?.module}`,
          },
        ],
      };
    }

    case "get_pending_approvals": {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                items: [],
                total: 0,
                filters: args ?? {},
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "mark_approved": {
      return {
        content: [
          {
            type: "text",
            text: `[STUB] Rule ${args?.ruleId} ${
              args?.approved ? "approved" : "rejected"
            }`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Tarsius MCP] Server running on stdio");
}

main().catch((error) => {
  console.error("[Tarsius MCP] Fatal error:", error);
  process.exit(1);
});
