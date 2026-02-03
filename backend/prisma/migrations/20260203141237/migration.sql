/*
  Warnings:

  - You are about to drop the `refreshtoken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "refreshtoken" DROP CONSTRAINT "refreshtoken_userId_fkey";

-- DropTable
DROP TABLE "refreshtoken";
