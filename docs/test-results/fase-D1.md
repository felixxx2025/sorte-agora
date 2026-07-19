# Resultados de teste — Fase D1 (Correção & Endurecimento)

**Data:** 19 de julho de 2026

## Escopo validado

- Auth MFA login + enableMfa com secret pendente
- Registro com `dateOfBirth` (18+)
- ThrottlerGuard global + rate limit no smoke
- Compose secrets obrigatórios
- Páginas `/responsible` e `/support`
- Next 14.2.35; ESLint backend sem errors
- Security CI: `npm audit --audit-level=critical`
- Unit: 95 BE + 5 FE; E2E 17; smokes OK

## Comandos

```bash
cd backend && npm test && npm run lint
cd frontend && npm test
bash scripts/smoke-api.sh
bash scripts/smoke-security.sh
cd frontend && E2E_API=1 E2E_PORT=3010 npx playwright test --project=chromium
```

## Notas

- PIX/payout real e providers live ficam na **D2**
- Audit frontend ainda pode reportar high (não critical) no Next 14.x
