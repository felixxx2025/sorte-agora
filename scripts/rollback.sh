#!/bin/bash
# Rollback SORTE AGORA a partir do último backups/*.tar.gz
# Uso: ./scripts/rollback.sh [--yes]

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE="docker compose"
BACKUP_DIR="./backups"
AUTO_YES=false
[[ "${1:-}" == "--yes" ]] && AUTO_YES=true

if [ ! -d "$BACKUP_DIR" ]; then
  log_error "Diretório backups/ não encontrado"
  exit 1
fi

LATEST=$(ls -1t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1 || true)
if [ -z "$LATEST" ]; then
  log_error "Nenhum arquivo .tar.gz em backups/"
  exit 1
fi

log_info "Backup selecionado: $LATEST"
if [ "$AUTO_YES" != true ]; then
  read -r -p "Continuar com o rollback? (y/N) " REPLY
  if [[ ! ${REPLY:-} =~ ^[Yy]$ ]]; then
    log_info "Cancelado"
    exit 0
  fi
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

tar -xzf "$LATEST" -C "$TMP"
SQL=$(find "$TMP" -name 'database.sql' | head -1)
if [ -z "$SQL" ]; then
  log_error "database.sql não encontrado no arquivo"
  exit 1
fi

log_info "Subindo postgres..."
$COMPOSE up -d postgres
sleep 8

log_info "Restaurando dump..."
$COMPOSE exec -T postgres psql -U sorteagora -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='sorte_agora' AND pid <> pg_backend_pid();" || true
$COMPOSE exec -T postgres psql -U sorteagora -d postgres -c "DROP DATABASE IF EXISTS sorte_agora;"
$COMPOSE exec -T postgres psql -U sorteagora -d postgres -c "CREATE DATABASE sorte_agora OWNER sorteagora;"
$COMPOSE exec -T postgres psql -U sorteagora sorte_agora < "$SQL"

log_info "Rollback do banco concluído. Suba o backend e rode: cd backend && npx prisma migrate deploy"
