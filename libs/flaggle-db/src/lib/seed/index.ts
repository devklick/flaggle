import { client } from '../client';
import restcountriesService from '@flaggle/restcountries-service';
import imageService from '@flaggle/image-service';
import { randomUUID } from 'crypto';
import { flag_chunk } from '@prisma/client';

const seed = async () => {
  console.log('Getting countries');
  const countries = await restcountriesService.getAllContries();
  console.info(`Found ${countries.length} countries`);

  for (const country of countries) {
    const countryEntity = await client.country.upsert({
      create: {
        common_name: country.name.common,
        offcial_name: country.name.official,
        external_ref: randomUUID(),
        flag_download_url: country.flags.png,
      },
      update: {
        offcial_name: country.name.official,
      },
      where: {
        common_name: country.name.common,
      },
      select: {
        id: true,
        external_ref: true,
        flag_chunks: true,
      },
    });

    const flagImage = await imageService.downloadImageFromUrl(
      country.flags.png
    );

    await imageService.saveImageToDisk(
      flagImage.buffer,
      'flags',
      countryEntity.external_ref
    );

    const splitFlag = await imageService.splitImageIntoChunks(
      flagImage.buffer,
      countryEntity.external_ref,
      4,
      4
    );

    const flagChunkEntities: Pick<
      flag_chunk,
      'x' | 'y' | 'external_ref' | 'country_id'
    >[] = [];

    for (const chunk of splitFlag.chunks) {
      await imageService.saveImageToDisk(
        chunk.buffer,
        splitFlag.imageRef,
        chunk.chunkRef
      );
      flagChunkEntities.push({
        external_ref: chunk.chunkRef,
        x: chunk.chunkPosition.x,
        y: chunk.chunkPosition.y,
        country_id: countryEntity.id,
      });
    }

    await client.flag_chunk.createMany({
      data: flagChunkEntities,
    });
  }
};

seed();
