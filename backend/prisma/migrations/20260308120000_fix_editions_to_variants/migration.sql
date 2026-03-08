-- DropForeignKey
ALTER TABLE "appsinedition" DROP CONSTRAINT "appsinedition_editionId_fkey";

-- DropForeignKey
ALTER TABLE "appsinedition" DROP CONSTRAINT "appsinedition_appId_fkey";

-- DropTable
DROP TABLE "appsinedition";

-- DropTable
DROP TABLE "appeditions";

-- AlterTable
ALTER TABLE "apps" ADD COLUMN "parentAppId" TEXT;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_parentAppId_fkey" FOREIGN KEY ("parentAppId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
