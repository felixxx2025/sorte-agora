# Resultados de teste — Fase A (Integração & Correção)

**Data:** 19 de julho de 2026

## Unitários backend

| Resultado | Valor |
|-----------|------:|
| Suites | 17 passed |
| Tests | **86 passed** (+6 vs Fase 3) |
| Build | OK |

Novos: `affiliates.service.spec.ts`, comissão em deposit/settle WON.

## Smoke API

`./scripts/smoke-api.sh` → **SMOKE OK**

## E2E Playwright

```bash
E2E_API=1 E2E_PORT=3010 npx playwright test --project=chromium
```

| Resultado | Valor |
|-----------|------:|
| Specs | auth, casino, dashboard, sports, wallet |
| Total | **7 passed** |

## Entregas validadas

- [x] `recordCommission` em depósito confirmado e settle WON
- [x] Sports page via hooks (`useSports*`)
- [x] Admin tabs Apostas (settle) + Bônus
- [x] Admin settle delega a `SportsService`
- [x] Fail-fast secrets em production
- [x] Casino play com saldo + sessão
- [x] KYC upload de arquivos
- [x] Tipografia Inter + Montserrat
- [x] Tratamento HTTP 429 no client
