#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# QuintaCast - bootstrap do ambiente de desenvolvimento
#
# Suporte:
#   - macOS
#   - Linux / Ubuntu
#   - WSL2
#   - Windows via Git Bash
#
# O script NÃO configura secrets automaticamente.
# ============================================================

NODE_MAJOR="24"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

info()    { printf "${CYAN}→${RESET} %s\n" "$1"; }
success() { printf "${GREEN}✓${RESET} %s\n" "$1"; }
warn()    { printf "${YELLOW}!${RESET} %s\n" "$1"; }
fail()    { printf "${RED}✗${RESET} %s\n" "$1"; exit 1; }

has() {
  command -v "$1" >/dev/null 2>&1
}

detect_os() {
  case "$(uname -s)" in
    Darwin)
      OS="macos"
      ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null; then
        OS="wsl"
      else
        OS="linux"
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*)
      OS="windows"
      ;;
    *)
      fail "Sistema não suportado automaticamente."
      ;;
  esac

  success "Sistema detectado: $OS"
}

validate_repo() {
  [[ -f package.json ]] \
    || fail "package.json não encontrado. Execute o script na raiz do projeto."

  success "Repositório QuintaCast detectado"
}

install_base_linux() {
  if ! has apt-get; then
    warn "apt-get não disponível. Instale Git e Curl manualmente."
    return
  fi

  local packages=()

  has git  || packages+=("git")
  has curl || packages+=("curl")

  if (( ${#packages[@]} > 0 )); then
    info "Instalando ferramentas básicas..."

    if has sudo; then
      sudo apt-get update
      sudo apt-get install -y "${packages[@]}" ca-certificates
    else
      apt-get update
      apt-get install -y "${packages[@]}" ca-certificates
    fi
  fi
}

install_base_macos() {
  if ! xcode-select -p >/dev/null 2>&1; then
    warn "As Apple Command Line Tools precisam ser instaladas."
    xcode-select --install || true

    printf "\n"
    warn "Conclua a instalação e execute ./install.sh novamente."
    exit 0
  fi
}

install_base_windows() {
  has git || fail "Git não encontrado. Execute este script pelo Git Bash."

  if ! has curl; then
    fail "Curl não encontrado."
  fi
}

install_base_tools() {
  info "Verificando ferramentas básicas..."

  case "$OS" in
    linux|wsl)
      install_base_linux
      ;;
    macos)
      install_base_macos
      ;;
    windows)
      install_base_windows
      ;;
  esac

  has git  || fail "Git não encontrado."
  has curl || fail "Curl não encontrado."

  success "$(git --version)"
}

node_major() {
  node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0
}

install_node_unix() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "$NVM_DIR/nvm.sh"
  else
    info "Instalando NVM..."

    curl -fsSL \
      https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh \
      | bash

    # shellcheck disable=SC1090
    source "$NVM_DIR/nvm.sh"
  fi

  info "Instalando Node.js ${NODE_MAJOR}..."
  nvm install "$NODE_MAJOR"
  nvm use "$NODE_MAJOR"
  nvm alias default "$NODE_MAJOR" >/dev/null

  success "Node $(node --version)"
  success "npm $(npm --version)"
}

install_node_windows() {
  if has node && [[ "$(node_major)" -ge "$NODE_MAJOR" ]]; then
    success "Node $(node --version)"
    success "npm $(npm --version)"
    return
  fi

  if has winget; then
    info "Instalando Node.js LTS pelo winget..."
    winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements

    warn "O Node foi instalado."
    warn "Feche o Git Bash, abra novamente e execute ./install.sh outra vez."
    exit 0
  fi

  fail "Node.js ${NODE_MAJOR}+ não encontrado e winget não está disponível. Instale Node.js LTS e execute novamente."
}

ensure_node() {
  if [[ "$OS" == "windows" ]]; then
    install_node_windows
    return
  fi

  if has node && [[ "$(node_major)" -ge "$NODE_MAJOR" ]]; then
    success "Node $(node --version)"
    success "npm $(npm --version)"
    return
  fi

  install_node_unix
}

install_dependencies() {
  info "Instalando dependências do projeto..."

  if [[ -f package-lock.json ]]; then
    npm ci
  else
    warn "package-lock.json não encontrado; usando npm install."
    npm install
  fi

  success "Dependências instaladas"
}

validate_tools() {
  info "Validando ferramentas..."

  npx vite --version
  npx wrangler --version

  success "Vite OK"
  success "Wrangler OK"
}

run_build() {
  info "Executando build de validação..."

  npm run build

  [[ -d dist ]] \
    || fail "O build terminou, mas a pasta dist não foi encontrada."

  success "Build OK"
}

check_secrets() {
  if [[ -f .dev.vars ]]; then
    success ".dev.vars encontrado"
  else
    warn ".dev.vars não encontrado."
    printf "\n"
    printf "Para testar o envio de e-mail localmente, crie:\n\n"
    printf "  .dev.vars\n\n"
    printf "com:\n\n"
    printf '  RESEND_API_KEY="re_xxxxxxxxxxxxxxxxx"\n\n'
    printf "Nunca versione esse arquivo.\n"
  fi
}

check_cloudflare() {
  printf "\n"
  info "Verificando autenticação do Cloudflare..."

  if npx wrangler whoami >/dev/null 2>&1; then
    success "Wrangler autenticado"
  else
    warn "Wrangler ainda não está autenticado."
    printf "\n"
    printf "Quando precisar administrar secrets ou deploy manual:\n\n"
    printf "  npx wrangler login\n"
  fi
}

finish() {
  printf "\n"
  printf "${GREEN}============================================================${RESET}\n"
  printf "${GREEN} QuintaCast pronto para desenvolvimento.${RESET}\n"
  printf "${GREEN}============================================================${RESET}\n\n"

  printf "Frontend:\n"
  printf "  npm run dev\n\n"

  printf "Worker completo:\n"
  printf "  npm run build\n"
  printf "  npx wrangler dev\n\n"

  printf "Worker DEV:\n"
  printf "  npm run build\n"
  printf "  npx wrangler dev --env dev\n\n"

  printf "Autenticar Cloudflare:\n"
  printf "  npx wrangler login\n\n"

  printf "Secret Resend DEV:\n"
  printf "  npx wrangler secret put RESEND_API_KEY --env dev\n\n"

  printf "Secret Resend PROD:\n"
  printf "  npx wrangler secret put RESEND_API_KEY\n\n"

  printf "Quinta-feira é dia de postinho. 🤘\n"
}

main() {
  printf "\n"
  printf "QuintaCast — instalação do ambiente\n"
  printf "==================================\n\n"

  detect_os
  validate_repo
  install_base_tools
  ensure_node
  install_dependencies
  validate_tools
  run_build
  check_secrets
  check_cloudflare
  finish
}

main "$@"
