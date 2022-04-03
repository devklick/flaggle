/*
  Warnings:

  - Added the required column `FlagChunkId` to the `revealed_chunk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "revealed_chunk" ADD COLUMN     "AnswerId" INTEGER,
ADD COLUMN     "FlagChunkId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "revealed_chunk" ADD CONSTRAINT "revealed_chunk_FlagChunkId_fkey" FOREIGN KEY ("FlagChunkId") REFERENCES "flag_chunk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
