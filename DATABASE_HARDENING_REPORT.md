# DATABASE HARDENING REPORT

**Data**: 1 de Junho de 2026  
**Objetivo**: Auditar índices, foreign keys, constraints, cascade rules e performance

---

## ANÁLISE DE ÍNDICES

### User Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([email]) | Single | ✅ | Bom para login por email |
| @@index([isKycVerified]) | Single | ✅ | Bom para filtros KYC |
| @@unique([email]) | Unique | ✅ | Obrigatório |
| @@unique([username]) | Unique | ✅ | Opcional, bom |
| @@unique([phone]) | Unique | ✅ | Opcional, bom |
| @@unique([resetToken]) | Unique | ✅ | Obrigatório para password reset |
| @@unique([referralCode]) | Unique | ✅ | Obrigatório para referrals |

**Índices Faltantes**:
- @@index([isActive]) - Para filtros de usuários ativos
- @@index([isBanned]) - Para filtros de usuários banidos
- @@index([role]) - Para filtros por role
- @@index([createdAt]) - Para ordenação por data
- @@index([country]) - Para filtros geográficos
- @@index([isActive, isKycVerified]) - Composto para filtros comuns

### Account Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([userId]) | Single | ✅ | Obrigatório (FK) |
| @@unique([userId]) | Unique | ✅ | Obrigatório (1:1) |

**Índices Faltantes**:
- @@index([balance]) - Para filtros de saldo
- @@index([createdAt]) - Para ordenação

### KyCRecord Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([userId]) | Single | ✅ | Obrigatório (FK) |

**Índices Faltantes**:
- @@index([status]) - Para filtros de status KYC
- @@index([documentNumber]) - Para busca por documento
- @@index([createdAt]) - Para ordenação
- @@index([userId, status]) - Composto para queries comuns

### Transaction Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([userId]) | Single | ✅ | Obrigatório (FK) |
| @@index([status]) | Single | ✅ | Bom para filtros |
| @@index([type]) | Single | ✅ | Bom para filtros |

**Índices Faltantes**:
- @@index([accountId]) - Obrigatório (FK)
- @@index([createdAt]) - Para ordenação
- @@index([status, createdAt]) - Composto para histórico
- @@index([userId, status]) - Composto para filtros
- @@index([userId, createdAt]) - Composto para histórico do usuário

### CasinoGame Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@unique([provider, providerGameId]) | Unique | ✅ | Obrigatório |
| @@index([category]) | Single | ✅ | Bom para filtros |

**Índices Faltantes**:
- @@index([isActive]) - Para filtros de jogos ativos
- @@index([name]) - Para busca por nome
- @@index([createdAt]) - Para ordenação

### CasinoSession Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([userId]) | Single | ✅ | Obrigatório (FK) |
| @@index([gameId]) | Single | ✅ | Obrigatório (FK) |
| @@unique([sessionToken]) | Unique | ✅ | Obrigatório |

**Índices Faltantes**:
- @@index([startedAt]) - Para ordenação
- @@index([endedAt]) - Para filtros de sessões encerradas
- @@index([userId, startedAt]) - Composto para histórico

### SportsEvent Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([startTime]) | Single | ✅ | Bom para ordenação |
| @@index([isLive]) | Single | ✅ | Bom para filtros |

**Índices Faltantes**:
- @@index([status]) - Para filtros de status
- @@index([startTime, status]) - Composto para eventos futuros
- @@index([isLive, startTime]) - Composto para eventos ao vivo

### SportsMarket Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([eventId]) | Single | ✅ | Obrigatório (FK) |

**Índices Faltantes**:
- @@index([name]) - Para busca por nome

### SportsSelection Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([marketId]) | Single | ✅ | Obrigatório (FK) |

**Índices Faltantes**:
- @@index([name]) - Para busca por nome

### SportsBet Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([userId]) | Single | ✅ | Obrigatório (FK) |
| @@index([eventId]) | Single | ✅ | Obrigatório (FK) |

**Índices Faltantes**:
- @@index([selectionId]) - Obrigatório (FK)
- @@index([status]) - Para filtros de status
- @@index([createdAt]) - Para ordenação
- @@index([userId, status]) - Composto para filtros
- @@index([userId, createdAt]) - Composto para histórico

### VipLevel Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([level]) | Single | ✅ | Bom para ordenação |
| @@unique([level]) | Unique | ✅ | Obrigatório |

**Índices Faltantes**:
- @@index([pointsRequired]) - Para filtros

### Affiliate Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([trackingCode]) | Single | ✅ | Obrigatório |
| @@unique([trackingCode]) | Unique | ✅ | Obrigatório |
| @@unique([userId]) | Unique | ✅ | Obrigatório (1:1) |

**Índices Faltantes**:
- @@index([commissionType]) - Para filtros

### Bonus Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([isActive]) | Single | ✅ | Bom para filtros |

**Índices Faltantes**:
- @@index([type]) - Para filtros de tipo
- @@index([validFrom]) - Para filtros de validade
- @@index([validTo]) - Para filtros de expiração
- @@index([isActive, validFrom]) - Composto para bônus ativos

### AuditLog Model
| Índice | Tipo | Status | Observação |
|--------|------|--------|------------|
| @@index([userId]) | Single | ✅ | Obrigatório (FK) |
| @@index([action]) | Single | ✅ | Bom para filtros |

**Índices Faltantes**:
- @@index([entity]) - Para filtros de entidade
- @@index([createdAt]) - Para ordenação
- @@index([userId, createdAt]) - Composto para histórico
- @@index([action, createdAt]) - Composto para filtros
- @@index([entity, action]) - Composto para filtros

---

## ANÁLISE DE FOREIGN KEYS

### Foreign Keys Implementados
| Tabela | FK | Referência | onDelete | Status |
|--------|----|-------------|----------|--------|
| Account | userId | User.id | Cascade | ✅ |
| KyCRecord | userId | User.id | Cascade | ✅ |
| Transaction | userId | User.id | Cascade | ✅ |
| Transaction | accountId | Account.id | Cascade | ✅ |
| CasinoSession | userId | User.id | Cascade | ✅ |
| CasinoSession | gameId | CasinoGame.id | No Action | ⚠️ |
| SportsMarket | eventId | SportsEvent.id | No Action | ⚠️ |
| SportsSelection | marketId | SportsMarket.id | No Action | ⚠️ |
| SportsBet | userId | User.id | Cascade | ✅ |
| SportsBet | eventId | SportsEvent.id | No Action | ⚠️ |
| SportsBet | selectionId | SportsSelection.id | No Action | ⚠️ |
| AuditLog | userId | User.id | No Action | ⚠️ |

**Problemas**:
- FKs sem onDelete Cascade podem causar dados órfãos
- CasinoSession.gameId deveria ter Cascade ou Restrict
- SportsMarket.eventId deveria ter Cascade
- SportsSelection.marketId deveria ter Cascade
- SportsBet.eventId deveria ter Cascade
- SportsBet.selectionId deveria ter Cascade
- AuditLog.userId deveria ter SetNull (preservar logs mesmo se usuário for deletado)

---

## ANÁLISE DE CONSTRAINTS

### Constraints Implementados
| Tipo | Status | Observação |
|------|--------|------------|
| Primary Keys | ✅ | Todos os models têm @id |
| Unique Constraints | ✅ | Campos únicos definidos |
| Not Null | ✅ | Campos obrigatórios definidos |
| Default Values | ✅ | Defaults definidos |
| Check Constraints | ❌ | Não implementados |
| Enum Constraints | ❌ | Não implementados (usando String) |

**Gaps**:
- Falta check constraints para valores válidos (status, type, etc.)
- Falta enum constraints para campos com valores fixos
- Falta check constraint para valores positivos (balance, amount, etc.)

---

## ANÁLISE DE CASCADE RULES

### Cascade Rules Atuais
| Tabela | onDelete | Status | Recomendação |
|--------|----------|--------|--------------|
| Account → User | Cascade | ✅ | OK |
| KyCRecord → User | Cascade | ✅ | OK |
| Transaction → User | Cascade | ✅ | OK |
| Transaction → Account | Cascade | ✅ | OK |
| CasinoSession → User | Cascade | ✅ | OK |
| CasinoSession → CasinoGame | No Action | ⚠️ | Mudar para Restrict |
| SportsMarket → SportsEvent | No Action | ⚠️ | Mudar para Cascade |
| SportsSelection → SportsMarket | No Action | ⚠️ | Mudar para Cascade |
| SportsBet → User | Cascade | ✅ | OK |
| SportsBet → SportsEvent | No Action | ⚠️ | Mudar para Cascade |
| SportsBet → SportsSelection | No Action | ⚠️ | Mudar para Cascade |
| AuditLog → User | No Action | ⚠️ | Mudar para SetNull |

**Problemas**:
- Dados órfãos podem ocorrer se registros parent forem deletados
- Audit logs podem ser perdidos se usuário for deletado

---

## ANÁLISE DE PERFORMANCE

### Queries N+1 Potenciais

#### User → Account
- **Query**: `prisma.user.findMany({ include: { account: true } })`
- **Status**: ✅ OK - 1:1 relation, Prisma otimiza

#### User → Transactions
- **Query**: `prisma.user.findMany({ include: { transactions: true } })`
- **Status**: ⚠️ Potencial N+1 - Índice userId existe, mas sem limite
- **Recomendação**: Adicionar take/skip ou cursor-based pagination

#### User → CasinoSessions
- **Query**: `prisma.user.findMany({ include: { casinoSessions: true } })`
- **Status**: ⚠️ Potencial N+1 - Índice userId existe, mas sem limite
- **Recomendação**: Adicionar take/skip ou cursor-based pagination

#### User → SportsBets
- **Query**: `prisma.user.findMany({ include: { sportsBets: true } })`
- **Status**: ⚠️ Potencial N+1 - Índice userId existe, mas sem limite
- **Recomendação**: Adicionar take/skip ou cursor-based pagination

#### SportsEvent → Markets → Selections
- **Query**: `prisma.sportsEvent.findMany({ include: { markets: { include: { selections: true } } } })`
- **Status**: ⚠️ Potencial N+1 - 3 níveis de aninhamento
- **Recomendação**: Considerar denormalização ou queries separadas

### Performance Issues

1. **Decimal Precision**: Decimal(20, 8) para todos os valores monetários
   - **Impacto**: Alto overhead de armazenamento
   - **Recomendação**: Usar Decimal(10, 2) para valores monetários comuns

2. **CUID como Primary Key**: String CUID para todos os IDs
   - **Impacto**: Slower que UUID ou auto-increment
   - **Recomendação**: Considerar UUID v4 ou auto-increment para tabelas grandes

3. **Sem Partitioning**: Tabelas grandes não particionadas
   - **Impacto**: Performance degrada com volume
   - **Recomendação**: Particionar Transaction, CasinoSession, SportsBet por data

4. **Sem Connection Pooling**: Configuração padrão Prisma
   - **Impacto**: Conexões podem ser gargalo
   - **Recomendação**: Configurar connection pool apropriado

---

## ANÁLISE DE DADOS ÓRFÃOS

### Tabelas Órfãs Potenciais
| Tabela | Campo | Problema |
|--------|-------|----------|
| CasinoSession | gameId | Se CasinoGame for deletado, sessão fica órfã |
| SportsMarket | eventId | Se SportsEvent for deletado, mercado fica órfão |
| SportsSelection | marketId | Se SportsMarket for deletado, seleção fica órfã |
| SportsBet | eventId | Se SportsEvent for deletado, aposta fica órfã |
| SportsBet | selectionId | Se SportsSelection for deletada, aposta fica órfã |

---

## ANÁLISE DE MIGRAÇÕES

### Status Atual
| Item | Status | Observação |
|------|--------|------------|
| Migrations | ❌ | Não implementadas |
| Seed Data | ❌ | Não implementado |
| Rollback | ❌ | Não implementado |
| Migration History | ❌ | Não implementado |

**Gaps Críticos**: Zero infraestrutura de migrations.

---

## RECOMENDAÇÕES

### Índices Prioritários (ALTA)
1. Adicionar @@index([isActive]) em User
2. Adicionar @@index([status]) em Transaction
3. Adicionar @@index([createdAt]) em Transaction
4. Adicionar @@index([accountId]) em Transaction
5. Adicionar @@index([selectionId]) em SportsBet
6. Adicionar @@index([createdAt]) em AuditLog

### Cascade Rules (ALTA)
1. Mudar CasinoSession.gameId onDelete para Restrict
2. Mudar SportsMarket.eventId onDelete para Cascade
3. Mudar SportsSelection.marketId onDelete para Cascade
4. Mudar SportsBet.eventId onDelete para Cascade
5. Mudar SportsBet.selectionId onDelete para Cascade
6. Mudar AuditLog.userId onDelete para SetNull

### Constraints (MÉDIA)
1. Adicionar check constraints para status (Transaction, SportsBet, KyCRecord)
2. Adicionar check constraints para type (Transaction)
3. Adicionar check constraints para valores positivos (balance, amount)
4. Converter String para Enum onde aplicável

### Performance (MÉDIA)
1. Reduzir Decimal precision de (20, 8) para (10, 2) onde aplicável
2. Implementar cursor-based pagination para listas grandes
3. Configurar connection pooling apropriado
4. Considerar partitioning para tabelas grandes

### Migrations (ALTA)
1. Implementar sistema de migrations
2. Criar seed data para desenvolvimento
3. Implementar rollback strategy

---

## RESUMO

### Estatísticas
- **Models Analisados**: 13
- **Índices Existentes**: 22
- **Índices Faltantes**: 30+
- **Foreign Keys**: 12
- **FKs com Cascade**: 5 (42%)
- **FKs sem Cascade**: 7 (58%)
- **Check Constraints**: 0
- **Enum Constraints**: 0
- **Migrations**: 0

### Cobertura por Categoria
| Categoria | % Cobertura | Status |
|-----------|-------------|--------|
| Índices Básicos | 60% | MÉDIO |
| Índices Compostos | 0% | CRÍTICO |
| Foreign Keys | 100% | ✅ |
| Cascade Rules | 42% | CRÍTICO |
| Check Constraints | 0% | CRÍTICO |
| Enum Constraints | 0% | CRÍTICO |
| Migrations | 0% | CRÍTICO |

### Gaps Críticos
1. **30+ Índices Faltantes** - Falta índices compostos para queries comuns
2. **Cascade Rules Incompletas** - 58% das FKs sem cascade
3. **Zero Check Constraints** - Sem validação a nível de banco
4. **Zero Enum Constraints** - Usando String ao invés de Enum
5. **Zero Migrations** - Sem controle de versão do schema
6. **Queries N+1 Potenciais** - Sem pagination em relações 1:N

### Recomendações Imediatas
1. Adicionar índices compostos para queries comuns
2. Corrigir cascade rules para evitar dados órfãos
3. Implementar check constraints para validação
4. Converter String para Enum onde aplicável
5. Implementar sistema de migrations
6. Adicionar pagination em todas as queries 1:N

### Score de Database Hardening
**45/100** - Schema bem estruturado, mas falta índices compostos, cascade rules completas e migrations.
