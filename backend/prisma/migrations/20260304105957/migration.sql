/*
  Warnings:

  - Added the required column `downloadUrl` to the `apps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "downloadUrl" TEXT NOT NULL;
