# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase 2 concluída)  
**Maturidade geral estimada:** ~65/100  
**Estado:** módulos de produto usáveis ponta a ponta em modo demo/sandbox — **ainda não** produção com providers reais

## Fases

| Fase | Status |
|------|--------|
| 1 — Estabilização | ✅ |
| 2 — Implementação completa | ✅ |
| 3 — Fechamento (testes amplos, harden, go-live) | ⏳ |

## Score por módulo

| Módulo | Após F1 | Após F2 | Notas |
|--------|--------:|--------:|-------|
| Auth / MFA / reset | 75 | **85** | MailService + MFA UI |
| KYC | 10 | **70** | Submit + admin review (storage demo) |
| Financeiro | 70 | **75** | Mantido + reports reais |
| Cassino | 40 | **70** | Adapter demo → `/casino/play` |
| Sports + settlement | 40 | **75** | settle WON/LOST + payout |
| VIP missões | 30 | **80** | Models + progresso em bets |
| Afiliados | 30 | **75** | Comissões + dashboard FE |
| Admin UI | 20 | **80** | `/admin` operacional |
| Docs | 70 | **80** | STATUS + test-results F2 |

## Contas seed

| Email | Senha | Role |
|-------|-------|------|
| `admin@sorteagora.com` | `Admin123!` | ADMIN |
| `demo@sorteagora.com` | `User1234!` | USER |

## Portas locais

Postgres **5434**, Redis **6380**, API **3001**, FE **3000**

## Próximo

**Fase 3** — cobertura E2E ampliada, code review, harden infra, docs finais go-live.
