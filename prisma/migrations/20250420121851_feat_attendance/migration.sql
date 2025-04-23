-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classId" TEXT NOT NULL,
    "eventId" TEXT,
    CONSTRAINT "Attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PresentAttendance" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PresentAttendance_A_fkey" FOREIGN KEY ("A") REFERENCES "Attendance" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PresentAttendance_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_LateAttendance" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LateAttendance_A_fkey" FOREIGN KEY ("A") REFERENCES "Attendance" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LateAttendance_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AbsentAttendance" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AbsentAttendance_A_fkey" FOREIGN KEY ("A") REFERENCES "Attendance" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AbsentAttendance_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_PresentAttendance_AB_unique" ON "_PresentAttendance"("A", "B");

-- CreateIndex
CREATE INDEX "_PresentAttendance_B_index" ON "_PresentAttendance"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LateAttendance_AB_unique" ON "_LateAttendance"("A", "B");

-- CreateIndex
CREATE INDEX "_LateAttendance_B_index" ON "_LateAttendance"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AbsentAttendance_AB_unique" ON "_AbsentAttendance"("A", "B");

-- CreateIndex
CREATE INDEX "_AbsentAttendance_B_index" ON "_AbsentAttendance"("B");
