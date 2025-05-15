-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "gradeReceived" INTEGER;
ALTER TABLE "Submission" ADD COLUMN "gradeTotal" INTEGER;
ALTER TABLE "Submission" ADD COLUMN "returned" BOOLEAN DEFAULT false;
ALTER TABLE "Submission" ADD COLUMN "submitted" BOOLEAN DEFAULT false;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "path" TEXT,
    "size" INTEGER,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "uploadedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" TEXT,
    "submissionId" TEXT,
    "annotationId" TEXT,
    CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "File_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "File_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "File_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_File" ("assignmentId", "id", "name", "path", "size", "submissionId", "type", "uploadedAt", "userId") SELECT "assignmentId", "id", "name", "path", "size", "submissionId", "type", "uploadedAt", "userId" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
