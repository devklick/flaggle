/*
  Warnings:

  - You are about to drop the `flag_part` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[external_ref]` on the table `country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[common_name]` on the table `country` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "flag_part" DROP CONSTRAINT "flag_part_country_id_fkey";

-- DropTable
DROP TABLE "flag_part";

-- CreateTable
CREATE TABLE "flag_chunk" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "flag_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flag_chunk_external_ref_key" ON "flag_chunk"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "country_external_ref_key" ON "country"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "country_common_name_key" ON "country"("common_name");

-- AddForeignKey
ALTER TABLE "flag_chunk" ADD CONSTRAINT "flag_chunk_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
