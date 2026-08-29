import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync, existsSync, createReadStream, statSync } from "fs";
import { join, extname } from "path";
import type { Plugin, ViteDevServer } from "vite";

// ─── /api/approve plugin ──────────────────────────────────────────────────────
// Handles POST /api/approve directly in the Vite dev server.
// Calls the same BRI file-write logic used by the MCP tools — no HTTP bridge needed.

function approvePlugin(): Plugin {
  return {
    name: "tarsius-approve-api",
    configureServer(server: ViteDevServer) {
      // Serve /publics/* from the monorepo root (images, assets)
      server.middlewares.use("/publics", (req, res, next) => {
        const root = join(process.cwd(), "..");
        const filePath = join(root, "publics", req.url ?? "");
        if (!existsSync(filePath)) { next(); return; }
        try {
          const stat = statSync(filePath);
          if (!stat.isFile()) { next(); return; }
          const ext = extname(filePath).toLowerCase();
          const mime: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp" };
          res.writeHead(200, {
            "Content-Type": mime[ext] ?? "application/octet-stream",
            "Content-Length": stat.size,
            "Cache-Control": "no-store",
          });
          createReadStream(filePath).pipe(res);
        } catch { next(); }
      });

      // Serve /sample-data/* as static JSON files from the monorepo root
      server.middlewares.use("/sample-data", (req, res, next) => {
        const root = join(process.cwd(), "..");
        const filePath = join(root, "sample-data", req.url ?? "");
        if (!existsSync(filePath)) { next(); return; }
        try {
          const stat = statSync(filePath);
          if (!stat.isFile()) { next(); return; }
          res.writeHead(200, {
            "Content-Type": extname(filePath) === ".json" ? "application/json" : "text/plain",
            "Content-Length": stat.size,
            "Cache-Control": "no-store",
          });
          createReadStream(filePath).pipe(res);
        } catch { next(); }
      });

      server.middlewares.use("/api/approve", (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405).end();
          return;
        }
        let body = "";
        req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
        req.on("end", () => {
          try {
            const { ruleId, decision } = JSON.parse(body) as { ruleId: string; decision: "approved" | "rejected" };
            const root = join(process.cwd(), "..");
            const briPath = join(root, "sample-data", "tarsius-bri.json");
            const decisionsPath = join(root, "sample-data", "tarsius-decisions.json");
            const riskContextPath = join(root, ".bob", "RISK-CONTEXT.md");

            // Update BRI
            const bri = JSON.parse(readFileSync(briPath, "utf-8"));
            const rule = bri.rules.find((r: { id: string }) => r.id === ruleId);
            if (!rule) { res.writeHead(404).end(JSON.stringify({ error: "Rule not found" })); return; }
            rule.approvalStatus = decision;
            bri.generatedAt = new Date().toISOString();
            writeFileSync(briPath, JSON.stringify(bri, null, 2));

            // Append decision record
            if (existsSync(decisionsPath)) {
              const store = JSON.parse(readFileSync(decisionsPath, "utf-8"));
              const id = `DEC-${String(store.decisions.length + 1).padStart(5, "0")}`;
              store.decisions.push({
                id,
                hash: Math.random().toString(16).slice(2, 18),
                chainHash: Math.random().toString(16).slice(2, 18),
                ruleId,
                decision: { previousStatus: "pending", newStatus: decision },
                decidedBy: { userId: "dashboard-user", userName: "Dashboard User", role: "developer" },
                timestamp: new Date().toISOString(),
                justification: `Dashboard ${decision}`,
                context: { overrideAutoApprove: false, reversed: false, riskScoreAtDecision: rule.riskScore ?? 0, triageAtDecision: rule.triage ?? "" },
              });
              store.summary.totalDecisions++;
              if (decision === "approved") store.summary.approved++;
              else store.summary.rejected++;
              writeFileSync(decisionsPath, JSON.stringify(store, null, 2));
            }

            // Regenerate RISK-CONTEXT.md
            const approved = bri.rules.filter((r: { approvalStatus: string }) => r.approvalStatus === "approved");
            const pending = bri.rules.filter((r: { approvalStatus: string }) => r.approvalStatus === "pending");
            const rejected = bri.rules.filter((r: { approvalStatus: string }) => r.approvalStatus === "rejected");
            let content = `# Tarsius Risk Context\n\n> Auto-generated by Tarsius Dashboard\n> Last updated: ${new Date().toISOString()}\n\n`;
            content += `## ✅ Approved Rules\n\n`;
            approved.forEach((r: { id: string; title: string }) => { content += `- **${r.id}**: ${r.title}\n`; });
            if (approved.length === 0) content += `(none)\n`;
            content += `\n## ⏳ Pending Rules\n\n`;
            pending.forEach((r: { id: string; title: string; evidence: { contradiction: boolean } }) => {
              content += `- **${r.id}**: ${r.title}${r.evidence.contradiction ? " ⚠️ CONTRADICTION" : ""}\n`;
            });
            if (pending.length === 0) content += `(none)\n`;
            content += `\n## ❌ Rejected Rules\n\n`;
            rejected.forEach((r: { id: string; title: string }) => { content += `- **${r.id}**: ${r.title}\n`; });
            if (rejected.length === 0) content += `(none)\n`;
            writeFileSync(riskContextPath, content);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, ruleId, decision }));
          } catch (err) {
            res.writeHead(500).end(JSON.stringify({ error: String(err) }));
          }
        });
      });
    },
  };
}

// ─── Vite config ──────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react(), tailwindcss(), approvePlugin()],
  server: {
    port: 5173,
    open: true,
    fs: {
      // Allow serving files from the monorepo root so /sample-data works
      allow: [".."],
    },
  },
  // Serve sample-data JSON files as static assets
  publicDir: false,
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
