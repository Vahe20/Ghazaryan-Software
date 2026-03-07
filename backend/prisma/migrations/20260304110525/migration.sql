/*
  Warnings:

  - You are about to drop the column `downloadUrl` on the `apps` table. All the data in the column will be lost.
  - Added the required column `downloadUrl` to the `appsversion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apps" DROP COLUMN "downloadUrl";

-- AlterTable
ALTER TABLE "appsversion" ADD COLUMN     "downloadUrl" TEXT NOT NULL;
