# SORTE AGORA — Plataforma de Apostas Online

## Status do Projeto (honesto)

| Campo | Valor |
|-------|-------|
| **Versão** | 1.0.0-fase2 |
| **Fase atual** | **Fase 2 — Implementação concluída** |
| **Maturidade** | ~65/100 (produto demo completo; providers reais na Fase 3) |
| **Domínio** | Apostas (cassino + esportes) — **não** rifas |
| **Última atualização** | 19 de julho de 2026 |

> Documentos antigos que afirmam “92/100 pronto para produção” estão **desatualizados**. A fonte de verdade é [`STATUS.md`](./STATUS.md).

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
3. **Fase 3** — Testes amplos, review, docs finais, go-live checklist
