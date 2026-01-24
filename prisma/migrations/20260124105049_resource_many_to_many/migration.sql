/*
  Warnings:

  - You are about to drop the column `territoryId` on the `Resource` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_territoryId_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "territoryId";

-- CreateTable
CREATE TABLE "ResourceTerritory" (
    "resourceId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,

    CONSTRAINT "ResourceTerritory_pkey" PRIMARY KEY ("resourceId","territoryId")
);

-- AddForeignKey
ALTER TABLE "ResourceTerritory" ADD CONSTRAINT "ResourceTerritory_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceTerritory" ADD CONSTRAINT "ResourceTerritory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
