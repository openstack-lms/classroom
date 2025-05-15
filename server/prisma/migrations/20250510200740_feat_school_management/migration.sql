/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('HOMEWORK', 'QUIZ', 'TEST', 'PROJECT', 'ESSAY', 'DISCUSSION', 'PRESENTATION', 'LAB', 'OTHER', 'ANNOUNCEMENT');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "rubric" JSONB,
ADD COLUMN     "type" "AssignmentType" NOT NULL DEFAULT 'HOMEWORK',
ALTER COLUMN "modifiedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "academicCalendar" JSONB,
ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "attendancePolicy" JSONB,
ADD COLUMN     "communicationTemplates" JSONB,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "gradingSystem" JSONB,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "notificationPreferences" JSONB,
ADD COLUMN     "paymentSchedule" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "term" TEXT,
ADD COLUMN     "tuitionRates" JSONB,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "academicInfo" JSONB,
ADD COLUMN     "emergencyContact" JSONB,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "enrollmentDate" TIMESTAMP(3),
ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "medicalInfo" JSONB,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "_AbsentAttendance" ADD CONSTRAINT "_AbsentAttendance_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AbsentAttendance_AB_unique";

-- AlterTable
ALTER TABLE "_InstitutionAdmins" ADD CONSTRAINT "_InstitutionAdmins_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_InstitutionAdmins_AB_unique";

-- AlterTable
ALTER TABLE "_InstitutionMembers" ADD CONSTRAINT "_InstitutionMembers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_InstitutionMembers_AB_unique";

-- AlterTable
ALTER TABLE "_InstitutionTeachers" ADD CONSTRAINT "_InstitutionTeachers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_InstitutionTeachers_AB_unique";

-- AlterTable
ALTER TABLE "_LateAttendance" ADD CONSTRAINT "_LateAttendance_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LateAttendance_AB_unique";

-- AlterTable
ALTER TABLE "_PresentAttendance" ADD CONSTRAINT "_PresentAttendance_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PresentAttendance_AB_unique";

-- AlterTable
ALTER TABLE "_UserStudentToClass" ADD CONSTRAINT "_UserStudentToClass_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserStudentToClass_AB_unique";

-- AlterTable
ALTER TABLE "_UserTeacherToClass" ADD CONSTRAINT "_UserTeacherToClass_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserTeacherToClass_AB_unique";

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headId" TEXT,
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL,
    "departmentId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "prerequisites" JSONB,
    "syllabus" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "institutionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DepartmentTeachers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DepartmentTeachers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_headId_key" ON "Department"("headId");

-- CreateIndex
CREATE INDEX "_DepartmentTeachers_B_index" ON "_DepartmentTeachers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentTeachers" ADD CONSTRAINT "_DepartmentTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentTeachers" ADD CONSTRAINT "_DepartmentTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
