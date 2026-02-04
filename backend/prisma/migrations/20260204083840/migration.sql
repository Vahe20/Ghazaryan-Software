-- AlterTable
ALTER TABLE "users" ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "blockedTime" TIMESTAMP(3);
