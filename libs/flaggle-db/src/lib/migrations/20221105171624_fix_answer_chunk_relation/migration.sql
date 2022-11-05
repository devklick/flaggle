/*
  Warnings:

  - You are about to drop the column `answer_id` on the `revealed_chunk` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "answer_revealed_chunk_id_key";

-- AlterTable
ALTER TABLE "revealed_chunk" DROP COLUMN "answer_id";
