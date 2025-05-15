-- CreateTable
CREATE TABLE "_InstitutionMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_InstitutionAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InstitutionMembers_AB_unique" ON "_InstitutionMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_InstitutionMembers_B_index" ON "_InstitutionMembers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_InstitutionAdmins_AB_unique" ON "_InstitutionAdmins"("A", "B");

-- CreateIndex
CREATE INDEX "_InstitutionAdmins_B_index" ON "_InstitutionAdmins"("B");

-- AddForeignKey
ALTER TABLE "_InstitutionMembers" ADD CONSTRAINT "_InstitutionMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstitutionMembers" ADD CONSTRAINT "_InstitutionMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstitutionAdmins" ADD CONSTRAINT "_InstitutionAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstitutionAdmins" ADD CONSTRAINT "_InstitutionAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
