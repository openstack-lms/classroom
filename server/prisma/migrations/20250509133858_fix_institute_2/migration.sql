-- CreateTable
CREATE TABLE "_InstitutionTeachers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InstitutionTeachers_AB_unique" ON "_InstitutionTeachers"("A", "B");

-- CreateIndex
CREATE INDEX "_InstitutionTeachers_B_index" ON "_InstitutionTeachers"("B");

-- AddForeignKey
ALTER TABLE "_InstitutionTeachers" ADD CONSTRAINT "_InstitutionTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstitutionTeachers" ADD CONSTRAINT "_InstitutionTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
