/*
  Warnings:

  - You are about to drop the column `description` on the `appscategory` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `appscategory` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- DropIndex
DROP INDEX "appscategory_order_idx";

-- AlterTable
ALTER TABLE "appscategory" DROP COLUMN "description",
DROP COLUMN "order";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE INTEGER;
