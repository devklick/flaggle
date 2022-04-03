-- CreateTable
CREATE TABLE "country" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,
    "flag_download_url" VARCHAR(256) NOT NULL,
    "common_name" VARCHAR(60) NOT NULL,
    "offcial_name" VARCHAR(120) NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_chunk" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "flag_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,
    "country_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revealed_chunk" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "OrderId" INTEGER NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "revealed_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "OrderId" INTEGER NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,
    "game_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "revealed_chunk_id" INTEGER NOT NULL,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "country_external_ref_key" ON "country"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "country_common_name_key" ON "country"("common_name");

-- CreateIndex
CREATE UNIQUE INDEX "flag_chunk_external_ref_key" ON "flag_chunk"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "player_external_ref_key" ON "player"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "game_external_ref_key" ON "game"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "revealed_chunk_external_ref_key" ON "revealed_chunk"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "answer_external_ref_key" ON "answer"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "answer_revealed_chunk_id_key" ON "answer"("revealed_chunk_id");

-- AddForeignKey
ALTER TABLE "flag_chunk" ADD CONSTRAINT "flag_chunk_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revealed_chunk" ADD CONSTRAINT "revealed_chunk_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_revealed_chunk_id_fkey" FOREIGN KEY ("revealed_chunk_id") REFERENCES "revealed_chunk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
