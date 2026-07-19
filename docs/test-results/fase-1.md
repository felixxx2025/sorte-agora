# Resultados de teste — Fase 1

**Data:** 19 de julho de 2026  
**Ambiente:** Postgres `localhost:5434`, Redis `localhost:6380`, API `localhost:3001`

## Unitários (Jest)

```bash
cd backend && npm test
```

| Resultado | Valor |
|-----------|------:|
| Suites | 16 passed |
| Tests | 85 passed |
| Falhas | 0 |

Foco Fase 1 validado em: `auth.service`, `jwt.strategy`, `financial.service` (+ suite completa).

## Integração / smoke API (curl)

Fluxo executado contra API real com seed:

| Passo | Esperado | Resultado |
|-------|----------|-----------|
| `GET /api/health` | DB connected | OK |
| `POST /api/auth/login` (demo) | tokens | OK |
| `GET /api/auth/profile` + JWT | user | OK |
| `GET /api/auth/profile` sem JWT | 401 | OK |
| `POST /api/financial/deposit` 50 | status COMPLETED, saldo +50 | OK (100→150) |
| `POST /api/financial/withdraw` 20 | PENDING, lock 20 | OK (saldo 130, locked 20) |
| `POST /api/auth/forgot-password` | message + resetToken (dev) | OK |
| `POST /api/auth/refresh` | novo accessToken | OK |
| `POST /api/auth/logout` | blacklist | OK |
| Profile com token pós-logout | 401 revoked | OK |
| `GET /api/casino/games` | lista seed | OK |

## Build

```bash
cd backend && npm run build   # OK
```

## Frontend

- Páginas `/forgot-password` e `/reset-password` adicionadas
- `AuthGuard` + `AppNav` nas rotas autenticadas
- Client Axios desempacota `{ success, data }` do TransformInterceptor
- Type-check / E2E Playwright: não bloqueantes nesta fase; smoke API cobre núcleo

## Como reproduzir smoke

```bash
docker compose up -d postgres redis
cd backend && npx prisma migrate deploy && npx prisma db seed
npm run start:dev
# em outro terminal: repetir curls documentados acima com demo@sorteagora.com / User1234!
```
