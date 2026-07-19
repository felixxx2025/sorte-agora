-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "selfExcludedUntil" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "providerRef" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "transactions_externalId_key" ON "transactions"("externalId");
CREATE INDEX IF NOT EXISTS "transactions_externalId_idx" ON "transactions"("externalId");

-- AlterTable
ALTER TABLE "sports_events" ADD COLUMN IF NOT EXISTS "winningSelectionId" TEXT;
