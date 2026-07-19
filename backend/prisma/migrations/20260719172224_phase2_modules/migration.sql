/*
  Warnings:

  - Added the required column `updatedAt` to the `kyc_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "affiliates" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "kyc_records" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "sports_bets" ADD COLUMN     "payout" DECIMAL(20,8),
ADD COLUMN     "settledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "vip_missions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "rewardPoints" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vip_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_mission_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "periodKey" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vip_mission_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_commissions" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "referredUserId" TEXT,
    "amount" DECIMAL(20,8) NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "period" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vip_missions_code_key" ON "vip_missions"("code");

-- CreateIndex
CREATE INDEX "vip_missions_type_idx" ON "vip_missions"("type");

-- CreateIndex
CREATE INDEX "vip_missions_isActive_idx" ON "vip_missions"("isActive");

-- CreateIndex
CREATE INDEX "vip_mission_progress_userId_idx" ON "vip_mission_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vip_mission_progress_userId_missionId_periodKey_key" ON "vip_mission_progress"("userId", "missionId", "periodKey");

-- CreateIndex
CREATE INDEX "affiliate_commissions_affiliateId_idx" ON "affiliate_commissions"("affiliateId");

-- CreateIndex
CREATE INDEX "affiliate_commissions_status_idx" ON "affiliate_commissions"("status");

-- CreateIndex
CREATE INDEX "kyc_records_status_idx" ON "kyc_records"("status");

-- CreateIndex
CREATE INDEX "sports_bets_status_idx" ON "sports_bets"("status");

-- CreateIndex
CREATE INDEX "users_vipLevelId_idx" ON "users"("vipLevelId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_vipLevelId_fkey" FOREIGN KEY ("vipLevelId") REFERENCES "vip_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_mission_progress" ADD CONSTRAINT "vip_mission_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_mission_progress" ADD CONSTRAINT "vip_mission_progress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "vip_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
