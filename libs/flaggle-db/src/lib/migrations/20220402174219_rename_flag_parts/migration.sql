/*
  Warnings:

  - Added the required column `flag_download_url` to the `country` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "country" ADD COLUMN     "flag_download_url" VARCHAR(256) NOT NULL;
