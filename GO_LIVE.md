# GO-LIVE checklist — SORTE AGORA

**Versão alvo:** pós Fase D2 (~93/100 maturidade staging)  
**Não é** certificação de provedor licenciado / PIX produção bancária.

## Validado em ambiente local (Fase D2)

- [x] Postgres/Redis saudáveis (Compose / local)
- [x] `npx prisma migrate deploy` + seed
- [x] `cd backend && npm test` (**102** verdes)
- [x] `./scripts/smoke-api.sh` OK (incl. payout webhook shape)
- [x] `./scripts/smoke-security.sh` OK
- [x] Health `GET /api/health` → 200 + `features.pixProviderMode`
- [x] Admin login + `/admin` (E2E)
- [x] Fluxo demo: login → deposit → sports/casino (E2E)
- [x] LGPD export (smoke)
- [x] E2E Playwright **17** (`E2E_API=1`)
- [x] Adapters: `HttpPixProvider`, payout PROCESSING, odds HTTP opcional

## Obrigatório no staging real (antes de tráfego)

- [ ] Secrets reais: `JWT_SECRET`, `ENCRYPTION_KEY`, `DB_PASSWORD` (não defaults)
- [ ] `PIX_AUTO_CONFIRM=false` + `PIX_WEBHOOK_SECRET` (+ HMAC `x-signature` se http)
- [ ] `PIX_PROVIDER_MODE=http` + `PIX_API_BASE_URL` + `PIX_ACCESS_TOKEN` (ou sandbox consciente)
- [ ] `CASINO_PROVIDER_MODE=live` + `CASINO_PROVIDER_BASE_URL` (ou demo consciente)
- [ ] SMTP real
- [ ] CORS_ORIGIN = domínio público HTTPS
- [ ] Backup cron + restore testado 1× no ambiente
- [ ] Monitoramento (Sentry/Grafana) com alertas

## Não bloqueante (pós-staging)

- [ ] Contrato PSP produção (MercadoPago/Pagar.me) mapeado no adapter HTTP
- [ ] CDN / WAF / rate limit edge
- [ ] Pentest externo
- [ ] `SPORTS_AUTO_SETTLE_LOST=false` em prod; usar `winningSelectionId`
- [ ] `SPORTS_ODDS_MODE=http` com feed pago

## Rollback

Ver [`docs/RUNBOOK.md`](./docs/RUNBOOK.md).

```bash
./scripts/backup.sh
# ... incidente ...
./scripts/rollback.sh --yes
cd backend && npx prisma migrate deploy
```
