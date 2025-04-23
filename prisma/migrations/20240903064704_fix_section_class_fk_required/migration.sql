/*
  Warnings:

  - Made the column `classId` on table `Section` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Section` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    CONSTRAINT "Section_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("classId", "id", "name") SELECT "classId", "id", "name" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
