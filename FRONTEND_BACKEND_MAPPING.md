# FRONTEND ↔ BACKEND MAPPING REPORT

**Data**: 1 de Junho de 2026  
**Objetivo**: Validar convergência completa entre frontend e backend

---

## BACKEND ENDPOINTS MAPPING

### Auth Module (/auth)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| POST | /auth/register | Public | RegisterDto | /register | ✅ COBERTO |
| POST | /auth/login | Public + Throttle | LoginDto | /login | ✅ COBERTO |
| GET | /auth/profile | JWT | - | /profile | ✅ COBERTO |
| POST | /auth/refresh | JWT | - | - | ⚠️ SEM TELA |
| POST | /auth/logout | JWT | - | - | ⚠️ SEM TELA |
| POST | /auth/mfa/generate | JWT | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| POST | /auth/mfa/enable | JWT | EnableMfaDto | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| POST | /auth/mfa/disable | JWT | VerifyMfaDto | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| POST | /auth/mfa/verify | JWT | VerifyMfaDto | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| POST | /auth/forgot-password | Public + Throttle | ForgotPasswordDto | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| POST | /auth/reset-password | Public | ResetPasswordDto | - | ❌ NÃO IMPLEMENTADO FRONTEND |

### Users Module (/users)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| GET | /users/profile | JWT | - | /profile | ✅ COBERTO |
| PUT | /users/profile | JWT | UpdateUserDto | /profile | ✅ COBERTO |

### Financial Module (/financial)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| GET | /financial/balance | JWT | - | /wallet | ✅ COBERTO |
| POST | /financial/deposit | JWT | DepositDto | /wallet | ✅ COBERTO |
| POST | /financial/withdraw | JWT | WithdrawDto | /wallet | ✅ COBERTO |
| GET | /financial/transactions | JWT | - | /wallet | ✅ COBERTO |

### Casino Module (/casino)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| GET | /casino/games | Public | - | /casino | ✅ COBERTO |
| GET | /casino/games/:id | JWT | - | /casino | ✅ COBERTO |
| POST | /casino/games/:id/launch | JWT | LaunchGameDto | /casino | ✅ COBERTO |
| GET | /casino/sessions | JWT | - | - | ⚠️ SEM TELA |

### Sports Module (/sports)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| GET | /sports/events | Public | - | /sports | ✅ COBERTO |
| GET | /sports/events/:id | JWT | - | /sports | ✅ COBERTO |
| POST | /sports/bets | JWT | PlaceBetDto | /sports | ✅ COBERTO |
| GET | /sports/bets | JWT | - | - | ⚠️ SEM TELA |

### VIP Module (/vip)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| GET | /vip/status | JWT | - | /vip | ✅ COBERTO |
| GET | /vip/levels | JWT | - | /vip | ✅ COBERTO |
| GET | /vip/missions | JWT | - | /vip | ✅ COBERTO |

### Admin Module (/admin)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| GET | /admin/dashboard | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| GET | /admin/users | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| PUT | /admin/users/:id/ban | JWT + Admin | BanUserDto | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| PUT | /admin/users/:id/unban | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| GET | /admin/financial/transactions | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| GET | /admin/financial/withdrawals | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| PUT | /admin/financial/withdrawals/:id/approve | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| PUT | /admin/financial/withdrawals/:id/reject | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| GET | /admin/reports | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| POST | /admin/bonuses | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| PUT | /admin/bonuses/:id | JWT + Admin | UpdateBonusDto | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| DELETE | /admin/bonuses/:id | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |

### Affiliates Module (/affiliates)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| POST | /affiliates/register | JWT | RegisterAffiliateDto | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| GET | /affiliates/dashboard | JWT | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| GET | /affiliates/commissions | JWT | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |

### Audit Module (/audit)
| Método | Endpoint | Proteção | DTO | Frontend Page | Status |
|--------|----------|----------|-----|---------------|--------|
| GET | /audit/user/:userId | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |
| GET | /audit/action/:action | JWT + Admin | - | - | ❌ NÃO IMPLEMENTADO FRONTEND |

---

## FRONTEND PAGES MAPPING

### Páginas Existentes
| Página | Rota | Endpoints Backend Utilizados | Status |
|--------|------|------------------------------|--------|
| Landing | / | - | ✅ ESTÁTICA |
| Login | /login | POST /auth/login | ✅ COBERTO |
| Register | /register | POST /auth/register | ✅ COBERTO |
| Dashboard | /dashboard | GET /auth/profile, GET /financial/balance | ✅ COBERTO |
| Casino | /casino | GET /casino/games, POST /casino/games/:id/launch | ✅ COBERTO |
| Sports | /sports | GET /sports/events, POST /sports/bets | ✅ COBERTO |
| Wallet | /wallet | GET /financial/balance, POST /financial/deposit, POST /financial/withdraw, GET /financial/transactions | ✅ COBERTO |
| VIP | /vip | GET /vip/status, GET /vip/levels, GET /vip/missions | ✅ COBERTO |
| Profile | /profile | GET /users/profile, PUT /users/profile | ✅ COBERTO |

### Páginas Faltantes
| Página | Rota | Endpoints Backend Correspondentes | Prioridade |
|--------|------|-----------------------------------|------------|
| Admin Dashboard | /admin | GET /admin/dashboard, GET /admin/users, GET /admin/financial/transactions | ALTA |
| Password Reset | /reset-password | POST /auth/reset-password | ALTA |
| MFA Setup | /mfa/setup | POST /auth/mfa/generate, POST /auth/mfa/enable | MÉDIA |
| MFA Verify | /mfa/verify | POST /auth/mfa/verify | MÉDIA |
| Forgot Password | /forgot-password | POST /auth/forgot-password | ALTA |
| Affiliate Dashboard | /affiliates | GET /affiliates/dashboard, GET /affiliates/commissions | BAIXA |
| Admin Users | /admin/users | GET /admin/users, PUT /admin/users/:id/ban, PUT /admin/users/:id/unban | ALTA |
| Admin Financial | /admin/financial | GET /admin/financial/transactions, GET /admin/financial/withdrawals | ALTA |
| Admin Bonuses | /admin/bonuses | POST /admin/bonuses, PUT /admin/bonuses/:id, DELETE /admin/bonuses/:id | MÉDIA |
| Audit Logs | /admin/audit | GET /audit/user/:userId, GET /audit/action/:action | MÉDIA |

---

## GAPS IDENTIFICADOS

### Gaps Críticos (ALTA PRIORIDADE)
1. **Password Recovery Flow** - Backend implementado, frontend não
   - Falta página /forgot-password
   - Falta página /reset-password
   - Falta integração com POST /auth/forgot-password
   - Falta integração com POST /auth/reset-password

2. **Admin Dashboard** - Backend implementado, frontend não
   - Falta página /admin
   - Falta página /admin/users
   - Falta página /admin/financial
   - 12 endpoints admin sem cobertura frontend

3. **MFA Flow** - Backend implementado, frontend não
   - Falta página /mfa/setup
   - Falta página /mfa/verify
   - 4 endpoints MFA sem cobertura frontend

### Gaps Médios (MÉDIA PRIORIDADE)
1. **Affiliate Module** - Backend implementado, frontend não
   - Falta página /affiliates
   - 3 endpoints affiliates sem cobertura frontend

2. **Casino Sessions** - Endpoint sem tela
   - GET /casino/sessions sem página correspondente

3. **Sports Bets History** - Endpoint sem tela
   - GET /sports/bets sem página correspondente

### Gaps Baixos (BAIXA PRIORIDADE)
1. **Audit Logs** - Backend implementado, frontend não
   - Falta página /admin/audit
   - 2 endpoints audit sem cobertura frontend

2. **Auth Refresh/Logout** - Endpoints sem tela explícita
   - POST /auth/refresh - usado internamente
   - POST /auth/logout - usado internamente

---

## CONTRATOS DIVERGENTES

### DTOs sem Tipagem Frontend
| DTO Backend | Status Frontend |
|-------------|-----------------|
| RegisterDto | ✅ Tipado |
| LoginDto | ✅ Tipado |
| UpdateUserDto | ✅ Tipado |
| DepositDto | ✅ Tipado |
| WithdrawDto | ✅ Tipado |
| LaunchGameDto | ✅ Tipado |
| PlaceBetDto | ✅ Tipado |
| EnableMfaDto | ❌ Não tipado |
| VerifyMfaDto | ❌ Não tipado |
| ForgotPasswordDto | ❌ Não tipado |
| ResetPasswordDto | ❌ Não tipado |
| BanUserDto | ❌ Não tipado |
| UpdateBonusDto | ❌ Não tipado |
| RegisterAffiliateDto | ❌ Não tipado |

---

## RESUMO

### Estatísticas
- **Total Endpoints Backend**: 35
- **Endpoints Cobertos Frontend**: 15 (43%)
- **Endpoints Não Cobertos**: 20 (57%)
- **Páginas Frontend**: 9
- **Páginas Faltantes**: 10
- **DTOs Tipados**: 7/14 (50%)

### Cobertura por Módulo
| Módulo | Endpoints | Cobertos | % Cobertura |
|--------|-----------|----------|-------------|
| Auth | 11 | 3 | 27% |
| Users | 2 | 2 | 100% |
| Financial | 4 | 4 | 100% |
| Casino | 4 | 3 | 75% |
| Sports | 4 | 3 | 75% |
| VIP | 3 | 3 | 100% |
| Admin | 12 | 0 | 0% |
| Affiliates | 3 | 0 | 0% |
| Audit | 2 | 0 | 0% |

### Recomendações Imediatas
1. Implementar Password Recovery Flow (ALTA)
2. Implementar Admin Dashboard (ALTA)
3. Implementar MFA Flow (MÉDIA)
4. Criar tipos TypeScript para DTOs faltantes
5. Adicionar páginas para endpoints órfãos

### Risco Residual
- **Funcional**: MÉDIO - Fluxos críticos (password recovery, admin) não implementados
- **Segurança**: BAIXO - Autenticação e autorização implementados
- **UX**: MÉDIO - Usuários não podem recuperar senha ou usar MFA
- **Admin**: ALTO - Painel admin completamente ausente

### Score de Convergência
**45/100** - Convergência parcial, gaps críticos em fluxos de recuperação de senha e admin.
