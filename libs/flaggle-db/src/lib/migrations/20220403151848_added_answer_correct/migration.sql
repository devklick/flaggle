/*
  Warnings:

  - Added the required column `correct` to the `answer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "answer" ADD COLUMN     "correct" BOOLEAN NOT NULL;
