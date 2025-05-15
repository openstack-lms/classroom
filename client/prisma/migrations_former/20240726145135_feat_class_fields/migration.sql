/*
  Warnings:

  - You are about to drop the column `code` on the `Class` table. All the data in the column will be lost.
  - Added the required column `section` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Class` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "section" INTEGER NOT NULL
);
INSERT INTO "new_Class" ("id", "name") SELECT "id", "name" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
