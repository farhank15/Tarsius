import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");

console.log("🚀 Starting unified Tarsius production build...");

// 1. Build React dashboard
console.log("📦 Building React Triage Studio (dashboard)...");
execSync("npm run build", { cwd: resolve(ROOT, "dashboard"), stdio: "inherit" });

// 2. Prepare dist/
console.log("🧹 Cleaning dist/ directory...");
if (existsSync(DIST)) {
  rmSync(DIST, { recursive: true, force: true });
}
mkdirSync(DIST, { recursive: true });

// 3. Copy official landing page & documentation (index.html)
console.log("📄 Copying official Tarsius portal (index.html)...");
cpSync(resolve(ROOT, "index.html"), resolve(DIST, "index.html"));

// 4. Copy public assets (logos, favicons)
console.log("🖼️ Copying assets (public, publics)...");
if (existsSync(resolve(ROOT, "public"))) {
  cpSync(resolve(ROOT, "public"), resolve(DIST, "public"), { recursive: true });
}
if (existsSync(resolve(ROOT, "publics"))) {
  cpSync(resolve(ROOT, "publics"), resolve(DIST, "publics"), { recursive: true });
}

// 5. Copy sample data
console.log("📊 Copying sample-data...");
if (existsSync(resolve(ROOT, "sample-data"))) {
  cpSync(resolve(ROOT, "sample-data"), resolve(DIST, "sample-data"), { recursive: true });
}

// 6. Copy presentation slide deck
console.log("📑 Copying presentation slide deck...");
const presSrc = existsSync(resolve(ROOT, "presentation"))
  ? resolve(ROOT, "presentation")
  : resolve(ROOT, "docs/presentation");
if (existsSync(presSrc)) {
  cpSync(presSrc, resolve(DIST, "presentation"), { recursive: true });
}

// 7. Copy dashboard build to dist/studio
console.log("🖥️ Installing React Triage Studio at dist/studio...");
mkdirSync(resolve(DIST, "studio"), { recursive: true });
if (existsSync(resolve(ROOT, "dashboard/dist"))) {
  cpSync(resolve(ROOT, "dashboard/dist"), resolve(DIST, "studio"), { recursive: true });
}

// Ensure studio has access to sample-data and public assets relative to /studio
if (existsSync(resolve(ROOT, "sample-data"))) {
  cpSync(resolve(ROOT, "sample-data"), resolve(DIST, "studio/sample-data"), { recursive: true });
}
if (existsSync(resolve(ROOT, "public"))) {
  cpSync(resolve(ROOT, "public"), resolve(DIST, "studio/public"), { recursive: true });
}
if (existsSync(resolve(ROOT, "publics"))) {
  cpSync(resolve(ROOT, "publics"), resolve(DIST, "studio/publics"), { recursive: true });
}

console.log("✅ Unified Tarsius production build complete!");
console.log("   - /            -> Official Tarsius Platform & BETH Simulator");
console.log("   - /studio/     -> Live React Triage Studio");
console.log("   - /presentation-> Official Slide Deck");
console.log("   - /public/     -> Logos & Favicon");
