# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase 3 concluída)  
**Maturidade geral estimada:** ~75/100  
**Estado:** demo/staging ready — checklist em `GO_LIVE.md`

## Fases

| Fase | Status |
|------|--------|
| 1 — Estabilização | ✅ |
| 2 — Implementação completa | ✅ |
| 3 — Fechamento (testes, review, harden, docs) | ✅ |

## Score por módulo (pós F3)

| Módulo | Score | Notas |
|--------|------:|-------|
| Auth / MFA / reset | 85 | MailService + blacklist |
| KYC | 70 | Demo storage |
| Financeiro | 75 | PIX auto-confirm sandbox |
| Cassino | 75 | Demo + cache Redis |
| Sports + settlement | 80 | userId via JWT |
| VIP | 80 | Missões + progresso |
| Afiliados | 75 | Comissões |
| Admin UI | 80 | Reports reais |
| Infra / backup | 70 | Scripts alinhados + healthchecks |
| Testes | 80 | 80 unit + smoke OK + E2E 5/5 |
| Docs | 85 | STATUS / GO_LIVE / CHANGELOG |

## Contas seed

- `admin@sorteagora.com` / `Admin123!`
- `demo@sorteagora.com` / `User1234!`

## Portas

Postgres **5434**, Redis **6380**, API **3001**, FE **3000** (Compose **8080**; E2E default **3010**)
