# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase C — fechamento)  
**Maturidade geral estimada:** ~88/100  
**Estado:** staging comercial ready — checklist operacional em `GO_LIVE.md` + `docs/RUNBOOK.md`

## Fases

| Fase | Status |
|------|--------|
| 1 — Estabilização | ✅ |
| 2 — Implementação completa | ✅ |
| 3 — Fechamento inicial | ✅ |
| A — Integração & Correção | ✅ |
| B — Implementação (PIX/provider/LGPD) | ✅ |
| **C — Testes & go-live staging** | ✅ |

## Score por módulo (pós Fase C)

| Módulo | Score | Notas |
|--------|------:|-------|
| Auth / MFA / reset | 88 | Logout blacklist validado no smoke |
| KYC | 82 | Storage local/MinIO |
| Financeiro | 88 | Webhook + limites + smoke |
| Cassino | 80 | Demo/live adapter |
| Sports + settlement | 88 | Cron + flags |
| VIP | 80 | — |
| Afiliados | 78 | — |
| Admin UI | 88 | E2E coberto |
| LGPD / Trust | 80 | Export + security smoke |
| Infra / CI | 85 | E2E workflow + Vitest CI |
| Testes | 90 | 94 unit BE + 5 FE + E2E 15 + smokes |
| Docs | 90 | RUNBOOK + GO_LIVE |

## Contas seed

- `admin@sorteagora.com` / `Admin123!`
- `demo@sorteagora.com` / `User1234!`

## Portas

Postgres **5434**, Redis **6380**, API **3001**, FE **3000** (Compose **8080**; E2E **3010**; MinIO **9000**)
