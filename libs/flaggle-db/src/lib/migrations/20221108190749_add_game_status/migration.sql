/*
  Warnings:

  - Added the required column `status` to the `game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('in_progress', 'lost', 'won');

-- AlterTable
ALTER TABLE "game" ADD COLUMN     "status" "GameStatus" NOT NULL;
