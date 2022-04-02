-- CreateTable
CREATE TABLE "country" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "common_name" VARCHAR(60) NOT NULL,
    "offcial_name" VARCHAR(120) NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_part" (
    "id" SERIAL NOT NULL,
    "external_ref" UUID NOT NULL,
    "country_id" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "flag_part_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flag_part" ADD CONSTRAINT "flag_part_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
