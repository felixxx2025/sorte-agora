#!/bin/bash
# Backup SORTE AGORA — Postgres via Compose
# Uso: ./scripts/backup.sh

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
STAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${STAMP}"
mkdir -p "$BACKUP_DIR"

log_info "Backup em $BACKUP_DIR"

if ! $COMPOSE ps postgres --status running 2>/dev/null | grep -q postgres; then
  log_warn "Subindo postgres..."
  $COMPOSE up -d postgres
  sleep 5
fi

log_info "Dump SQL..."
$COMPOSE exec -T postgres pg_dump -U sorteagora sorte_agora > "$BACKUP_DIR/database.sql"

if [ -f backend/.env ]; then
  cp backend/.env "$BACKUP_DIR/backend.env"
else
  log_warn "backend/.env ausente — pulando"
fi

if [ -f frontend/.env.local ]; then
  cp frontend/.env.local "$BACKUP_DIR/frontend.env"
else
  log_warn "frontend/.env.local ausente — pulando"
fi

log_info "Empacotando..."
mkdir -p backups
tar -czf "backups/${STAMP}.tar.gz" -C backups "$STAMP"
rm -rf "$BACKUP_DIR"

# Manter últimos 7
cd backups
ls -1t *.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm -f
cd ..

SIZE=$(du -h "backups/${STAMP}.tar.gz" | cut -f1)
log_info "Backup concluído: backups/${STAMP}.tar.gz ($SIZE)"
