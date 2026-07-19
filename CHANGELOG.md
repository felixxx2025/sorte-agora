# Changelog

## [1.6.0-faseD3] — 2026-07-19

### Added
- Gates `ENABLE_SPORTS` / `ENABLE_AFFILIATES` nos controllers
- Admin: `POST /bonuses/:id/assign` e liquidação de comissões afiliado
- Página `not-found` no frontend; status `PROCESSING` tipado

### Changed
- Swagger versão 1.5 + tags webhooks/lgpd
- Client Axios unwrap de `message`/`details` em erros
- README / GO_LIVE / RUNBOOK alinhados a STATUS (~94%)

### Status
Maturidade ~94/100 — padronização e estabilidade; PSP contrato real permanece pós-staging.

## [1.5.0-faseD2] — 2026-07-19

### Added
- `HttpPixProvider` (`PIX_PROVIDER_MODE=http`) com charge/payout HTTP e HMAC webhook
- `createPayout` no fluxo de approve; status `PROCESSING` + webhook `kind=PAYOUT`
- Odds feed opcional (`SPORTS_ODDS_MODE=http` + `SPORTS_ODDS_API_URL`)
- Kill-switch `ENABLE_CASINO` no controller; live exige `CASINO_PROVIDER_BASE_URL`

### Changed
- Admin approve/reject delega a `FinancialService`
- Webhook PIX injeta `PIX_PROVIDER` (não só sandbox)
- Compose passa env de PIX/CASINO/SPORTS providers

### Status
Maturidade ~93/100 — adapters prontos; PSP real via `PIX_API_BASE_URL` + token.

## [1.4.0-faseD1] — 2026-07-19

### Added
- MFA no fluxo de login (`mfaRequired` + `POST /auth/mfa/login`)
- Age gate: `dateOfBirth` obrigatório no registro (18+)
- Páginas `/responsible` e `/support`
- ESLint backend (`.eslintrc.js`); CI audit falha em critical
- Smoke security: 429 (throttler) + shape MFA

### Fixed / Hardened
- `enableMfa` valida TOTP contra secret pendente (Redis)
- `ThrottlerGuard` + `JwtAuthGuard` como `APP_GUARD`
- Compose sem defaults JWT/ENCRYPTION fracos; `PIX_AUTO_CONFIRM` default false
- Autoexclusão / ban / inactive bloqueiam login
- Next.js 14.1.0 → 14.2.35; static `/uploads/`; Sentry em 500

### Status
Maturidade ~91/100 — endurecimento de auth/secrets; PIX/provider real na D2.

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
