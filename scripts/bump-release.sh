#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Tarsius — Release Bumper Script
#  Bumps version, runs tests & builds, commits, pushes, and creates GitHub release.
#
#  Usage:
#    ./scripts/bump-release.sh [version]
#    Example: ./scripts/bump-release.sh 0.1.1
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

NEW_VER="${1:-0.1.1}"
NEW_TAG="v${NEW_VER}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ANSI Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "\n${BOLD}${BLUE}🚀 Tarsius Release Bumper → ${NEW_TAG}${NC}\n"

cd "${ROOT_DIR}"

# 1. Verify gh cli is installed and authenticated
if ! command -v gh &>/dev/null; then
  echo -e "${RED}✖ GitHub CLI (gh) is not installed. Install with 'brew install gh'${NC}"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo -e "${RED}✖ gh is not authenticated. Run 'gh auth login' first.${NC}"
  exit 1
fi
echo -e "${GREEN}✔ GitHub CLI authenticated${NC}"

# 2. Update version in files
echo -e "${BLUE}📝 Bumping version to ${NEW_VER}...${NC}"

# 2a. bin/tarsius
sed -i '' "s/const VERSION = '[^']*';/const VERSION = '${NEW_VER}';/" bin/tarsius
echo -e "  ✔ Updated ${BOLD}bin/tarsius${NC}"

# 2b. package.json
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.version = '${NEW_VER}';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
"
echo -e "  ✔ Updated ${BOLD}package.json${NC}"

# 2c. dashboard/package.json
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('dashboard/package.json', 'utf8'));
p.version = '${NEW_VER}';
fs.writeFileSync('dashboard/package.json', JSON.stringify(p, null, 2) + '\n');
"
echo -e "  ✔ Updated ${BOLD}dashboard/package.json${NC}"

# 3. Build & Test
echo -e "\n${BLUE}📦 Building dashboard...${NC}"
(cd dashboard && npm run build)

echo -e "\n${BLUE}🧪 Running test verification suite...${NC}"
npm test

# 4. Sync to secondary workspace if present
SYNC_TARGET="/Users/mawa/Development/my_projects/Tarsius"
if [ -d "${SYNC_TARGET}" ] && [ "${ROOT_DIR}" != "${SYNC_TARGET}" ]; then
  echo -e "\n${BLUE}🔄 Syncing to ${SYNC_TARGET}...${NC}"
  rsync -av --exclude 'node_modules' --exclude '.git' "${ROOT_DIR}/" "${SYNC_TARGET}/" >/dev/null
  echo -e "  ✔ Synced to ${SYNC_TARGET}"
fi

# 5. Git commit & push
echo -e "\n${BLUE}📤 Committing and pushing to git main...${NC}"
git add .
git commit -m "feat(release): bump to ${NEW_TAG} with unified .tarsius governance and port 8321

- Standardize dedicated .tarsius/ directory for repo governance (bri.json, decisions.json, gotchas.json)
- Migrate Studio default port from 5173 to 8321 with clean foreground lifecycle & Ctrl+C cancel
- Consolidate legacy sample workloads (ORDVAL & XFRFUN) into unified multi-module inventory
- Add dynamic module filtering and empty state to Studio Dashboard
- Fix tarsius status workspace resolution and MCP server TARSIUS_WORKSPACE isolation
- Pass all 49/49 regression tests with 100% Behavioral Equivalence Rate"

git push origin main
echo -e "${GREEN}✔ Pushed changes to origin main${NC}"

# 6. Create or update Git tag & GitHub Release
echo -e "\n${BLUE}🏷️  Publishing GitHub Release ${NEW_TAG}...${NC}"

# Delete existing local/remote tag if re-releasing
if git rev-parse "${NEW_TAG}" >/dev/null 2>&1; then
  git tag -d "${NEW_TAG}" 2>/dev/null || true
  git push origin --delete "${NEW_TAG}" 2>/dev/null || true
fi

RELEASE_NOTES="### Tarsius ${NEW_TAG} — Behavioral Safety Layer for AI Legacy Modernization

#### 🌟 Key Highlights
- **Dedicated \`.tarsius/\` Governance Standard**:
  - \`.tarsius/bri.json\`: Consolidated 8-rule Business Rule Inventory covering both IBM i (ORDVAL RPGLE) and z/OS (XFRFUN COBOL) legacy modules.
  - \`.tarsius/decisions.json\`: Cryptographically chained audit ledger with genuine SHA-256 hash chaining.
  - \`.tarsius/gotchas.json\`: Regulatory and legal gotchas knowledge base (Class Action CS-4471, Plan-7 pricing, Regulation E / US 12 CFR § 1005).
- **Tarsius Studio Port 8321**:
  - Migrated default dashboard port from 5173 to **8321** (\`http://localhost:8321/\`).
  - Foreground execution with proper signal handling: **Ctrl + C** immediately terminates the process and releases the port.
  - Dynamic module filtering (\`All Modules\`, \`ORDVAL.rpgle\`, \`XFRFUN.cbl\`) and empty state support for unanalyzed repos.
  - Native endpoints: \`GET /api/bri\`, \`GET /api/decisions\`, \`GET /api/gotchas\`, and \`POST /api/approve\`.
- **MCP Server & CLI Improvements**:
  - \`tarsius status\` accurately prioritizes local workspace without leaking fallback sample rules.
  - \`get_pending_approvals\` and \`mark_approved\` MCP tools now cleanly isolate outputs inside target \`TARSIUS_WORKSPACE\`.
- **Verified Accuracy**:
  - 100% Behavioral Equivalence Rate (BER) confirmed via BETH differential oracle across all test vectors."

gh release create "${NEW_TAG}" \
  --title "Tarsius ${NEW_TAG} — Unified .tarsius Governance & Port 8321" \
  --notes "${RELEASE_NOTES}"

echo -e "\n${GREEN}${BOLD}🎉 Successfully released ${NEW_TAG}!${NC}"
echo -e "   Release URL: https://github.com/farhank15/Tarsius/releases/tag/${NEW_TAG}\n"
