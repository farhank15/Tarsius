#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Tarsius — One-line installer
#  curl -fsSL https://raw.githubusercontent.com/farhank15/Tarsius/main/install.sh | bash
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
REPO_URL="https://github.com/farhank15/Tarsius.git"
TARBALL_URL="https://github.com/farhank15/Tarsius/archive/refs/heads/main.tar.gz"
TARSIUS_HOME="${TARSIUS_HOME:-$HOME/.tarsius}"

# ─── ANSI colours ─────────────────────────────────────────────────────────────
RESET=$'\e[0m'
BOLD=$'\e[1m'
DIM=$'\e[2m'
RED=$'\e[31m'
GREEN=$'\e[32m'
YELLOW=$'\e[33m'
CYAN=$'\e[36m'

ok()   { echo "${GREEN}  ✔${RESET} $*"; }
warn() { echo "${YELLOW}  ⚠${RESET} $*"; }
err()  { echo "${RED}  ✖${RESET} $*" >&2; }
info() { echo "${CYAN}  →${RESET} $*"; }
dim()  { echo "${DIM}    $*${RESET}"; }

# ─── Banner ───────────────────────────────────────────────────────────────────
print_banner() {
cat <<'EOF'

  ████████╗ █████╗ ██████╗ ███████╗██╗██╗   ██╗███████╗
     ██╔══╝██╔══██╗██╔══██╗██╔════╝██║██║   ██║██╔════╝
     ██║   ███████║██████╔╝███████╗██║██║   ██║███████╗
     ██║   ██╔══██║██╔══██╗╚════██║██║██║   ██║╚════██║
     ██║   ██║  ██║██║  ██║███████║██║╚██████╔╝███████║
     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚══════╝

EOF
}

# ─── Require Node.js ──────────────────────────────────────────────────────────
check_node() {
  if ! command -v node &>/dev/null; then
    err "Node.js is required but not found."
    err "Install Node.js 18+ from https://nodejs.org and re-run this installer."
    exit 1
  fi
  local ver
  ver=$(node -e "process.stdout.write(process.versions.node)")
  local major
  major=$(echo "$ver" | cut -d. -f1)
  if [[ "$major" -lt 18 ]]; then
    warn "Node.js $ver detected. Tarsius recommends Node.js 18+."
  else
    ok "Node.js $ver detected"
  fi
}

# ─── Determine install directory ─────────────────────────────────────────────
resolve_install_dir() {
  local local_bin="$HOME/.local/bin"
  if [[ -w "/usr/local/bin" ]]; then
    echo "/usr/local/bin"
  else
    mkdir -p "$local_bin"
    echo "$local_bin"
  fi
}

# ─── Add dir to PATH in shell profile ────────────────────────────────────────
ensure_in_path() {
  local dir="$1"
  if [[ ":$PATH:" == *":$dir:"* ]]; then
    return 0
  fi

  local profile=""
  if [[ -f "$HOME/.zshrc" ]]; then
    profile="$HOME/.zshrc"
  elif [[ -f "$HOME/.bashrc" ]]; then
    profile="$HOME/.bashrc"
  elif [[ -f "$HOME/.bash_profile" ]]; then
    profile="$HOME/.bash_profile"
  fi

  if [[ -n "$profile" ]]; then
    local marker='# tarsius PATH'
    if ! grep -qF "$marker" "$profile" 2>/dev/null; then
      {
        echo ""
        echo "$marker"
        echo "export PATH=\"$dir:\$PATH\""
      } >> "$profile"
      ok "Added $dir to PATH in $profile"
      warn "Reload your shell or run:  source $profile"
    else
      dim "$dir already referenced in $profile"
    fi
  else
    warn "Could not detect shell profile. Add the following line manually:"
    dim "export PATH=\"$dir:\$PATH\""
  fi
}

# ─── Resolve the source repository ───────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"

resolve_repo_root() {
  if [[ -f "$SCRIPT_DIR/bin/tarsius" ]]; then
    echo "$SCRIPT_DIR"
    return
  fi
  if [[ -f "$SCRIPT_DIR/../bin/tarsius" ]]; then
    echo "$(cd "$SCRIPT_DIR/.." && pwd)"
    return
  fi
  echo ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────
main() {
  print_banner
  echo "${BOLD}  Tarsius Installer${RESET}"
  echo "${DIM}  Behavioral Safety Layer for AI Legacy Modernization${RESET}"
  echo ""

  check_node

  local install_dir
  install_dir="$(resolve_install_dir)"
  local target="$install_dir/tarsius"

  local repo_root
  repo_root="$(resolve_repo_root)"

  if [[ -n "$repo_root" && -f "$repo_root/bin/tarsius" ]]; then
    # ── Running from inside local clone ──────────────────────────────────────
    info "Installing from local repository: $repo_root"
    chmod +x "$repo_root/bin/tarsius"
    ln -sf "$repo_root/bin/tarsius" "$target"
    ok "Linked $repo_root/bin/tarsius → $target"
  else
    # ── Running via curl (fetch complete package to ~/.tarsius) ──────────────
    info "Setting up Tarsius package in: $TARSIUS_HOME"
    if command -v git &>/dev/null; then
      if [[ -d "$TARSIUS_HOME/.git" ]]; then
        info "Updating existing Tarsius in $TARSIUS_HOME..."
        git -C "$TARSIUS_HOME" pull --quiet || true
      else
        info "Cloning Tarsius from $REPO_URL..."
        mkdir -p "$TARSIUS_HOME"
        git clone --depth 1 "$REPO_URL" "$TARSIUS_HOME" --quiet
      fi
    else
      info "Git not found; downloading archive from GitHub..."
      mkdir -p "$TARSIUS_HOME"
      curl -fsSL "$TARBALL_URL" | tar -xz -C "$TARSIUS_HOME" --strip-components=1
    fi

    chmod +x "$TARSIUS_HOME/bin/tarsius"
    ln -sf "$TARSIUS_HOME/bin/tarsius" "$target"
    ok "Installed binary → $target"

    # Pre-install dashboard dependencies if needed
    if [[ -d "$TARSIUS_HOME/dashboard" && ! -d "$TARSIUS_HOME/dashboard/node_modules" ]]; then
      info "Configuring Studio dependencies (background)..."
      (cd "$TARSIUS_HOME/dashboard" && npm install --silent --no-audit --no-fund) >/dev/null 2>&1 || true
    fi
  fi

  ensure_in_path "$install_dir"

  echo ""
  echo "${BOLD}${GREEN}  ✅ Tarsius CLI installed successfully!${RESET}"
  echo ""
  echo "  Get started:"
  echo "   ${CYAN}cd your-legacy-repo${RESET}"
  echo "   ${CYAN}tarsius init${RESET}     # bootstrap .bob/ custom modes & rules"
  echo "   ${CYAN}tarsius studio${RESET}   # launch React Triage Dashboard (localhost:8321)"
  echo "   ${CYAN}tarsius verify${RESET}   # confirm 100% Behavioral Equivalence"
  echo "   ${CYAN}tarsius status${RESET}   # inspect rule inventory & audit ledger"
  echo ""
  echo "  ${DIM}Repository: https://github.com/farhank15/Tarsius${RESET}"
  echo ""
}

main "$@"
