# Arquitetura Técnica - SORTE AGORA

## Visão Geral da Arquitetura

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (Next.js 14 + TypeScript + TailwindCSS + shadcn/ui)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│              (Nginx/Kong + Rate Limiting + WAF)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│                  (NestJS + TypeScript)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Auth    │ │ Financial│ │  Casino  │ │  Sports  │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   VIP    │ │Affiliate │ │  Admin   │ │Notification│    │
│  │ Service  │ │ Service  │ │ Service  │ │  Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│         (Domain Services + Event Handlers + Rules)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Access Layer                      │
│              (Prisma ORM + Repository Pattern)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │    Redis     │  │   S3/MinIO   │      │
│  │ (Primary DB) │  │   (Cache)    │  │  (Storage)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Next.js App Router Structure

```
sorte-agora-frontend/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── globals.css               # Global styles
│   ├── (auth)/                    # Auth group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── mfa-setup/
│   │       └── page.tsx
│   ├── (dashboard)/              # Dashboard group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── wallet/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── (casino)/                 # Casino group
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Lobby
│   │   ├── slots/
│   │   │   └── page.tsx
│   │   ├── live/
│   │   │   └── page.tsx
│   │   └── game/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── (sports)/                 # Sports group
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Sportsbook
│   │   ├── prematch/
│   │   │   └── page.tsx
│   │   ├── live/
│   │   │   └── page.tsx
│   │   └── event/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── (vip)/                    # VIP group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── rewards/
│   │   │   └── page.tsx
│   │   ├── missions/
│   │   │   └── page.tsx
│   │   └── ranking/
│   │       └── page.tsx
│   ├── (affiliates)/             # Affiliates group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── marketing/
│   │       └── page.tsx
│   └── (admin)/                  # Admin group
│       ├── layout.tsx
│       ├── page.tsx
│       ├── users/
│       │   └── page.tsx
│       ├── financial/
│       │   └── page.tsx
│       ├── casino/
│       │   └── page.tsx
│       ├── sports/
│       │   └── page.tsx
│       └── reports/
│           └── page.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── casino/
│   │   ├── GameCard.tsx
│   │   ├── GameLobby.tsx
│   │   └── GameProvider.tsx
│   ├── sports/
│   │   ├── OddsDisplay.tsx
│   │   ├── BetSlip.tsx
│   │   └── LiveEvent.tsx
│   ├── financial/
│   │   ├── WalletCard.tsx
│   │   ├── TransactionList.tsx
│   │   └── DepositForm.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts             # API client
│   │   ├── auth.ts
│   │   ├── financial.ts
│   │   ├── casino.ts
│   │   └── sports.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   └── useGames.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── walletStore.ts
│   │   └── gameStore.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
├── public/
│   ├── images/
│   └── icons/
├── middleware.ts                 # Next.js middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### State Management Strategy

```typescript
// Zustand for global state
// lib/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (credentials) => {
        // API call
        const response = await api.auth.login(credentials);
        set({ 
          user: response.user, 
          token: response.token,
          isAuthenticated: true 
        });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      refresh: async () => {
        // Token refresh logic
      },
    }),
    { name: 'auth-storage' }
  )
);
```

### API Client Strategy

```typescript
// lib/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/lib/stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().refresh();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Backend Architecture

### NestJS Modular Structure

```
sorte-agora-backend/
├── src/
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts             # Root module
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   └── providers.config.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── user.decorator.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── rate-limit.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── cache.interceptor.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── query-validation.filter.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── interfaces/
│   │       └── pagination.interface.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── refresh.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── repositories/
│   │   │   │   └── users.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── financial/
│   │   │   ├── financial.module.ts
│   │   │   ├── financial.controller.ts
│   │   │   ├── financial.service.ts
│   │   │   ├── services/
│   │   │   │   ├── wallet.service.ts
│   │   │   │   ├── transaction.service.ts
│   │   │   │   ├── pix.service.ts
│   │   │   │   └── bonus.service.ts
│   │   │   └── dto/
│   │   │       ├── deposit.dto.ts
│   │   │       ├── withdraw.dto.ts
│   │   │       └── transfer.dto.ts
│   │   ├── casino/
│   │   │   ├── casino.module.ts
│   │   │   ├── casino.controller.ts
│   │   │   ├── casino.service.ts
│   │   │   ├── services/
│   │   │   │   ├── game.service.ts
│   │   │   │   ├── session.service.ts
│   │   │   │   └── provider.service.ts
│   │   │   └── dto/
│   │   │       ├── launch-game.dto.ts
│   │   │       └── game-bet.dto.ts
│   │   ├── sports/
│   │   │   ├── sports.module.ts
│   │   │   ├── sports.controller.ts
│   │   │   ├── sports.service.ts
│   │   │   ├── services/
│   │   │   │   ├── event.service.ts
│   │   │   │   ├── market.service.ts
│   │   │   │   ├── bet.service.ts
│   │   │   │   └── odds.service.ts
│   │   │   └── dto/
│   │   │       ├── place-bet.dto.ts
│   │   │       └── cashout.dto.ts
│   │   ├── vip/
│   │   │   ├── vip.module.ts
│   │   │   ├── vip.controller.ts
│   │   │   ├── vip.service.ts
│   │   │   ├── services/
│   │   │   │   ├── level.service.ts
│   │   │   │   ├── mission.service.ts
│   │   │   │   └── reward.service.ts
│   │   │   └── dto/
│   │   │       └── claim-reward.dto.ts
│   │   ├── affiliates/
│   │   │   ├── affiliates.module.ts
│   │   │   ├── affiliates.controller.ts
│   │   │   ├── affiliates.service.ts
│   │   │   ├── services/
│   │   │   │   ├── commission.service.ts
│   │   │   │   └── tracking.service.ts
│   │   │   └── dto/
│   │   │       └── register-affiliate.dto.ts
│   │   └── admin/
│   │       ├── admin.module.ts
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       ├── services/
│   │       │   ├── user-management.service.ts
│   │       │   ├── financial-management.service.ts
│   │       │   ├── report.service.ts
│   │       │   └── audit.service.ts
│   │       └── dto/
│   │           ├── ban-user.dto.ts
│   │           └── update-bonus.dto.ts
│   ├── database/
│   │   ├── prisma.service.ts
│   │   └── migrations/
│   └── events/
│       ├── event-emitter.service.ts
│       └── handlers/
│           ├── bet-placed.handler.ts
│           ├── deposit-completed.handler.ts
│           └── user-registered.handler.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### Event-Driven Architecture

```typescript
// events/event-emitter.service.ts
import { Injectable, EventEmitter } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

export enum Events {
  USER_REGISTERED = 'user.registered',
  DEPOSIT_COMPLETED = 'deposit.completed',
  WITHDRAWAL_REQUESTED = 'withdrawal.requested',
  BET_PLACED = 'bet.placed',
  BET_SETTLED = 'bet.settled',
  GAME_SESSION_STARTED = 'game.session.started',
  GAME_SESSION_ENDED = 'game.session.ended',
  VIP_LEVEL_CHANGED = 'vip.level.changed',
  AFFILIATE_COMMISSION_EARNED = 'affiliate.commission.earned',
}

@Injectable()
export class EventEmitterService {
  private eventEmitter = new EventEmitter();

  emit(event: Events, data: any) {
    this.eventEmitter.emit(event, data);
  }

  on(event: Events, handler: (data: any) => void) {
    this.eventEmitter.on(event, handler);
  }
}

// Example handler
@Injectable()
export class BonusService {
  @OnEvent(Events.USER_REGISTERED)
  async handleUserRegistered(payload: UserRegisteredPayload) {
    // Grant welcome bonus
  }

  @OnEvent(Events.DEPOSIT_COMPLETED)
  async handleDepositCompleted(payload: DepositCompletedPayload) {
    // Apply deposit bonus
  }
}
```

### Repository Pattern

```typescript
// modules/users/repositories/users.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async findMany(params: PaginationParams): Promise<User[]> {
    return this.prisma.user.findMany({
      skip: params.skip,
      take: params.take,
    });
  }
}
```

## Database Architecture

### PostgreSQL Schema Strategy

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Users & Authentication
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String?
  phone             String?
  firstName         String?
  lastName          String?
  dateOfBirth       DateTime?
  country           String?
  currency          String    @default("BRL")
  
  // Status
  isActive          Boolean   @default(true)
  isVerified        Boolean   @default(false)
  isKycVerified     Boolean   @default(false)
  isBanned          Boolean   @default(false)
  banReason         String?
  
  // Security
  mfaEnabled        Boolean   @default(false)
  mfaSecret         String?
  lastLoginAt       DateTime?
  lastLoginIp       String?
  passwordChangedAt DateTime?
  
  // VIP
  vipLevel          VipLevel  @relation(fields: [vipLevelId], references: [id])
  vipLevelId        String?
  vipPoints         Int       @default(0)
  
  // Affiliate
  affiliate         Affiliate?
  affiliateId       String?
  referredBy        User?     @relation("Referral", fields: [referredById], references: [id])
  referredById      String?
  referrals         User[]    @relation("Referral")
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  account           Account?
  kycRecords        KyCRecord[]
  transactions      Transaction[]
  casinoSessions    CasinoSession[]
  sportsBets        SportsBet[]
  auditLogs         AuditLog[]
  
  @@index([email])
  @@index([phone])
  @@index([isKycVerified])
  @@index([vipLevelId])
}

model Account {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  balance         Decimal  @default(0) @db.Decimal(20, 8)
  bonusBalance    Decimal  @default(0) @db.Decimal(20, 8)
  lockedBalance   Decimal  @default(0) @db.Decimal(20, 8)
  currency        String   @default("BRL")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  transactions    Transaction[]
  
  @@index([userId])
}

model KyCRecord {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  // Documents
  documentType    String   // PASSPORT, ID_CARD, DRIVING_LICENSE
  documentNumber  String
  documentFront   String   // URL to S3
  documentBack    String?  // URL to S3
  selfie          String   // URL to S3
  proofOfAddress  String?  // URL to S3
  
  // Status
  status          String   // PENDING, APPROVED, REJECTED
  reviewedBy      String?
  reviewedAt      DateTime?
  rejectionReason String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
}

// Financial
model Transaction {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  accountId       String
  account         Account  @relation(fields: [accountId], references: [id])
  
  type            String   // DEPOSIT, WITHDRAWAL, BET, WIN, BONUS, CASHBACK
  amount          Decimal  @db.Decimal(20, 8)
  fee             Decimal  @default(0) @db.Decimal(20, 8)
  
  // Payment details
  method          String?  // PIX, CREDIT_CARD, BANK_TRANSFER
  pixKey          String?
  bankCode        String?
  bankAccount     String?
  
  // Status
  status          String   // PENDING, COMPLETED, FAILED, CANCELLED
  processedAt     DateTime?
  
  // References
  referenceId     String?  // External reference
  metadata        Json?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([accountId])
  @@index([status])
  @@index([type])
  @@index([createdAt])
}

model Bonus {
  id              String   @id @default(cuid())
  name            String
  description     String?
  
  type            String   // WELCOME, DEPOSIT, RELOAD, CASHBACK, VIP
  amount          Decimal  @db.Decimal(20, 8)
  percentage      Decimal? @db.Decimal(5, 2)
  maxAmount       Decimal? @db.Decimal(20, 8)
  
  // Requirements
  minDeposit      Decimal? @db.Decimal(20, 8)
  wagerMultiplier Int      @default(1)
  maxWager        Decimal? @db.Decimal(20, 8)
  
  // Validity
  validFrom       DateTime
  validUntil      DateTime?
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([isActive])
  @@index([validFrom])
}

model UserBonus {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  bonusId         String
  bonus           Bonus    @relation(fields: [bonusId], references: [id])
  
  amount          Decimal  @db.Decimal(20, 8)
  wagerRequired   Decimal  @db.Decimal(20, 8)
  wagerCompleted  Decimal  @default(0) @db.Decimal(20, 8)
  
  status          String   // ACTIVE, COMPLETED, EXPIRED, CANCELLED
  expiresAt       DateTime
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([expiresAt])
}

// Casino
model CasinoGame {
  id              String   @id @default(cuid())
  provider        String   // NETENT, PLAYNGO, EVOLUTION, etc.
  providerGameId  String
  name            String
  category        String   // SLOTS, LIVE_CASINO, TABLE_GAMES
  
  thumbnail       String?
  description     String?
  
  // Game config
  rtp             Decimal? @db.Decimal(5, 2)
  volatility      String?  // LOW, MEDIUM, HIGH
  minBet          Decimal  @db.Decimal(20, 8)
  maxBet          Decimal  @db.Decimal(20, 8)
  
  isActive        Boolean  @default(true)
  isNew           Boolean  @default(false)
  isFeatured      Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  sessions        CasinoSession[]
  
  @@unique([provider, providerGameId])
  @@index([category])
  @@index([isActive])
  @@index([isFeatured])
}

model CasinoSession {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  gameId          String
  game            CasinoGame @relation(fields: [gameId], references: [id])
  
  sessionToken    String   @unique
  
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  
  totalBet        Decimal  @default(0) @db.Decimal(20, 8)
  totalWin        Decimal  @default(0) @db.Decimal(20, 8)
  netResult       Decimal  @default(0) @db.Decimal(20, 8)
  
  metadata        Json?
  
  @@index([userId])
  @@index([gameId])
  @@index([startedAt])
}

// Sports
model Sport {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  icon            String?
  isActive        Boolean  @default(true)
  
  events          SportsEvent[]
  
  @@index([isActive])
}

model SportsEvent {
  id              String   @id @default(cuid())
  sportId         String
  sport           Sport    @relation(fields: [sportId], references: [id])
  
  providerEventId String?
  name            String
  league          String?
  
  startTime       DateTime
  isLive          Boolean  @default(false)
  status          String   // SCHEDULED, LIVE, FINISHED, CANCELLED
  
  markets         SportsMarket[]
  bets            SportsBet[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([sportId])
  @@index([startTime])
  @@index([isLive])
  @@index([status])
}

model SportsMarket {
  id              String   @id @default(cuid())
  eventId         String
  event           SportsEvent @relation(fields: [eventId], references: [id])
  
  name            String
  marketType      String   // MONEYLINE, SPREAD, TOTAL, PROPS
  
  selections      SportsSelection[]
  
  isActive        Boolean  @default(true)
  
  @@index([eventId])
  @@index([isActive])
}

model SportsSelection {
  id              String   @id @default(cuid())
  marketId        String
  market          SportsMarket @relation(fields: [marketId], references: [id])
  
  name            String
  odds            Decimal  @db.Decimal(10, 4)
  
  bets            SportsBet[]
  
  @@index([marketId])
}

model SportsBet {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  eventId         String
  event           SportsEvent @relation(fields: [eventId], references: [id])
  
  selectionId     String
  selection       SportsSelection @relation(fields: [selectionId], references: [id])
  
  stake           Decimal  @db.Decimal(20, 8)
  odds            Decimal  @db.Decimal(10, 4)
  potentialWin    Decimal  @db.Decimal(20, 8)
  
  status          String   // PENDING, WON, LOST, VOID, CASHED_OUT
  cashoutAmount   Decimal? @db.Decimal(20, 8)
  cashoutAt       DateTime?
  
  settledAt       DateTime?
  winAmount       Decimal? @db.Decimal(20, 8)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([eventId])
  @@index([status])
  @@index([createdAt])
}

// VIP
model VipLevel {
  id              String   @id @default(cuid())
  name            String
  level           Int      @unique
  
  pointsRequired  Int
  cashbackPercent Decimal  @db.Decimal(5, 2)
  
  benefits        Json?
  
  users           User[]
  
  @@index([level])
}

model VipMission {
  id              String   @id @default(cuid())
  name            String
  description     String
  
  type            String   // DEPOSIT, BET, GAME, LOGIN
  target          Int
  reward          Int      // VIP points
  
  validFrom       DateTime
  validUntil      DateTime?
  isActive        Boolean  @default(true)
  
  @@index([isActive])
  @@index([validFrom])
}

model UserMission {
  id              String   @id @default(cuid())
  userId          String
  missionId       String
  mission         VipMission @relation(fields: [missionId], references: [id])
  
  progress        Int      @default(0)
  status          String   // ACTIVE, COMPLETED, EXPIRED
  
  completedAt     DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
}

// Affiliates
model Affiliate {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  commissionType  String   // CPA, REVENUE_SHARE, HYBRID
  commissionRate  Decimal  @db.Decimal(5, 2)
  cpaAmount       Decimal? @db.Decimal(20, 8)
  
  trackingCode    String   @unique
  balance         Decimal  @default(0) @db.Decimal(20, 8)
  
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  commissions     AffiliateCommission[]
  
  @@index([trackingCode])
  @@index([isActive])
}

model AffiliateCommission {
  id              String   @id @default(cuid())
  affiliateId     String
  affiliate       Affiliate @relation(fields: [affiliateId], references: [id])
  
  type            String   // CPA, REVENUE_SHARE
  amount          Decimal  @db.Decimal(20, 8)
  referredUserId  String
  
  status          String   // PENDING, APPROVED, PAID
  paidAt          DateTime?
  
  createdAt       DateTime @default(now())
  
  @@index([affiliateId])
  @@index([status])
  @@index([createdAt])
}

// Admin & Audit
model AuditLog {
  id              String   @id @default(cuid())
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  
  action          String
  entity          String
  entityId        String?
  
  changes         Json?
  ipAddress       String?
  userAgent       String?
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
}

model SecurityEvent {
  id              String   @id @default(cuid())
  userId          String?
  
  type            String   // FAILED_LOGIN, SUSPICIOUS_ACTIVITY, RATE_LIMIT_EXCEEDED
  severity        String   // LOW, MEDIUM, HIGH, CRITICAL
  
  description     String
  metadata        Json?
  
  ipAddress       String?
  userAgent       String?
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@index([type])
  @@index([severity])
  @@index([createdAt])
}
```

## Infrastructure Architecture

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sorte-agora-db
    environment:
      POSTGRES_USER: sorteagora
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: sorte_agora
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sorte-agora-network

  redis:
    image: redis:7-alpine
    container_name: sorte-agora-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sorte-agora-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sorte-agora-backend
    environment:
      DATABASE_URL: postgresql://sorteagora:${DB_PASSWORD}@postgres:5432/sorte_agora
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    networks:
      - sorte-agora-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sorte-agora-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - sorte-agora-network

volumes:
  postgres_data:
  redis_data:

networks:
  sorte-agora-network:
    driver: bridge
```

### Kubernetes (Production)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sorte-agora-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sorte-agora-backend
  template:
    metadata:
      labels:
        app: sorte-agora-backend
    spec:
      containers:
      - name: backend
        image: sorte-agora-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: sorte-agora-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: sorte-agora-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: sorte-agora-backend-service
spec:
  selector:
    app: sorte-agora-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

## Security Architecture

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend validates credentials
   ↓
3. Backend generates JWT access token (15min) + refresh token (7 days)
   ↓
4. Tokens stored in httpOnly cookies
   ↓
5. Every request includes access token
   ↓
6. Backend validates token
   ↓
7. If expired, use refresh token to get new access token
   ↓
8. If refresh token expired, redirect to login
```

### Rate Limiting Strategy

```typescript
// Redis-based rate limiting
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitService {
  constructor(private redis: Redis) {}

  async checkLimit(
    identifier: string,
    limit: number,
    window: number // seconds
  ): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    return current <= limit;
  }
}
```

### Encryption Strategy

```typescript
// Sensitive data encryption
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  private ivLength = 16;

  encrypt(text: string): { encrypted: string; authTag: string } {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      authTag: authTag.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  decrypt(encrypted: string, authTag: string, iv: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## Monitoring & Observability

### Metrics Collection

```typescript
// Prometheus metrics
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  recordRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route }, duration / 1000);
  }
}
```

### Distributed Tracing

```typescript
// Jaeger integration
import { Injectable } from '@nestjs/common';
import { initTracer } from 'jaeger-client';

@Injectable()
export class TracingService {
  private tracer;

  constructor() {
    const config = {
      serviceName: 'sorte-agora-backend',
      reporter: {
        agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
        agentPort: parseInt(process.env.JAEGER_AGENT_PORT) || 6831,
      },
    };
    
    this.tracer = initTracer(config);
  }

  startSpan(operationName: string) {
    return this.tracer.startSpan(operationName);
  }
}
```

## Scaling Strategy

### Horizontal Scaling

- **Stateless services**: All backend services designed to be stateless
- **Session storage**: Redis for session data
- **Load balancing**: Nginx/Kong for API gateway
- **Auto-scaling**: Kubernetes HPA based on CPU/memory/custom metrics

### Database Scaling

- **Read replicas**: Multiple PostgreSQL read replicas
- **Connection pooling**: PgBouncer for connection management
- **Caching**: Redis for frequently accessed data
- **Future**: Database sharding for user data partitioning

### CDN Strategy

- **Static assets**: Cloudflare CDN for images, CSS, JS
- **API caching**: Cloudflare Workers for API response caching
- **DDoS protection**: Cloudflare enterprise
- **Edge computing**: Cloudflare Workers for edge logic

## Disaster Recovery

### Backup Strategy

- **Database backups**: Daily full backups + hourly WAL archives
- **Redis backups**: RDB snapshots every 5 minutes
- **S3 backups**: Cross-region replication
- **Retention**: 30 days for daily, 90 days for weekly

### Recovery Strategy

- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 5 minutes
- **Failover**: Automated failover to standby region
- **Testing**: Monthly disaster recovery drills
