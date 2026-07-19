# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase A — integração/correção)  
**Maturidade geral estimada:** ~78/100  
**Estado:** demo/staging + fluxos FE↔BE coerentes — checklist em `GO_LIVE.md`

## Fases

| Fase | Status |
|------|--------|
| 1 — Estabilização | ✅ |
| 2 — Implementação completa | ✅ |
| 3 — Fechamento (testes, review, harden, docs) | ✅ |
| **A — Integração & Correção** | ✅ |
| B — Implementação (PIX/provider/LGPD) | ⏳ próxima |
| C — Testes & go-live staging | ⏳ |

## Score por módulo (pós Fase A)

| Módulo | Score | Notas |
|--------|------:|-------|
| Auth / MFA / reset | 85 | MailService + blacklist |
| KYC | 75 | Upload real (ainda sem S3) |
| Financeiro | 78 | PIX sandbox + comissão afiliado |
| Cassino | 72 | Play com saldo/sessão demo |
| Sports + settlement | 85 | Hooks FE + admin settle UI |
| VIP | 80 | Missões + progresso |
| Afiliados | 78 | Comissões no depósito/settle WON |
| Admin UI | 88 | Apostas + bônus |
| Infra / backup | 72 | Fail-fast secrets prod |
| Testes | 82 | 86 unit + smoke + E2E 7/7 |
| Docs | 85 | STATUS / GO_LIVE / CHANGELOG |

## Contas seed

- `admin@sorteagora.com` / `Admin123!`
- `demo@sorteagora.com` / `User1234!`

## Portas

Postgres **5434**, Redis **6380**, API **3001**, FE **3000** (Compose **8080**; E2E default **3010**)
