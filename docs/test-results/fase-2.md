# Resultados de teste — Fase 2

**Data:** 19 de julho de 2026

## Unitários (Jest)

```bash
cd backend && npm test
```

| Resultado | Valor |
|-----------|------:|
| Suites | 16 passed |
| Tests | 80 passed |
| Falhas | 0 |

## Build

`npm run build` — OK

## Escopo validado na Fase 2

- Schema: VipMission, VipMissionProgress, AffiliateCommission, FKs, SportsBet payout/settledAt, KyC expandido
- VIP missões reais + progresso em apostas
- Afiliados dashboard/comissões
- Admin reports calculados + KYC review + settle bet
- Casino demo adapter → `/casino/play`
- Sports settlement
- MailService (SMTP ou log)
- KYC submit API
- FE: `/admin`, `/affiliates`, MFA/KYC no perfil, play demo

## Smoke sugerido

```bash
# login admin
curl -s -X POST localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@sorteagora.com","password":"Admin123!"}'

# reports
curl -s localhost:3001/api/admin/reports -H "Authorization: Bearer $TOKEN"

# VIP missions (demo user)
curl -s localhost:3001/api/vip/missions -H "Authorization: Bearer $USER_TOKEN"
```
