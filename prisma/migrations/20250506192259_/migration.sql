/*
  Warnings:

  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[thumbnailId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_userId_fkey";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "thumbnailId" TEXT;

-- DropTable
DROP TABLE "Attachment";

-- CreateIndex
CREATE UNIQUE INDEX "File_thumbnailId_key" ON "File"("thumbnailId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
