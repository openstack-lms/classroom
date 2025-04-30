/*
  Warnings:

  - You are about to drop the column `gradeTotal` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN "gradeMax" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "gradeReceived" INTEGER,
    "submittedAt" DATETIME,
    "submitted" BOOLEAN DEFAULT false,
    "returned" BOOLEAN DEFAULT false,
    CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("assignmentId", "createdAt", "gradeReceived", "id", "modifiedAt", "returned", "studentId", "submitted", "submittedAt") SELECT "assignmentId", "createdAt", "gradeReceived", "id", "modifiedAt", "returned", "studentId", "submitted", "submittedAt" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
