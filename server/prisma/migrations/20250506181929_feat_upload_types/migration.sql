/*
  Warnings:

  - You are about to drop the column `address` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `establishedAt` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Institution` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Institution_code_key";

-- AlterTable
ALTER TABLE "Institution" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "code",
DROP COLUMN "country",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "establishedAt",
DROP COLUMN "phone",
DROP COLUMN "postalCode",
DROP COLUMN "state",
DROP COLUMN "updatedAt",
DROP COLUMN "website";

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "path" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attachment_userId_idx" ON "Attachment"("userId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
