import { client } from '../client';
import restcountriesService from '@flaggle/restcountries-service';
import imageService from '@flaggle/image-service';
import { randomUUID } from 'crypto';
import { FlagChunk } from '@prisma/client';

const seed = async () => {
	console.log('Getting countries');
	const countries = await restcountriesService.getAllContries();
	console.info(`Found ${countries.length} countries`);

	for (const country of countries) {
		const countryEntity = await client.country.upsert({
			create: {
				CommonName: country.name.common,
				OffcialName: country.name.official,
				ExternalRef: randomUUID(),
				FlagDownloadUrl: country.flags.png,
			},
			update: {
				OffcialName: country.name.official,
			},
			where: {
				CommonName: country.name.common,
			},
			select: {
				Id: true,
				ExternalRef: true,
				FlagChunks: true,
			},
		});

		const flagImage = await imageService.downloadImageFromUrl(
			country.flags.png
		);

		await imageService.saveImageToDisk(
			flagImage.buffer,
			countryEntity.ExternalRef,
			'flags'
		);

		const splitFlag = await imageService.splitImageIntoChunks(
			flagImage.buffer,
			countryEntity.ExternalRef,
			4,
			4
		);

		const flagChunkEntities: Pick<
			FlagChunk,
			'X' | 'Y' | 'ExternalRef' | 'CountryId'
		>[] = [];

		for (const chunk of splitFlag.chunks) {
			await imageService.saveImageToDisk(
				chunk.buffer,
				chunk.chunkRef,
				'flag-chunks',
				splitFlag.imageRef
			);
			flagChunkEntities.push({
				ExternalRef: chunk.chunkRef,
				X: chunk.chunkPosition.x,
				Y: chunk.chunkPosition.y,
				CountryId: countryEntity.Id,
			});
		}

		await client.flagChunk.createMany({
			data: flagChunkEntities,
		});
	}
};

seed();
