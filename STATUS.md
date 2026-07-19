# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase D2 — PIX/providers)  
**Maturidade geral estimada:** ~93/100  
**Estado:** adapters PIX HTTP + payout; casino live exige BASE_URL; odds feed opcional

## Fases

| Fase | Status |
|------|--------|
| 1 — Estabilização | ✅ |
| 2 — Implementação completa | ✅ |
| 3 — Fechamento inicial | ✅ |
| A — Integração & Correção | ✅ |
| B — Implementação (PIX/provider/LGPD) | ✅ |
| C — Testes & go-live staging | ✅ |
| D1 — Correção & Endurecimento | ✅ |
| **D2 — PIX/providers reais** | ✅ |
| D3 — Padronizar & estabilizar | ⏳ |

## Score por módulo (pós Fase D2)

| Módulo | Score | Notas |
|--------|------:|-------|
| Auth / MFA / reset | 93 | D1 |
| KYC | 82 | Storage local/MinIO |
| Financeiro | 93 | HttpPix + payout PROCESSING/webhook |
| Cassino | 86 | live exige BASE_URL; ENABLE_CASINO |
| Sports + settlement | 90 | Odds HTTP opcional |
| VIP | 80 | — |
| Afiliados | 78 | — |
| Admin UI | 88 | Approve via FinancialService |
| LGPD / Trust | 86 | — |
| Infra / CI | 90 | Compose com env PIX/CASINO/SPORTS |
| Testes | 92 | 102 unit BE + 5 FE + E2E 17 + smokes |
| Docs | 90 | fase-D2 + GO_LIVE |

## Contas seed

- `admin@sorteagora.com` / `Admin123!`
- `demo@sorteagora.com` / `User1234!`

## Portas

Postgres **5434**, Redis **6380**, API **3001**, FE **3000**/Compose **8080**, E2E **3010**.

## PIX staging

- `PIX_PROVIDER_MODE=sandbox|http`
- `PIX_AUTO_CONFIRM=false` + `PIX_WEBHOOK_SECRET`
- Payout: approve → COMPLETED (sandbox) ou PROCESSING + webhook `kind=PAYOUT`
