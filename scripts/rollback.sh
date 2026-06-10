#!/bin/bash

# Script de Rollback - SORTE AGORA
# Uso: ./scripts/rollback.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "Iniciando rollback..."

# Verificar se há backup
BACKUP_DIR="./backups"
if [ ! -d "$BACKUP_DIR" ]; then
    log_error "Diretório de backups não encontrado"
    exit 1
fi

# Listar backups disponíveis
log_info "Backups disponíveis:"
ls -lt "$BACKUP_DIR" | head -10

# Selecionar backup mais recente
LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -1)
BACKUP_PATH="$BACKUP_DIR/$LATEST_BACKUP/backup.sql"

if [ ! -f "$BACKUP_PATH" ]; then
    log_error "Backup não encontrado: $BACKUP_PATH"
    exit 1
fi

log_info "Usando backup: $BACKUP_PATH"

# Confirmar
read -p "Deseja continuar com o rollback? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Rollback cancelado"
    exit 0
fi

# Parar containers
log_info "Parando containers..."
docker-compose down

# Iniciar apenas banco de dados
log_info "Iniciando banco de dados..."
docker-compose up -d postgres redis

# Esperar banco estar pronto
log_info "Aguardando banco de dados..."
sleep 10

# Restaurar backup
log_info "Restaurando backup..."
docker-compose exec -T postgres psql -U sorteagora sorte_agora < "$BACKUP_PATH"

# Reiniciar todos os containers
log_info "Reiniciando containers..."
docker-compose up -d

# Executar migrations
log_info "Executando migrations..."
docker-compose exec backend npx prisma migrate deploy

# Verificar health check
log_info "Verificando health check..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        log_info "Health check passou!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log_warn "Health check falhou, tentando novamente ($RETRY_COUNT/$MAX_RETRIES)..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_error "Health check falhou após $MAX_RETRIES tentativas"
    docker-compose logs backend
    exit 1
fi

log_info "Rollback concluído com sucesso!"
