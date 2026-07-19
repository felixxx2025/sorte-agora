# GO-LIVE checklist — SORTE AGORA

**Versão alvo:** pós Fase C (~88/100 maturidade staging)  
**Não é** certificação de provedor licenciado / PIX produção bancária.

## Validado em ambiente local (Fase C)

- [x] Postgres/Redis saudáveis (Compose / local)
- [x] `npx prisma migrate deploy` + seed
- [x] `cd backend && npm test` (**94** verdes)
- [x] `./scripts/smoke-api.sh` OK
- [x] `./scripts/smoke-security.sh` OK
- [x] Health `GET /api/health` → 200 + `features`
- [x] Admin login + `/admin` (E2E)
- [x] Fluxo demo: login → deposit → sports/casino (E2E)
- [x] LGPD export (smoke)
- [x] E2E Playwright **15/15** (`E2E_API=1`)
- [x] Backup script disponível (`./scripts/backup.sh`)
- [x] CI E2E workflow adicionado (`.github/workflows/e2e.yml`)

## Obrigatório no staging real (antes de tráfego)

- [ ] Secrets reais: `JWT_SECRET`, `ENCRYPTION_KEY`, `DB_PASSWORD` (não defaults)
- [ ] `PIX_AUTO_CONFIRM=false` + webhook com `PIX_WEBHOOK_SECRET`
- [ ] `CASINO_PROVIDER_MODE=live` + URL/key do provedor (ou manter demo consciente)
- [ ] SMTP real
- [ ] CORS_ORIGIN = domínio público HTTPS
- [ ] Backup cron + restore testado 1× no ambiente
- [ ] Monitoramento (Sentry/Grafana) com alertas

## Não bloqueante (pós-staging)

- [ ] Gateway PIX produção (MercadoPago/Pagar.me) além do sandbox
- [ ] CDN / WAF / rate limit edge
- [ ] Pentest externo
- [ ] `SPORTS_AUTO_SETTLE_LOST=false` em prod; usar `winningSelectionId`

## Rollback

Ver [`docs/RUNBOOK.md`](./docs/RUNBOOK.md).

```bash
./scripts/backup.sh
# ... incidente ...
./scripts/rollback.sh --yes
cd backend && npx prisma migrate deploy
```
