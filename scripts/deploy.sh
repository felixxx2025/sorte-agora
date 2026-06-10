#!/bin/bash

# Script de Deployment Automatizado - SORTE AGORA
# Uso: ./scripts/deploy.sh [environment]
# Environment: staging | production

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar argumentos
if [ -z "$1" ]; then
    log_error "Environment não especificado. Uso: ./scripts/deploy.sh [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

# Validar environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Environment inválido. Use 'staging' ou 'production'"
    exit 1
fi

log_info "Iniciando deployment para $ENVIRONMENT..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker não está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose não está instalado"
    exit 1
fi

# Verificar variáveis de ambiente
if [ ! -f "backend/.env" ]; then
    log_error "backend/.env não encontrado. Copie .env.example para .env"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    log_error "frontend/.env.local não encontrado. Copie .env.local.example para .env.local"
    exit 1
fi

# Backup do banco de dados
log_info "Realizando backup do banco de dados..."
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker-compose exec -T postgres pg_dump -U sorteagora sorte_agora > "$BACKUP_DIR/backup.sql" || {
    log_warn "Backup falhou (pode ser primeira execução)"
}

if [ -f "$BACKUP_DIR/backup.sql" ] && [ -s "$BACKUP_DIR/backup.sql" ]; then
    log_info "Backup realizado em $BACKUP_DIR/backup.sql"
fi

# Build das imagens
log_info "Build das imagens Docker..."
docker-compose build

# Parar containers
log_info "Parando containers..."
docker-compose down

# Iniciar containers
log_info "Iniciando containers..."
docker-compose up -d

# Esperar banco de dados estar pronto
log_info "Aguardando banco de dados..."
sleep 10

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
    log_info "Verificando logs..."
    docker-compose logs backend
    exit 1
fi

# Executar testes E2E (apenas em staging)
if [ "$ENVIRONMENT" = "staging" ]; then
    log_info "Executando testes E2E..."
    cd frontend
    npm run test:e2e || {
        log_warn "Testes E2E falharam, mas deployment continuou"
    }
    cd ..
fi

# Verificar status dos containers
log_info "Status dos containers:"
docker-compose ps

# Mostrar logs recentes
log_info "Logs recentes:"
docker-compose logs --tail=50

log_info "Deployment para $ENVIRONMENT concluído com sucesso!"
log_info "Frontend: http://localhost:3000"
log_info "Backend API: http://localhost:3001/api"
log_info "Swagger Docs: http://localhost:3001/api/docs"
