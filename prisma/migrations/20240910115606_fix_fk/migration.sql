-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "instructions" TEXT,
    "dueDate" DATETIME,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT,
    CONSTRAINT "Assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "Assignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "Assignment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Assignment" ("classId", "createdAt", "dueDate", "id", "instructions", "modifiedAt", "sectionId", "teacherId", "title") SELECT "classId", "createdAt", "dueDate", "id", "instructions", "modifiedAt", "sectionId", "teacherId", "title" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "gradeTotal" INTEGER,
    "gradeReceived" INTEGER,
    "submitted" BOOLEAN DEFAULT false,
    "returned" BOOLEAN DEFAULT false,
    CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("assignmentId", "createdAt", "gradeReceived", "gradeTotal", "id", "modifiedAt", "returned", "studentId", "submitted") SELECT "assignmentId", "createdAt", "gradeReceived", "gradeTotal", "id", "modifiedAt", "returned", "studentId", "submitted" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
