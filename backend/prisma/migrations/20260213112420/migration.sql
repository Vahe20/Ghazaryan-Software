/*
  Warnings:

  - You are about to drop the column `isFree` on the `apps` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `apps` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `description` on the `appscategory` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `appscategory` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `purchases` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "apps" DROP COLUMN "isFree",
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "appscategory" DROP COLUMN "description",
DROP COLUMN "order";

-- AlterTable
ALTER TABLE "purchases" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
