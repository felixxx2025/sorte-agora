# GO-LIVE checklist — SORTE AGORA

**Versão alvo:** pós Fase 3 (~75/100 maturidade demo-ready)  
**Não é** certificação de provedor licenciado / PIX produção.

## Obrigatório antes de staging

- [ ] `docker compose up -d postgres redis` saudáveis
- [ ] `npx prisma migrate deploy` + `npx prisma db seed`
- [ ] `cd backend && npm test` (80+ verdes)
- [ ] `./scripts/smoke-api.sh` OK
- [ ] Secrets reais: `JWT_SECRET`, `ENCRYPTION_KEY`, `DB_PASSWORD` (não defaults)
- [ ] `PIX_AUTO_CONFIRM=false` se houver gateway real
- [ ] `CASINO_PROVIDER_MODE=live` + `CASINO_PROVIDER_BASE_URL` configurados
- [ ] SMTP real ou fila de e-mail
- [ ] CORS_ORIGIN aponta para domínio público
- [ ] Backup: `./scripts/backup.sh` gera `backups/*.tar.gz`
- [ ] Health: `GET /api/health` → 200 com `status: ok`
- [ ] Admin consegue login e ver `/admin`
- [ ] Fluxo: register → deposit → bet/casino → withdraw pending

## Não bloqueante (backlog)

- [ ] E2E Playwright com `E2E_API=1` no CI
- [ ] CDN / WAF / rate limit edge
- [ ] KYC com storage S3 real
- [ ] Settlement automático de odds
- [ ] LGPD export/delete self-service completo
- [ ] Pentest externo

## Rollback

```bash
./scripts/backup.sh
# ... incidente ...
./scripts/rollback.sh --yes
cd backend && npx prisma migrate deploy
```
