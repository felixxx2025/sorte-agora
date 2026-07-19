# RUNBOOK — SORTE AGORA (Fase C)

Operação de staging/incidente. Não substitui playbooks de provedor licenciado.

## Saúde

```bash
curl -s http://localhost:3001/api/health | jq .
./scripts/smoke-api.sh
./scripts/smoke-security.sh
```

Health inclui `features` (flags + modo cassino/PIX).

## Backup / rollback

```bash
./scripts/backup.sh
# incidente…
./scripts/rollback.sh --yes
cd backend && npx prisma migrate deploy
```

Cron sugerido (staging): `0 3 * * * /path/to/scripts/backup.sh`

## PIX

| Sintoma | Ação |
|---------|------|
| Depósito fica PENDING | Verificar `PIX_AUTO_CONFIRM` e webhook `POST /api/webhooks/pix` com `externalId` |
| Webhook 401 | Conferir `PIX_WEBHOOK_SECRET` vs header `x-webhook-secret` |
| Webhook 404 | `externalId` não existe — depósito não criado |
| Duplo crédito | `confirmByExternalId` é idempotente se já COMPLETED |

Simular webhook:

```bash
curl -X POST http://localhost:3001/api/webhooks/pix \
  -H 'Content-Type: application/json' \
  -d '{"externalId":"pix_xxx","status":"PAID"}'
```

## Cassino provider down

1. `CASINO_PROVIDER_MODE=demo` (fallback local `/casino/play`)
2. Reiniciar backend
3. Verificar `CASINO_PROVIDER_BASE_URL` e assinatura HMAC se live

## Sports settlement

- Cron a cada minuto (`SPORTS_SETTLEMENT_CRON=false` para desligar)
- Com `winningSelectionId` no evento → WON/LOST automático
- Sem vencedor: só marca evento FINISHED (ou LOST se `SPORTS_AUTO_SETTLE_LOST=true` — **não** usar em prod)

## Conta / LGPD

- Export: `GET /api/users/me/export`
- Delete: `DELETE /api/users/me` (anonimiza)
- Autoexclusão: `POST /api/users/me/self-exclude` `{ "days": 30 }`

## Feature flags

`ENABLE_CASINO`, `ENABLE_SPORTS`, `ENABLE_VIP`, `ENABLE_AFFILIATES`, `ENABLE_LGPD`  
(`false` / `0` desliga; default ligado)

## Escalation

1. Capturar `/api/health` + logs Nest
2. Backup imediato
3. Rollback DB se migração recente
4. Desligar flags de money path se necessário (`PIX_AUTO_CONFIRM=false` já é o seguro)
