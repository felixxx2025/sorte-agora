# Database Schema - SORTE AGORA

## Overview
Complete database schema for the SORTE AGORA platform using PostgreSQL with Prisma ORM.

## Complete Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USERS & AUTHENTICATION
// ============================================

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  username          String?   @unique
  password          String?
  phone             String?   @unique
  firstName         String?
  lastName          String?
  dateOfBirth       DateTime?
  country           String    @default("BR")
  currency          String    @default("BRL")
  
  isActive          Boolean   @default(true)
  isVerified        Boolean   @default(false)
  isKycVerified     Boolean   @default(false)
  isBanned          Boolean   @default(false)
  
  mfaEnabled        Boolean   @default(false)
  mfaSecret         String?
  lastLoginAt       DateTime?
  
  vipLevelId        String?
  vipPoints         Int       @default(0)
  
  affiliateId       String?
  referredById      String?
  referralCode      String?   @unique
  referredBy        User?     @relation("Referral", fields: [referredById], references: [id])
  referrals         User[]    @relation("Referral")
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  account           Account?
  kycRecords        KyCRecord[]
  transactions      Transaction[]
  casinoSessions    CasinoSession[]
  sportsBets        SportsBet[]
  auditLogs         AuditLog[]
  
  @@index([email])
  @@index([isKycVerified])
  @@map("users")
}

model Account {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  balance         Decimal  @default(0) @db.Decimal(20, 8)
  bonusBalance    Decimal  @default(0) @db.Decimal(20, 8)
  lockedBalance   Decimal  @default(0) @db.Decimal(20, 8)
  
  currency        String   @default("BRL")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  transactions    Transaction[]
  
  @@index([userId])
  @@map("accounts")
}

model KyCRecord {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  documentType    String
  documentNumber  String
  documentFront   String
  selfie          String
  
  status          String
  reviewedAt      DateTime?
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@map("kyc_records")
}

// ============================================
// FINANCIAL
// ============================================

model Transaction {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId       String
  account         Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  type            String
  amount          Decimal  @db.Decimal(20, 8)
  
  method          String?
  pixKey          String?
  
  status          String
  processedAt     DateTime?
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@index([status])
  @@index([type])
  @@map("transactions")
}

// ============================================
// CASINO
// ============================================

model CasinoGame {
  id              String   @id @default(cuid())
  provider        String
  providerGameId  String
  name            String
  category        String
  
  thumbnail       String
  rtp             Decimal?  @db.Decimal(5, 2)
  minBet          Decimal  @db.Decimal(20, 8)
  maxBet          Decimal  @db.Decimal(20, 8)
  
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  
  sessions        CasinoSession[]
  
  @@unique([provider, providerGameId])
  @@index([category])
  @@map("casino_games")
}

model CasinoSession {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  gameId          String
  game            CasinoGame @relation(fields: [gameId], references: [id])
  
  sessionToken    String   @unique
  
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  
  totalBet        Decimal  @default(0) @db.Decimal(20, 8)
  totalWin        Decimal  @default(0) @db.Decimal(20, 8)
  
  @@index([userId])
  @@index([gameId])
  @@map("casino_sessions")
}

// ============================================
// SPORTS
// ============================================

model SportsEvent {
  id              String   @id @default(cuid())
  name            String
  startTime       DateTime
  isLive          Boolean  @default(false)
  status          String
  
  markets         SportsMarket[]
  bets            SportsBet[]
  
  createdAt       DateTime @default(now())
  
  @@index([startTime])
  @@index([isLive])
  @@map("sports_events")
}

model SportsMarket {
  id              String   @id @default(cuid())
  eventId         String
  event           SportsEvent @relation(fields: [eventId], references: [id])
  
  name            String
  
  selections      SportsSelection[]
  
  @@index([eventId])
  @@map("sports_markets")
}

model SportsSelection {
  id              String   @id @default(cuid())
  marketId        String
  market          SportsMarket @relation(fields: [marketId], references: [id])
  
  name            String
  odds            Decimal  @db.Decimal(10, 4)
  
  bets            SportsBet[]
  
  @@index([marketId])
  @@map("sports_selections")
}

model SportsBet {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventId         String
  event           SportsEvent @relation(fields: [eventId], references: [id])
  
  selectionId     String
  selection       SportsSelection @relation(fields: [selectionId], references: [id])
  
  stake           Decimal  @db.Decimal(20, 8)
  odds            Decimal  @db.Decimal(10, 4)
  
  status          String
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@index([eventId])
  @@map("sports_bets")
}

// ============================================
// VIP
// ============================================

model VipLevel {
  id              String   @id @default(cuid())
  name            String
  level           Int      @unique
  
  pointsRequired  Int
  cashbackPercent Decimal  @db.Decimal(5, 2)
  
  @@index([level])
  @@map("vip_levels")
}

// ============================================
// AFFILIATES
// ============================================

model Affiliate {
  id              String   @id @default(cuid())
  userId          String   @unique
  
  commissionType  String
  commissionRate  Decimal  @db.Decimal(5, 2)
  
  trackingCode    String   @unique
  
  @@index([trackingCode])
  @@map("affiliates")
}

// ============================================
// ADMIN & AUDIT
// ============================================

model AuditLog {
  id              String   @id @default(cuid())
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  
  action          String
  entity          String
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@map("audit_logs")
}
```

## Database Indexes Strategy

### Critical Indexes
- **users**: email, isKycVerified, isBanned
- **accounts**: userId
- **transactions**: userId, status, type, createdAt
- **casino_games**: category, isActive
- **casino_sessions**: userId, gameId, startedAt
- **sports_events**: startTime, isLive, status
- **sports_bets**: userId, eventId, status, createdAt

### Partitioning Strategy (Future)
- **transactions**: Monthly partitioning by createdAt
- **casino_sessions**: Monthly partitioning by startedAt
- **sports_bets**: Monthly partitioning by createdAt
- **audit_logs**: Monthly partitioning by createdAt

## Data Retention Policy

- **User data**: Keep forever (unless deleted per LGPD)
- **Transactions**: 7 years (legal requirement)
- **Casino sessions**: 2 years
- **Sports bets**: 5 years
- **Audit logs**: 1 year
- **Security events**: 6 months
