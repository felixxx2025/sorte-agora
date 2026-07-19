# Changelog

## [1.0.0-fase3] — 2026-07-19

### Added
- Cache Redis para listagens de cassino e eventos esportivos
- Healthchecks Docker no backend e frontend
- Scripts `backup.sh` / `rollback.sh` compatíveis + `smoke-api.sh`
- `GO_LIVE.md` checklist
- E2E Playwright revisado (Chromium; `E2E_API=1` + porta `E2E_PORT=3010`)

### Fixed
- Admin withdraw/KYC usam `NotFoundException`
- Apostas esportivas: `userId` só do JWT
- Health retorna 503 quando DB falha
- CORS multi-origem (3000/3010/8080) para FE e E2E

### Status
Maturidade ~75/100 — demo/staging ready. Providers PIX/cassino live e compliance ainda pendentes.

## [1.0.0-fase2] — 2026-07-19

VIP missões, afiliados, admin UI, KYC, MFA UI, settlement, casino demo, MailService.

## [1.0.0-fase1] — 2026-07-19

Migrations/seed, JWT+blacklist, depósito que credita, AuthGuard/AppNav, docs honestas.

## Histórico anterior

Documentos que afirmavam “92/100 produção-ready” estavam **desatualizados** em relação ao código; ver `STATUS.md`.
