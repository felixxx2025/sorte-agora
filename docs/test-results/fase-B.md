# Resultados de teste — Fase B (Implementação)

**Data:** 19 de julho de 2026

## Unitários backend

| Resultado | Valor |
|-----------|------:|
| Suites | 18 passed |
| Tests | **89 passed** |
| Build | OK |

Novos: `SandboxPixProvider`, storage KYC, LGPD, casino provider DI, settlement cron.

## Smoke API

`./scripts/smoke-api.sh` → **SMOKE OK** (inclui LGPD export + webhook PIX)

## E2E Playwright

`E2E_API=1 E2E_PORT=3010` → **7 passed**

## Entregas

- [x] PixProvider sandbox + `POST /webhooks/pix` idempotente
- [x] Limites diários depósito/saque + autoexclusão
- [x] CasinoProvider demo/live via `CASINO_PROVIDER_MODE`
- [x] Cron settlement sports (`winningSelectionId` ou `SPORTS_AUTO_SETTLE_LOST`)
- [x] Storage local KYC + MinIO no Compose
- [x] LGPD export/delete/self-exclude
- [x] `/terms` + `/privacy` + wallet QR/polling
