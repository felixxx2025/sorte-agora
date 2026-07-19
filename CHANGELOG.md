# Changelog

## [1.3.0-faseC] — 2026-07-19

### Added
- E2E 15 cenários + workflow CI Playwright com API
- Vitest no frontend; `smoke-security.sh`; FeatureFlags no health
- `docs/RUNBOOK.md` operacional (PIX, cassino, settlement, LGPD)

### Status
Maturidade ~88/100 — staging comercial ready; secrets/providers reais no ambiente alvo.

## [1.2.0-faseB] — 2026-07-19

### Added
- PixProvider sandbox + webhook `POST /webhooks/pix` (idempotente)
- Limites diários, autoexclusão, CasinoProvider demo/live
- Cron de settlement esportivo; storage KYC local; MinIO no Compose
- LGPD: export / delete / self-exclude; páginas `/terms` e `/privacy`
- Wallet com QR PIX + polling de status

### Status
Maturidade ~85/100 — staging comercial com adapters; gateway PIX real e pentest na Fase C.

## [1.1.0-faseA] — 2026-07-19

### Added
- Comissões de afiliado disparadas em depósito confirmado e settle WON
- Admin: listagem/settle de apostas pendentes + CRUD bônus na UI
- E2E sports + wallet; specs de `AffiliatesService`
- Tipografia Montserrat + Inter; KYC com upload de arquivos
- Fail-fast se `JWT_SECRET`/`ENCRYPTION_KEY` fracos em production

### Fixed
- Sports page migrada para hooks TanStack (`useSports*`)
- `AdminService.settleSportsBet` delega a `SportsService` (sem stub)
- Client Axios trata HTTP 429
- Casino `/play` exibe saldo e sessão

### Status
Maturidade ~78/100 — integração FE↔BE coerente; PIX/provider live ainda Fase B.

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
