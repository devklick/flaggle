/*
  Warnings:

  - You are about to drop the column `AnswerId` on the `revealed_chunk` table. All the data in the column will be lost.
  - You are about to drop the column `FlagChunkId` on the `revealed_chunk` table. All the data in the column will be lost.
  - Added the required column `flag_chunk_id` to the `revealed_chunk` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "revealed_chunk" DROP CONSTRAINT "revealed_chunk_FlagChunkId_fkey";

-- AlterTable
ALTER TABLE "revealed_chunk" DROP COLUMN "AnswerId",
DROP COLUMN "FlagChunkId",
ADD COLUMN     "answer_id" INTEGER,
ADD COLUMN     "flag_chunk_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "revealed_chunk" ADD CONSTRAINT "revealed_chunk_flag_chunk_id_fkey" FOREIGN KEY ("flag_chunk_id") REFERENCES "flag_chunk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
