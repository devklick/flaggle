import { client } from '../client';
import restcountriesService from '@flaggle/restcountries-service';
import imageService from '@flaggle/image-service';
import { FlagChunk } from '@prisma/client';

const seed = async () => {
	console.log('Getting countries');
	const countries = await restcountriesService.getAllContries();
	console.info(`Found ${countries.length} countries`);

	for (const country of countries) {
		console.info(`Processing country ${country.name.common}`);
		const countryEntity = await client.country.upsert({
			create: {
				CommonName: country.name.common,
				OfficialName: country.name.official,
				Flag: {
					create: {
						ExternalDownloadUrl: country.flags.png,
						FileType: 'PNG',
					},
				},
			},
			update: {
				OfficialName: country.name.official,
			},
			where: {
				CommonName: country.name.common,
			},
			select: {
				Id: true,
				ExternalRef: true,
				Flag: {
					select: {
						Id: true,
						ExternalRef: true,
					},
				},
			},
		});

		const flagImage = await imageService.downloadImageFromUrl(
			country.flags.png
		);

		await imageService.saveImageToDisk(
			flagImage.buffer,
			countryEntity.ExternalRef,
			flagImage.type,
			'flags'
		);

		const splitFlag = await imageService.splitImageIntoChunks(
			flagImage.buffer,
			countryEntity.Flag.ExternalRef,
			4,
			4
		);

		const flagChunkEntities: Pick<
			FlagChunk,
			'X' | 'Y' | 'ExternalRef' | 'FlagId' | 'FileType'
		>[] = [];

		for (const chunk of splitFlag.chunks) {
			await imageService.saveImageToDisk(
				chunk.buffer,
				chunk.chunkRef,
				flagImage.type,
				'flag-chunks',
				countryEntity.Flag.ExternalRef
			);
			flagChunkEntities.push({
				ExternalRef: chunk.chunkRef,
				X: chunk.chunkPosition.x,
				Y: chunk.chunkPosition.y,
				FlagId: countryEntity.Flag.Id,
				FileType: 'PNG',
			});
		}

		await client.flagChunk.createMany({
			data: flagChunkEntities,
		});
	}

	console.info('Done!');
};

seed();
