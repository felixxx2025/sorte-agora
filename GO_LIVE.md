# GO-LIVE checklist — SORTE AGORA

**Versão alvo:** pós Fase 3 (~75/100 maturidade demo-ready)  
**Não é** certificação de provedor licenciado / PIX produção.

## Obrigatório antes de staging

- [ ] `docker compose up -d postgres redis` saudáveis
- [ ] `npx prisma migrate deploy` + `npx prisma db seed`
- [ ] `cd backend && npm test` (89+ verdes)
- [ ] `./scripts/smoke-api.sh` OK
- [ ] Secrets reais: `JWT_SECRET`, `ENCRYPTION_KEY`, `DB_PASSWORD` (não defaults)
- [ ] `PIX_AUTO_CONFIRM=false` + testar `POST /webhooks/pix` com `externalId`
- [ ] `CASINO_PROVIDER_MODE=live` + `CASINO_PROVIDER_BASE_URL` configurados
- [ ] SMTP real ou fila de e-mail
- [ ] CORS_ORIGIN aponta para domínio público
- [ ] Backup: `./scripts/backup.sh` gera `backups/*.tar.gz`
- [ ] Health: `GET /api/health` → 200 com `status: ok`
- [ ] Admin consegue login e ver `/admin`
- [ ] Fluxo: register → deposit → bet/casino → withdraw pending
- [ ] LGPD: export + delete smoke no staging

## Não bloqueante (backlog)

- [ ] E2E Playwright com `E2E_API=1` no CI
- [ ] CDN / WAF / rate limit edge
- [ ] Gateway PIX produção (MercadoPago/Pagar.me) além do sandbox
- [ ] Pentest externo
- [ ] `SPORTS_AUTO_SETTLE_LOST` off em prod; usar `winningSelectionId`

## Rollback

```bash
./scripts/backup.sh
# ... incidente ...
./scripts/rollback.sh --yes
cd backend && npx prisma migrate deploy
```
