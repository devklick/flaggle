/*
  Warnings:

  - Added the required column `file_type` to the `flag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_type` to the `flag_chunk` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "file_type" AS ENUM ('png');

-- AlterTable
ALTER TABLE "flag" ADD COLUMN     "file_type" "file_type" NOT NULL;

-- AlterTable
ALTER TABLE "flag_chunk" ADD COLUMN     "file_type" "file_type" NOT NULL;
