/*
  Warnings:

  - You are about to drop the column `flag_download_url` on the `country` table. All the data in the column will be lost.
  - You are about to drop the column `country_id` on the `flag_chunk` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[flag_id]` on the table `country` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `flag_id` to the `country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flag_id` to the `flag_chunk` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "flag_chunk" DROP CONSTRAINT "flag_chunk_country_id_fkey";

-- AlterTable
ALTER TABLE "country" DROP COLUMN "flag_download_url",
ADD COLUMN     "flag_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "flag_chunk" DROP COLUMN "country_id",
ADD COLUMN     "flag_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "flag" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,
    "external_download_url" VARCHAR(256) NOT NULL,
    "country_id" INTEGER,

    CONSTRAINT "flag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flag_external_ref_key" ON "flag"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "flag_country_id_key" ON "flag"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "country_flag_id_key" ON "country"("flag_id");

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "flag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_chunk" ADD CONSTRAINT "flag_chunk_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "flag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
