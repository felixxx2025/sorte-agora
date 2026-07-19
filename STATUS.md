# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase D1 — Correção & Endurecimento)  
**Maturidade geral estimada:** ~91/100  
**Estado:** staging endurecido — MFA no login, secrets Compose sem default fraco, ThrottlerGuard global

## Fases

| Fase | Status |
|------|--------|
| 1 — Estabilização | ✅ |
| 2 — Implementação completa | ✅ |
| 3 — Fechamento inicial | ✅ |
| A — Integração & Correção | ✅ |
| B — Implementação (PIX/provider/LGPD) | ✅ |
| C — Testes & go-live staging | ✅ |
| **D1 — Correção & Endurecimento** | ✅ |
| D2 — PIX/providers reais | ⏳ |
| D3 — Padronizar & estabilizar | ⏳ |

## Score por módulo (pós Fase D1)

| Módulo | Score | Notas |
|--------|------:|-------|
| Auth / MFA / reset | 93 | MFA no login + age gate 18+ + self-exclude |
| KYC | 82 | Storage local/MinIO |
| Financeiro | 88 | Webhook + limites; payout PSP ainda D2 |
| Cassino | 80 | Demo/live adapter |
| Sports + settlement | 88 | Cron + flags |
| VIP | 80 | — |
| Afiliados | 78 | — |
| Admin UI | 88 | E2E coberto |
| LGPD / Trust | 86 | `/responsible` `/support` + export |
| Infra / CI | 90 | ESLint BE; audit critical; Next 14.2.35 |
| Testes | 90 | 95 unit BE + 5 FE + E2E 17 + smokes |
| Docs | 90 | RUNBOOK + GO_LIVE + fase-D1 |

## Contas seed

- `admin@sorteagora.com` / `Admin123!`
- `demo@sorteagora.com` / `User1234!`

## Portas

Postgres **5434**, Redis **6380**, API **3001**, FE **3000**/Compose **8080**, E2E **3010**.
