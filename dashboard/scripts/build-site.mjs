import { execSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DASHBOARD_DIR = resolve(__dirname, "..");
const ROOT_DIR = resolve(DASHBOARD_DIR, "..");
const ROOT_BUILD_SCRIPT = resolve(ROOT_DIR, "scripts/build-site.mjs");

console.log("⚡ [Vercel Subfolder Bridge] Detected build triggered from dashboard/ directory.");

if (existsSync(ROOT_BUILD_SCRIPT)) {
  console.log(`📦 Executing unified root build script at: ${ROOT_BUILD_SCRIPT}`);
  execSync(`node "${ROOT_BUILD_SCRIPT}"`, { cwd: ROOT_DIR, stdio: "inherit" });

  // If Vercel expects dist inside dashboard/, mirror ROOT/dist into dashboard/dist
  const ROOT_DIST = resolve(ROOT_DIR, "dist");
  const DASHBOARD_DIST = resolve(DASHBOARD_DIR, "dist");

  if (existsSync(ROOT_DIST) && ROOT_DIST !== DASHBOARD_DIST) {
    console.log("🔄 Mirroring unified dist/ artifacts into dashboard/dist for Vercel deployment...");
    cpSync(ROOT_DIST, DASHBOARD_DIST, { recursive: true });
  }
} else {
  console.log("⚠️ Root build script not found. Building dashboard standalone via Vite...");
  execSync("npm run build", { cwd: DASHBOARD_DIR, stdio: "inherit" });
}

console.log("🎉 Dashboard & Unified Vercel build ready!");
