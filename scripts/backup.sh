#!/bin/bash

# Script de Backup - SORTE AGORA
# Uso: ./scripts/backup.sh

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Criar diretório de backup
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

log_info "Iniciando backup para $BACKUP_DIR..."

# Backup do banco de dados
log_info "Backup do banco de dados..."
docker-compose exec -T postgres pg_dump -U sorteagora sorte_agora > "$BACKUP_DIR/database.sql"

# Backup de volumes
log_info "Backup de volumes Docker..."
docker run --rm \
    -v windsurf-project_postgres_data:/data \
    -v "$BACKUP_DIR":/backup \
    ubuntu tar czf /backup/postgres-volume.tar.gz /data

docker run --rm \
    -v windsurf-project_redis_data:/data \
    -v "$BACKUP_DIR":/backup \
    ubuntu tar czf /backup/redis-volume.tar.gz /data

# Backup de arquivos de configuração
log_info "Backup de configurações..."
cp backend/.env "$BACKUP_DIR/backend.env"
cp frontend/.env.local "$BACKUP_DIR/frontend.env"

# Comprimir backup
log_info "Comprimindo backup..."
cd backups
tar czf "$(basename $BACKUP_DIR).tar.gz" "$(basename $BACKUP_DIR)"
cd ..

# Remover diretório temporário
rm -rf "$BACKUP_DIR"

# Manter apenas últimos 7 backups
log_info "Limpando backups antigos (mantendo últimos 7)..."
cd backups
ls -t | tail -n +8 | xargs -r rm -rf
cd ..

log_info "Backup concluído: backups/$(basename $BACKUP_DIR).tar.gz"

# Informar tamanho
BACKUP_SIZE=$(du -h "backups/$(basename $BACKUP_DIR).tar.gz" | cut -f1)
log_info "Tamanho do backup: $BACKUP_SIZE"
