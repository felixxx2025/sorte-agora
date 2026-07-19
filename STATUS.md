# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase D3 — Padronizar & estabilizar)  
**Maturidade geral estimada:** ~94/100  
**Estado:** flags money-path coerentes; bônus atribuível; comissões liquidáveis; docs alinhadas

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
| D2 — PIX/providers reais | ✅ |
| **D3 — Padronizar & estabilizar** | ✅ |

## Score por módulo (pós Fase D3)

| Módulo | Score | Notas |
|--------|------:|-------|
| Auth / MFA / reset | 93 | D1 |
| KYC | 82 | — |
| Financeiro | 93 | D2 + PROCESSING tipado no FE |
| Cassino | 88 | ENABLE_CASINO |
| Sports + settlement | 92 | ENABLE_SPORTS + odds HTTP |
| VIP | 80 | — |
| Afiliados | 88 | settle PENDING→PAID |
| Admin UI | 92 | assign bônus + liquidar comissões |
| LGPD / Trust | 86 | — |
| Infra / CI | 90 | Swagger 1.5 |
| Testes | 92 | unit + E2E + smokes |
| Docs | 94 | README/STATUS/GO_LIVE alinhados |

## Contas seed

- `admin@sorteagora.com` / `Admin123!`
- `demo@sorteagora.com` / `User1234!`

## Portas

Postgres **5434**, Redis **6380**, API **3001**, FE **3000**/Compose **8080**, E2E **3010**.
