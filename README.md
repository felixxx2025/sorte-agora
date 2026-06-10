# SORTE AGORA - Plataforma de Apostas Online Enterprise

## Visão Geral
Plataforma de apostas online profissional, escalável nacional e internacionalmente, com padrão enterprise e pronta para integração com provedores licenciados.

## Status do Projeto
- **Versão**: 1.0.0
- **Status**: ✅ COMPLETO E PRONTO PARA PRODUÇÃO
- **Pontuação Enterprise Audit**: 92/100
- **Última Atualização**: 1 de Junho de 2026

## Stack Tecnológica

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Formulários**: React Hook Form + Zod
- **Autenticação**: JWT (Backend)
- **Ícones**: Lucide React
- **Testes**: Playwright (E2E)

### Backend
- **Framework**: NestJS
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Validação**: class-validator
- **Documentação**: Swagger/OpenAPI
- **Autenticação**: JWT + Passport
- **Testes**: Jest + Supertest

### Banco de Dados
- **Primário**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: Prisma

### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Orquestração**: Kubernetes (production-ready)
- **CI/CD**: GitHub Actions
- **Cloud**: AWS (multi-region ready)
- **CDN**: Cloudflare
- **Monitoramento**: Prometheus + Grafana
- **Logs**: Winston (estruturado)
- **Tracing**: OpenTelemetry + Jaeger
- **Error Tracking**: Sentry

### Segurança
- **Autenticação**: JWT com refresh tokens
- **Rate Limiting**: @nestjs/throttler
- **Validação**: class-validator + sanitização XSS
- **Security Headers**: Helmet
- **LGPD**: Compliance documentado

## Arquitetura

### Frontend Architecture
```
frontend/
├── app/
│   ├── (auth)/          # Login, Registro
│   ├── dashboard/       # Dashboard principal
│   ├── casino/          # Jogos de casino
│   ├── sports/          # Apostas esportivas
│   ├── vip/             # Programa VIP
│   ├── wallet/          # Carteira
│   └── profile/         # Perfil do usuário
├── components/
│   └── ui/              # Componentes shadcn/ui
├── lib/
│   ├── api/             # Clientes API
│   ├── hooks/           # Hooks customizados
│   ├── stores/          # Zustand stores
│   └── utils.ts         # Utilitários
├── e2e/                 # Testes E2E (Playwright)
└── public/              # Arquivos estáticos
```

### Backend Architecture
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/        # Autenticação (JWT, MFA, KYC)
│   │   ├── users/       # Gestão de usuários
│   │   ├── financial/   # Financeiro (PIX, transações)
│   │   ├── casino/      # Jogos de casino
│   │   ├── sports/      # Apostas esportivas
│   │   ├── vip/         # Programa VIP
│   │   ├── affiliates/  # Programa de afiliados
│   │   ├── admin/       # Painel administrativo
│   │   └── audit/       # Logs de auditoria
│   ├── common/
│   │   ├── decorators/  # Decoradores customizados
│   │   ├── filters/     # Filtros de exceção
│   │   ├── guards/      # Guards de autenticação
│   │   ├── interceptors/# Interceptors (logging, transform)
│   │   ├── metrics/     # Prometheus metrics
│   │   ├── pipes/       # Pipes customizados
│   │   ├── sentry/      # Sentry error tracking
│   │   └── services/    # Serviços compartilhados
│   ├── database/        # Configuração Prisma e Redis
│   ├── app.module.ts    # Módulo raiz
│   ├── main.ts          # Bootstrap
│   └── tracing.ts       # OpenTelemetry
├── prisma/
│   └── schema.prisma    # Schema do banco (13 modelos)
└── test/                # Testes unitários (Jest)
```

### Microservices Architecture (Future)
```
API Gateway (Kong/Nginx)
├── Auth Service
├── User Service
├── Financial Service
├── Casino Service
├── Sports Service
├── VIP Service
├── Affiliate Service
├── Notification Service
└── Analytics Service
```

## Estrutura de Banco de Dados

### Tabelas Principais (13 Modelos)
- **users**: Usuários e perfis
- **accounts**: Contas e carteiras
- **kyc_records**: Verificação de identidade
- **transactions**: Transações financeiras
- **casino_games**: Catálogo de jogos
- **casino_sessions**: Sessões de jogos
- **sports_events**: Eventos esportivos
- **sports_markets**: Mercados de apostas
- **sports_selections**: Seleções de apostas
- **sports_bets**: Apostas esportivas
- **vip_levels**: Níveis VIP
- **affiliates**: Afiliados
- **bonuses**: Bônus e promoções
- **audit_logs**: Logs de auditoria

## Requisitos Funcionais - Status de Implementação

### Módulo de Usuários ✅
- [x] Cadastro com validação
- [x] Login tradicional (JWT)
- [x] MFA (TOTP)
- [x] Recuperação de senha
- [x] KYC (documento, selfie)
- [x] Perfis de usuário
- [x] Gerenciamento de sessões

### Módulo Financeiro ✅
- [x] Integração PIX
- [x] Carteira multi-moeda
- [x] Depósitos
- [x] Saques
- [x] Sistema de bônus
- [x] Histórico de transações

### Módulo Cassino ✅
- [x] Lobby de jogos
- [x] Integração com provedores
- [x] Lançamento de jogos
- [x] Histórico de sessões
- [x] Múltiplos provedores

### Módulo Esportivo ✅
- [x] Eventos esportivos
- [x] Odds em tempo real
- [x] Realização de apostas
- [x] Histórico de apostas
- [x] Múltiplos esportes

### Módulo VIP ✅
- [x] Sistema de níveis
- [x] Pontuação por atividade
- [x] Missões diárias/semanais
- [x] Cashback progressivo

### Módulo Afiliados ✅
- [x] Registro de afiliados
- [x] Código de tracking
- [x] Dashboard de comissões
- [x] Relatórios de performance

### Módulo Administrativo ✅
- [x] Gestão de usuários
- [x] Gestão financeira
- [x] Aprovação de saques
- [x] Gestão de bônus
- [x] Auditoria completa

## Requisitos Não Funcionais - Status de Implementação

### Performance ✅
- [x] Cache com Redis
- [x] Índices otimizados no banco
- [x] Health checks configurados
- [x] Métricas Prometheus

### Segurança ✅
- [x] Autenticação JWT
- [x] Rate limiting
- [x] Validação de inputs
- [x] Sanitização XSS
- [x] Security headers (Helmet)
- [x] Logs de auditoria

### Escalabilidade ✅
- [x] Docker containerização
- [x] Kubernetes manifests prontos
- [x] Horizontal Pod Autoscaler
- [x] Load balancing

### Observabilidade ✅
- [x] Tracing distribuído (OpenTelemetry + Jaeger)
- [x] Métricas (Prometheus + Grafana)
- [x] Error tracking (Sentry)
- [x] Logging estruturado (Winston)
- [x] Health checks

## Roadmap - Status de Implementação

### FASE 1 - Descoberta e Planejamento ✅
- [x] Definir arquitetura completa
- [x] Definir stack tecnológica
- [x] Definir estrutura de banco de dados
- [x] Definir infraestrutura
- [x] Definir requisitos funcionais e não funcionais

### FASE 2 - Design do Produto ✅
- [x] Criar design system (shadcn/ui)
- [x] Criar wireframes (documentados)
- [x] Criar UX/UI completa

### FASE 3 - Arquitetura ✅
- [x] Setup frontend Next.js
- [x] Setup backend NestJS
- [x] Configurar PostgreSQL
- [x] Configurar Redis
- [x] Setup Docker
- [x] Configurar Prisma

### FASE 4 - Implementação ✅
- [x] Módulo de Autenticação
- [x] Módulo de Usuários
- [x] Módulo Financeiro
- [x] Módulo Cassino
- [x] Módulo Esportivo
- [x] Módulo VIP
- [x] Módulo Afiliados
- [x] Módulo Administrativo
- [x] Módulo de Auditoria

### FASE 5 - Segurança ✅
- [x] OWASP Top 10 compliance
- [x] LGPD compliance documentado
- [x] Rate Limiting
- [x] Auditoria completa
- [x] Logs estruturados

### FASE 6 - DevOps ✅
- [x] Docker completo
- [x] CI/CD pipeline (GitHub Actions)
- [x] Observabilidade (OpenTelemetry, Prometheus, Grafana, Sentry)
- [x] Scripts de backup e rollback
- [x] Kubernetes manifests

### FASE 7 - Qualidade ✅
- [x] Testes unitários (Jest)
- [x] Testes E2E (Playwright)
- [x] Security scan (GitHub Actions)

### FASE 8 - Entrega ✅
- [x] Código completo
- [x] Ambiente local funcional
- [x] Documentação completa
- [x] APIs documentadas (Swagger)
- [x] Guia de deployment
- [x] Guia para desenvolvedores

## Documentação

### Documentação Principal
- [SETUP.md](./SETUP.md) - Guia de setup inicial
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guia de deployment completo
- [DEVELOPER_SETUP_GUIDE.md](./DEVELOPER_SETUP_GUIDE.md) - Guia para desenvolvedores
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentação completa da API
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças
- [PROJECT_DELIVERY.md](./PROJECT_DELIVERY.md) - Documentação de entrega

### Auditoria e Segurança
- [AUDIT_REPORT.md](./AUDIT_REPORT.md) - Relatório de auditoria enterprise (92/100)
- [POST_AUDIT_IMPLEMENTATIONS.md](./POST_AUDIT_IMPLEMENTATIONS.md) - Implementações pós-auditoria
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Plano de segurança

### Documentação Detalhada
- [Arquitetura Detalhada](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Security Guidelines](./docs/security.md)
- [Deployment Guide](./docs/deployment.md)
- [Design System](./docs/design-system.md)
- [User Flows](./docs/user-flows.md)
- [Wireframes](./docs/wireframes.md)

## Início Rápido

### Pré-requisitos
- Node.js 20.x
- Docker e Docker Compose
- Git

### Setup Local
```bash
# Clonar repositório
git clone <repository-url>
cd windsurf-project

# Iniciar serviços com Docker Compose
docker-compose up -d

# Executar migrations
docker-compose exec backend npx prisma migrate deploy

# Acessar aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
# Swagger Docs: http://localhost:3001/api/docs
```

### Scripts Úteis
```bash
# Deployment
./scripts/deploy.sh staging

# Rollback
./scripts/rollback.sh

# Backup
./scripts/backup.sh

# Testes E2E
cd frontend && npm run test:e2e
```

## Serviços

### Desenvolvimento
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- Health Check: http://localhost:3001/api/health
- Métricas: http://localhost:3001/api/metrics
- Jaeger UI: http://localhost:16686
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## Licença
Proprietary - All rights reserved

## Compliance
- LGPD (Brasil) - Documentado
- OWASP Top 10 - Compliance implementado
- Licença de Gaming - Requerida para produção
