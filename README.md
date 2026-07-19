# SORTE AGORA — Plataforma de Apostas Online

## Status do Projeto (honesto)

| Campo | Valor |
|-------|-------|
| **Versão** | 1.6.0-faseD3 |
| **Fase atual** | **D3 — Padronizar & estabilizar** (fechada) |
| **Maturidade** | ~94/100 (ver `GO_LIVE.md` + `STATUS.md`) |
| **Domínio** | Apostas (cassino + esportes) — **não** rifas |
| **Última atualização** | 19 de julho de 2026 |

> Fonte de verdade: [`STATUS.md`](./STATUS.md).

## O que a Fase D3 entregou

- Gates `ENABLE_SPORTS` / `ENABLE_AFFILIATES`; assign de bônus; settle de comissões
- Swagger 1.5, not-found FE, erros Axios padronizados
- Testes: ver `docs/test-results/fase-D3.md`

## O que a Fase D2 entregou

- HttpPixProvider, payout PROCESSING/webhook, odds HTTP opcional, casino live endurecido
- Testes: `docs/test-results/fase-D2.md`

## O que a Fase D1 entregou

- MFA no login, secrets Compose, ThrottlerGuard, age gate, páginas legais, Next 14.2.35
- Testes: `docs/test-results/fase-D1.md`

## O que a Fase C entregou

- E2E, Vitest FE, security smoke, CI e2e, feature flags, RUNBOOK
- Testes: `docs/test-results/fase-C.md`

## O que a Fase B entregou

- PIX provider + webhook, limites, casino live adapter, settlement cron
- KYC storage, LGPD self-service, termos/privacidade, wallet QR
- Testes: `docs/test-results/fase-B.md`

## O que a Fase A entregou

- Comissões afiliado no depósito/settle WON; sports via hooks; admin settle + bônus
- KYC upload, casino play com saldo, Montserrat, fail-fast secrets, HTTP 429
- Testes: **86** unit + E2E **7/7** — `docs/test-results/fase-A.md`

## O que a Fase 3 entregou

- Review: HttpExceptions, placeBet sem userId no body, health 503
- Cache Redis, healthchecks Compose, backup/rollback, smoke-api
- E2E Playwright **5/5** (`E2E_PORT=3010`) + `GO_LIVE.md` + CHANGELOG honesto
- Testes: **80/80** unit + smoke OK — `docs/test-results/fase-3.md`

## O que a Fase 2 entregou

- VIP missões reais, afiliados com comissões, admin UI (`/admin`)
- Settlement de apostas, KYC submit/review, MFA na UI
- Casino demo adapter, MailService, reports financeiros reais
- Testes: **80/80** unitários — ver `docs/test-results/fase-2.md`

## O que a Fase 1 entregou

- Migrations Prisma + seed (admin, demo, VIP, jogos, evento esportivo)
- Auth: JWT global, refresh por body, logout com blacklist Redis
- Financeiro: depósito com auto-confirmação que **credita saldo**; saque atômico
- Frontend: AuthGuard, AppNav, forgot/reset password, erros inline
- Testes: **85/85** unitários + smoke API documentado em `docs/test-results/fase-1.md`

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind, Zustand, TanStack Query |
| Backend | NestJS 10, Prisma 5, Passport JWT, Swagger |
| Dados | PostgreSQL 16, Redis 7 |
| Infra local | Docker Compose (+ Jaeger/Prometheus/Grafana) |

## Quick start (dev local)

```bash
# 1) Infra
docker compose up -d postgres redis

# 2) Backend
cd backend
cp .env.example .env   # DATABASE_URL :5434 / REDIS_URL :6380
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev      # http://localhost:3001/api

# 3) Frontend (outro terminal)
cd frontend
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001/api' > .env.local
npm install
npm run dev            # http://localhost:3000
```

### Contas seed

- Admin: `admin@sorteagora.com` / `Admin123!`
- Demo: `demo@sorteagora.com` / `User1234!`

### Portas Compose

| Serviço | Porta |
|---------|------:|
| Postgres | 5434 |
| Redis | 6380 |
| API | 3001 |
| Frontend (compose) | 8080 |

## Documentação

- [`STATUS.md`](./STATUS.md) — maturidade por módulo
- [`SETUP.md`](./SETUP.md) — setup detalhado
- [`docs/test-results/fase-1.md`](./docs/test-results/fase-1.md) — testes executados
- API Swagger: http://localhost:3001/api/docs

## Roadmap

1. ~~Fase 1 — Estabilização~~ ✅
2. ~~Fase 2 — Implementação completa~~ ✅
3. ~~Fase 3 — Fechamento~~ ✅
