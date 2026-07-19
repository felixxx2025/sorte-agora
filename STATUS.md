# STATUS — SORTE AGORA

**Atualizado:** 19 de julho de 2026 (Fase 1 concluída)  
**Maturidade geral estimada:** ~45/100 (antes ~30/100)  
**Estado:** estabilizado para desenvolvimento — **não** pronto para produção real

## Veredito

Plataforma de **apostas online** (cassino + esportes). A Fase 1 fechou fundação de dados, auth/financeiro críticos, wiring de módulos, UI mínima estável e testes executados. Integrações reais (PIX gateway, providers, e-mail) ficam para a Fase 2.

## Score por módulo

| Módulo | Antes | Após Fase 1 | Notas |
|--------|------:|------------:|-------|
| Auth JWT / refresh / logout | 40 | **75** | Guards, blacklist Redis, refresh por body |
| Forgot / reset password | 30 | **70** | API + páginas FE; e-mail ainda via log/dev token |
| Financeiro depósito | 15 | **70** | Auto-confirm credita saldo (`PIX_AUTO_CONFIRM`) |
| Financeiro saque | 40 | **65** | Atômico; approve/reject admin já existia |
| Prisma / migrations / seed | 0 | **80** | `migrate` + seed (VIP, jogos, eventos, users) |
| Frontend auth/wallet UX | 25 | **55** | AuthGuard, AppNav, erros inline, forgot/reset |
| Cassino / Sports | 35 | **40** | Seed + UI estável; providers ainda stub |
| VIP / Afiliados / Admin UI | 25 | **30** | Sem mudança de produto profunda |
| Observabilidade | 25 | **35** | CommonModule + Sentry wired; Compose stack |
| Docs honestas | 20 | **70** | README/STATUS alinhados ao código |

## Contas seed

| Email | Senha | Role |
|-------|-------|------|
| `admin@sorteagora.com` | `Admin123!` | ADMIN |
| `demo@sorteagora.com` | `User1234!` | USER |

## Portas locais (Compose)

| Serviço | Porta host |
|---------|------------|
| Postgres | **5434** |
| Redis | **6380** |
| Backend API | 3001 |
| Frontend | 8080 (Compose) / 3000 (dev) |

## Próximo

Executar **Fase 2** do plano (implementação completa de módulos, UX/UI, integrações).
