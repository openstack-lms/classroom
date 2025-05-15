-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "settings" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile" JSONB DEFAULT '{}';

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
