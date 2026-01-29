-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
