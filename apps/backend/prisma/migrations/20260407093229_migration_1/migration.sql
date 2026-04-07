/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- Remove duplicate organization names before creating unique index
DELETE FROM "Organization" a
USING "Organization" b
WHERE a.id > b.id
  AND a.name = b.name;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");
