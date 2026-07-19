# Resultados de teste — Fase 3

**Data:** 19 de julho de 2026

## Unitários backend

```bash
cd backend && npm test && npm run build
```

| Resultado | Valor |
|-----------|------:|
| Suites | 16 passed |
| Tests | 80 passed |
| Build | OK |

## Smoke API

```bash
chmod +x scripts/smoke-api.sh
./scripts/smoke-api.sh
```

Resultado: **SMOKE OK** (health, login, 401, balance, casino games, admin reports).

## E2E Playwright

Porta **3000** no ambiente pode estar ocupada por outro processo. Config usa `E2E_PORT` (default **3010**) e `reuseExistingServer: false`.

CORS da API aceita `localhost:3000,3010,8080` (vírgula-separado).

```bash
cd frontend
npx playwright install chromium   # se necessário

# UI only (sem login real na API):
E2E_PORT=3010 npx playwright test --project=chromium

# com API + seed:
E2E_API=1 E2E_PORT=3010 npx playwright test --project=chromium
```

| Resultado | Valor |
|-----------|------:|
| Specs | auth, casino, dashboard |
| Com `E2E_API=1` | **5 passed** |

## Security smoke

| Check | Resultado |
|-------|-----------|
| Profile sem JWT | 401 |
| Admin sem role USER | 403 (RolesGuard) |
| Logout blacklist | 401 revoked (Fase 1) |
| CORS origem E2E | `Access-Control-Allow-Origin: http://localhost:3010` |

## Correções da revisão (Fase 3)

- Admin `NotFoundException` (withdraw/KYC)
- `PlaceBetDto` sem `userId` no body
- Health HTTP 503 se DB down
- Cache Redis em `getGames` / `getEvents`
- backup/rollback alinhados
- Healthchecks Compose backend/frontend
- CORS multi-origem (dev/E2E)
- Playwright na porta 3010 (evita conflito com :3000)
