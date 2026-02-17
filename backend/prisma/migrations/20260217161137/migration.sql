-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'DEVELOPER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('BETA', 'RELEASE');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WINDOWS', 'MAC', 'LINUX', 'ANDROID', 'IOS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "passwordHash" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "avatarUrl" TEXT,
    "blockedTime" TIMESTAMP(3),
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDesc" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changelog" TEXT,
    "iconUrl" TEXT NOT NULL,
    "coverUrl" TEXT,
    "screenshots" TEXT[],
    "categoryId" TEXT NOT NULL,
    "tags" TEXT[],
    "size" INTEGER NOT NULL,
    "platform" "Platform"[],
    "minVersion" TEXT,
    "downloadUrl" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "documentationUrl" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "status" "AppStatus" NOT NULL DEFAULT 'BETA',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appscategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "appscategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appsversion" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changelog" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "isStable" BOOLEAN NOT NULL DEFAULT true,
    "releaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appsversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT,
    "version" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'COMPLETED',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "apps_slug_key" ON "apps"("slug");

-- CreateIndex
CREATE INDEX "apps_slug_idx" ON "apps"("slug");

-- CreateIndex
CREATE INDEX "apps_categoryId_idx" ON "apps"("categoryId");

-- CreateIndex
CREATE INDEX "apps_status_idx" ON "apps"("status");

-- CreateIndex
CREATE UNIQUE INDEX "appscategory_name_key" ON "appscategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "appscategory_slug_key" ON "appscategory"("slug");

-- CreateIndex
CREATE INDEX "appscategory_slug_idx" ON "appscategory"("slug");

-- CreateIndex
CREATE INDEX "appscategory_order_idx" ON "appscategory"("order");

-- CreateIndex
CREATE INDEX "appsversion_appId_idx" ON "appsversion"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "appsversion_appId_version_key" ON "appsversion"("appId", "version");

-- CreateIndex
CREATE INDEX "reviews_appId_idx" ON "reviews"("appId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_appId_userId_key" ON "reviews"("appId", "userId");

-- CreateIndex
CREATE INDEX "downloads_appId_idx" ON "downloads"("appId");

-- CreateIndex
CREATE INDEX "downloads_userId_idx" ON "downloads"("userId");

-- CreateIndex
CREATE INDEX "downloads_downloadedAt_idx" ON "downloads"("downloadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_transactionId_key" ON "purchases"("transactionId");

-- CreateIndex
CREATE INDEX "purchases_userId_idx" ON "purchases"("userId");

-- CreateIndex
CREATE INDEX "purchases_appId_idx" ON "purchases"("appId");

-- CreateIndex
CREATE INDEX "purchases_purchasedAt_idx" ON "purchases"("purchasedAt");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_userId_appId_key" ON "purchases"("userId", "appId");

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "appscategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appsversion" ADD CONSTRAINT "appsversion_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
