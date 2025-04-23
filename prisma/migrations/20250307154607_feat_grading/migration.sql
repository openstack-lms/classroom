-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "graded" BOOLEAN NOT NULL DEFAULT false,
    "gradeMax" INTEGER DEFAULT 0,
    "sectionId" TEXT,
    CONSTRAINT "Assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "Assignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Assignment" ("classId", "createdAt", "dueDate", "gradeMax", "id", "instructions", "modifiedAt", "sectionId", "teacherId", "title") SELECT "classId", "createdAt", "dueDate", "gradeMax", "id", "instructions", "modifiedAt", "sectionId", "teacherId", "title" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
