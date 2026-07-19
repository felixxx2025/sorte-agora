-- AlterTable users — email verification + responsible gaming
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationExpiry" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "depositLimitDaily" DECIMAL(20,8);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "depositLimitWeekly" DECIMAL(20,8);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "depositLimitMonthly" DECIMAL(20,8);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lossLimitDaily" DECIMAL(20,8);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lossLimitWeekly" DECIMAL(20,8);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lossLimitMonthly" DECIMAL(20,8);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sessionTimeLimitMinutes" INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS "users_emailVerificationToken_key" ON "users"("emailVerificationToken");

-- AlterTable casino_games — Cassanova parity fields
ALTER TABLE "casino_games" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "casino_games" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "casino_games" ADD COLUMN IF NOT EXISTS "volatility" TEXT;
ALTER TABLE "casino_games" ADD COLUMN IF NOT EXISTS "features" JSONB;
ALTER TABLE "casino_games" ADD COLUMN IF NOT EXISTS "hasJackpot" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "casino_games" ADD COLUMN IF NOT EXISTS "jackpotAmount" DECIMAL(20,8);
ALTER TABLE "casino_games" ADD COLUMN IF NOT EXISTS "demoAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "casino_games" ADD COLUMN IF NOT EXISTS "isNew" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "casino_games_slug_key" ON "casino_games"("slug");

-- CreateTable favorite_games
CREATE TABLE IF NOT EXISTS "favorite_games" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_games_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "favorite_games_userId_gameId_key" ON "favorite_games"("userId", "gameId");
CREATE INDEX IF NOT EXISTS "favorite_games_userId_idx" ON "favorite_games"("userId");

DO $$ BEGIN
  ALTER TABLE "favorite_games" ADD CONSTRAINT "favorite_games_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "favorite_games" ADD CONSTRAINT "favorite_games_gameId_fkey"
    FOREIGN KEY ("gameId") REFERENCES "casino_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable promo_banners — Cassanova parity fields
ALTER TABLE "promo_banners" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "promo_banners" ADD COLUMN IF NOT EXISTS "terms" TEXT;
ALTER TABLE "promo_banners" ADD COLUMN IF NOT EXISTS "bonusPercentage" DECIMAL(5,2);
ALTER TABLE "promo_banners" ADD COLUMN IF NOT EXISTS "freeSpins" INTEGER;
ALTER TABLE "promo_banners" ADD COLUMN IF NOT EXISTS "wageringRequirement" INTEGER;
ALTER TABLE "promo_banners" ADD COLUMN IF NOT EXISTS "minDeposit" DECIMAL(20,8);
ALTER TABLE "promo_banners" ADD COLUMN IF NOT EXISTS "maxBonus" DECIMAL(20,8);
ALTER TABLE "promo_banners" ADD COLUMN IF NOT EXISTS "promoCode" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "promo_banners_slug_key" ON "promo_banners"("slug");
