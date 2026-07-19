# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase B — implementação)  
**Maturidade geral estimada:** ~85/100  
**Estado:** staging comercial quase — providers reais via env; ver `GO_LIVE.md`

## Fases

| Fase | Status |
|------|--------|
| 1 — Estabilização | ✅ |
| 2 — Implementação completa | ✅ |
| 3 — Fechamento | ✅ |
| A — Integração & Correção | ✅ |
| **B — Implementação (PIX/provider/LGPD)** | ✅ |
| C — Testes & go-live staging | ⏳ próxima |

## Score por módulo (pós Fase B)

| Módulo | Score | Notas |
|--------|------:|-------|
| Auth / MFA / reset | 85 | — |
| KYC | 82 | Storage local/MinIO |
| Financeiro | 88 | PixProvider + webhook + limites |
| Cassino | 80 | Demo/live adapter |
| Sports + settlement | 88 | Cron + winningSelectionId |
| VIP | 80 | — |
| Afiliados | 78 | Comissões no fluxo |
| Admin UI | 88 | — |
| LGPD / Trust | 75 | Export/delete/self-exclude |
| Infra | 78 | MinIO opcional + cron |
| Testes | 85 | 89 unit + smoke + E2E 7/7 |
| Docs | 85 | — |

## Contas seed

- `admin@sorteagora.com` / `Admin123!`
- `demo@sorteagora.com` / `User1234!`

## Portas

Postgres **5434**, Redis **6380**, API **3001**, FE **3000** (Compose **8080**; E2E **3010**; MinIO **9000**)
