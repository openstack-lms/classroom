/*
  Warnings:

  - The primary key for the `Class` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "path" TEXT,
    "size" INTEGER,
    "type" TEXT,
    "uploadedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" TEXT,
    "submissionId" TEXT,
    CONSTRAINT "File_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "File_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "content" TEXT,
    "dueDate" DATETIME,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "classId" TEXT NOT NULL,
    CONSTRAINT "Assignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "userId" TEXT,
    "classId" TEXT,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Session_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT
);
INSERT INTO "new_Class" ("id", "name") SELECT "id", "name" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "password" TEXT
);
INSERT INTO "new_User" ("id", "password", "username") SELECT "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE TABLE "new__UserStudentToClass" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserStudentToClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserStudentToClass_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__UserStudentToClass" ("A", "B") SELECT "A", "B" FROM "_UserStudentToClass";
DROP TABLE "_UserStudentToClass";
ALTER TABLE "new__UserStudentToClass" RENAME TO "_UserStudentToClass";
CREATE UNIQUE INDEX "_UserStudentToClass_AB_unique" ON "_UserStudentToClass"("A", "B");
CREATE INDEX "_UserStudentToClass_B_index" ON "_UserStudentToClass"("B");
CREATE TABLE "new__UserTeacherToClass" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserTeacherToClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserTeacherToClass_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__UserTeacherToClass" ("A", "B") SELECT "A", "B" FROM "_UserTeacherToClass";
DROP TABLE "_UserTeacherToClass";
ALTER TABLE "new__UserTeacherToClass" RENAME TO "_UserTeacherToClass";
CREATE UNIQUE INDEX "_UserTeacherToClass_AB_unique" ON "_UserTeacherToClass"("A", "B");
CREATE INDEX "_UserTeacherToClass_B_index" ON "_UserTeacherToClass"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
