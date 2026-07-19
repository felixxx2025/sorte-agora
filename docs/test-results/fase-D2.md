# Resultados de teste — Fase D2 (PIX/providers)

**Data:** 19 de julho de 2026

## Escopo

- `HttpPixProvider` + factory `PIX_PROVIDER_MODE`
- Payout no approve (COMPLETED / PROCESSING / FAILED)
- Webhook charge + payout
- Casino live sem BASE_URL → 503; `ENABLE_CASINO`
- Odds HTTP opcional

## Resultados

- Unit BE: **102** passed
- Build Nest: OK
- Smoke API + security: (rodar com API up)
- E2E: 17 (sem regressão esperada)

## Staging checklist

1. `PIX_PROVIDER_MODE=http` + `PIX_API_BASE_URL` + token
2. `PIX_AUTO_CONFIRM=false` + `PIX_WEBHOOK_SECRET`
3. Testar depósito PENDING → webhook PAID
4. Saque admin approve → COMPLETED ou PROCESSING → webhook PAYOUT
