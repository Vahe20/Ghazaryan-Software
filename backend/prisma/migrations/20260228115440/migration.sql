-- CreateEnum
CREATE TYPE "DeveloperRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "editionId" TEXT;

-- CreateTable
CREATE TABLE "appedition" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "features" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appedition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apppromotion" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "editionId" TEXT,
    "discountAmount" DECIMAL(10,2),
    "discountPercent" INTEGER,
    "label" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apppromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developerrequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "portfolio" TEXT,
    "status" "DeveloperRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developerrequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appedition_appId_idx" ON "appedition"("appId");

-- CreateIndex
CREATE INDEX "apppromotion_appId_idx" ON "apppromotion"("appId");

-- CreateIndex
CREATE INDEX "apppromotion_editionId_idx" ON "apppromotion"("editionId");

-- CreateIndex
CREATE UNIQUE INDEX "developerrequest_userId_key" ON "developerrequest"("userId");

-- CreateIndex
CREATE INDEX "developerrequest_status_idx" ON "developerrequest"("status");

-- AddForeignKey
ALTER TABLE "appedition" ADD CONSTRAINT "appedition_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apppromotion" ADD CONSTRAINT "apppromotion_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apppromotion" ADD CONSTRAINT "apppromotion_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "appedition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developerrequest" ADD CONSTRAINT "developerrequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "appedition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
