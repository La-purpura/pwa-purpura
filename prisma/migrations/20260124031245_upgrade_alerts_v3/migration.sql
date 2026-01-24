/*
  Warnings:

  - You are about to drop the column `isRead` on the `Alert` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "isRead",
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "territoryId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'info';

-- CreateTable
CREATE TABLE "AlertRead" (
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertRead_pkey" PRIMARY KEY ("alertId","userId")
);

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_territoryId_idx" ON "Alert"("territoryId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRead" ADD CONSTRAINT "AlertRead_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRead" ADD CONSTRAINT "AlertRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
