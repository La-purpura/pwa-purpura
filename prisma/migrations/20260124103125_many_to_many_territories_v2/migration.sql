/*
  Warnings:

  - You are about to drop the column `territoryId` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `territoryId` on the `Incident` table. All the data in the column will be lost.
  - You are about to drop the column `territoryId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `territoryId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_territoryId_fkey";

-- DropForeignKey
ALTER TABLE "Incident" DROP CONSTRAINT "Incident_territoryId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_territoryId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_territoryId_fkey";

-- DropIndex
DROP INDEX "Alert_territoryId_idx";

-- DropIndex
DROP INDEX "Post_territoryId_idx";

-- DropIndex
DROP INDEX "Task_territoryId_idx";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "territoryId";

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "territoryId";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "territoryId";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "territoryId";

-- CreateTable
CREATE TABLE "TaskTerritory" (
    "taskId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,

    CONSTRAINT "TaskTerritory_pkey" PRIMARY KEY ("taskId","territoryId")
);

-- CreateTable
CREATE TABLE "AlertTerritory" (
    "alertId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,

    CONSTRAINT "AlertTerritory_pkey" PRIMARY KEY ("alertId","territoryId")
);

-- CreateTable
CREATE TABLE "PostTerritory" (
    "postId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,

    CONSTRAINT "PostTerritory_pkey" PRIMARY KEY ("postId","territoryId")
);

-- CreateTable
CREATE TABLE "IncidentTerritory" (
    "incidentId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,

    CONSTRAINT "IncidentTerritory_pkey" PRIMARY KEY ("incidentId","territoryId")
);

-- AddForeignKey
ALTER TABLE "TaskTerritory" ADD CONSTRAINT "TaskTerritory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTerritory" ADD CONSTRAINT "TaskTerritory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertTerritory" ADD CONSTRAINT "AlertTerritory_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertTerritory" ADD CONSTRAINT "AlertTerritory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTerritory" ADD CONSTRAINT "PostTerritory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTerritory" ADD CONSTRAINT "PostTerritory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTerritory" ADD CONSTRAINT "IncidentTerritory_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTerritory" ADD CONSTRAINT "IncidentTerritory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
