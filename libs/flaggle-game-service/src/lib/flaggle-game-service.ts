import {
	CreateGameRequest,
	CreateGameResponse,
	UpdateGameRequest,
	UpdateGameResponse,
} from '@flaggle/flaggle-api-schemas';
import { client } from '@flaggle/flaggle-db';
import { randomUUID } from 'crypto';

export const createGame = async (
	request: CreateGameRequest
): Promise<CreateGameResponse> => {
	const playerExternalRef = request.playerId ?? randomUUID();
	const player = await client.player.upsert({
		create: {
			ExternalRef: playerExternalRef,
		},
		update: {},
		where: {
			ExternalRef: playerExternalRef,
		},
		select: {
			Id: true,
			ExternalRef: true,
		},
	});

	// select a random country that this player hasnt played before.
	// TODO: Update approach to serve each player the same flag, and a different flag per day
	const country = await getNextCountry(player.Id);

	const game = await client.game.create({
		data: {
			CountryId: country.Id,
			PlayerId: player.Id,
		},
		select: {
			ExternalRef: true,
		},
	});

	const startingFlagChunk = await getRandomItem(country.FlagChunks);

	await client.revealedChunk.create({
		data: {
			OrderId: 1,
			FlagChunk: {
				connect: {
					ExternalRef: startingFlagChunk.ExternalRef,
				},
			},
			Game: {
				connect: {
					ExternalRef: game.ExternalRef,
				},
			},
		},
	});

	return {
		playerId: player.ExternalRef,
		gameId: game.ExternalRef,
		flagChunks: country.FlagChunks.map((c) => ({
			revealed: c.Id === startingFlagChunk.Id,
			externalRef: `${country.ExternalRef}/${c.ExternalRef}`,
			position: {
				x: c.X,
				y: c.Y,
			},
		})),
	};
};

export const updateGame = async (
	request: UpdateGameRequest
): Promise<UpdateGameResponse> => {
	// Fetch the game data
	const game = await client.game.findFirst({
		where: {
			ExternalRef: request.gameId,
		},
		select: {
			Id: true,
			PlayerId: true,
			Country: {
				select: {
					ExternalRef: true,
					Id: true,
					FlagChunks: {
						select: {
							ExternalRef: true,
							X: true,
							Y: true,
						},
					},
				},
			},
			RevealedChunks: {
				select: {
					OrderId: true,
					Id: true,
					FlagChunk: {
						select: {
							ExternalRef: true,
							X: true,
							Y: true,
						},
					},
				},
			},
			Answers: {
				select: {
					Id: true,
					Country: {
						select: {
							ExternalRef: true,
						},
					},
				},
			},
		},
	});
	// Record the answer
	// prettier-ignore
	const latestRevealedChunk = game.RevealedChunks.sort((a, b) => (a.OrderId - b.OrderId))[game.RevealedChunks.length -1];
	const correct = request.countryId === game.Country.ExternalRef;
	const latestAnswer = await client.answer.create({
		data: {
			OrderId: game.Answers.length + 1,
			Correct: correct,
			Country: {
				connect: {
					ExternalRef: request.countryId,
				},
			},
			Game: {
				connect: {
					Id: game.Id,
				},
			},
			Player: {
				connect: {
					Id: game.PlayerId,
				},
			},
			RevealedChunk: {
				connect: {
					Id: latestRevealedChunk.Id,
				},
			},
		},
		select: {
			Id: true,
			Country: {
				select: {
					ExternalRef: true,
				},
			},
		},
	});

	// Convert the answers into objects expected by the API response
	const guesses = [...game.Answers].concat([latestAnswer]).map((answer) => ({
		countryId: answer.Country.ExternalRef,
		correct: answer.Country.ExternalRef === game.Country.ExternalRef,
	}));

	// Convert he chunks to objects expected by the API response
	const flagChunks = game.Country.FlagChunks.map((chunk) => ({
		externalRef: `${game.Country.ExternalRef}/${chunk.ExternalRef}`,
		revealed: game.RevealedChunks.some(
			(c) => c.FlagChunk.ExternalRef === chunk.ExternalRef
		),
		position: {
			x: chunk.X,
			y: chunk.Y,
		},
	}));

	// If the answer was incorrect, we need to fetch another chunk to serve as the next clue
	if (!correct) {
		const remainingChunks = game.Country.FlagChunks.filter(
			(chunk) =>
				!game.RevealedChunks.some(
					(r) => r.FlagChunk.ExternalRef === chunk.ExternalRef
				)
		);
		const nextChunk = getRandomItem(remainingChunks);
		await client.revealedChunk.create({
			data: {
				OrderId: flagChunks.length + 1,
				FlagChunk: {
					connect: {
						ExternalRef: nextChunk.ExternalRef,
					},
				},
				Game: {
					connect: {
						Id: game.Id,
					},
				},
			},
		});
		flagChunks.find((c) =>
			c.externalRef.endsWith(nextChunk.ExternalRef)
		).revealed = true;
	}

	return {
		correct,
		guesses,
		flagChunks,
	};
};

const getNextCountry = async (playerId: number) => {
	const nextCountries = await client.country.findMany({
		select: {
			Id: true,
			CommonName: true,
			ExternalRef: true,
			FlagChunks: true,
		},
		where: {
			Games: {
				none: {
					Id: playerId,
				},
			},
		},
	});
	return getRandomItem(nextCountries);
};

const getNextFlagChunk = async (countryId: number) => {
	const flagChunks = await client.flagChunk.findMany({
		select: {
			ExternalRef: true,
			X: true,
			Y: true,
		},
		where: {
			CountryId: countryId,
		},
	});
	return getRandomItem(flagChunks);
};

const getRandomItem = <T>(items: T[]): T =>
	items[Math.floor(Math.random() * items.length)];

export default {
	createGame,
	updateGame,
};
