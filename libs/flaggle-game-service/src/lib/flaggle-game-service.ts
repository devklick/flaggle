import {
	CreateGameRequest,
	CreateGameResponse,
	FlagChunk,
	Guess,
	UpdateGameRequest,
	UpdateGameResponse,
} from '@flaggle/flaggle-api-schemas';
import { client } from '@flaggle/flaggle-db';
import {
	FileType as FileType_DB,
	GameStatus as GameStatus_DB,
} from '@prisma/client';
import {
	FileType as FileType_API,
	GameStatus as GameStatus_API,
} from '@flaggle/flaggle-api-schemas';
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
			Status: 'InProgress',
		},
		select: {
			ExternalRef: true,
		},
	});

	const startingFlagChunk = getRandomItem(country.Flag.Chunks);

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
		flag: {
			externalRef: country.Flag.ExternalRef,
			fileType: mapFileType(country.Flag.FileType),
			chunks: country.Flag.Chunks.map((chunk) => {
				const revealed = chunk.Id === startingFlagChunk.Id;
				return {
					revealed,
					fileType: revealed
						? mapFileType(chunk.FileType)
						: undefined,
					externalRef: revealed ? chunk.ExternalRef : undefined,
					position: {
						x: chunk.X,
						y: chunk.Y,
					},
				};
			}),
		},
	};
};

export const updateGame = async (
	request: UpdateGameRequest
): Promise<UpdateGameResponse> => {
	// Fetch the game data
	const game = await getGameByExternalRef(request.gameId);

	if (!game) throw new Error('Bad game ID');

	const mapAnswers = (...answers: typeof game.Answers): Guess[] =>
		answers.map((answer) => ({
			countryId: answer.Country.ExternalRef,
			correct: answer.Country.ExternalRef === game.Country.ExternalRef,
			guessNumber: answer.OrderId,
		}));

	// Convert the answers into objects expected by the API response
	const guesses = mapAnswers(...game.Answers);

	// Convert he chunks to objects expected by the API response
	const flagChunks = game.Country.Flag.Chunks.map((chunk): FlagChunk => {
		const revealed = game.RevealedChunks.some(
			(c) => c.FlagChunk.ExternalRef === chunk.ExternalRef
		);
		return {
			revealed: revealed,
			fileType: revealed
				? mapFileType(game.Country.Flag.FileType)
				: undefined,
			externalRef: revealed ? chunk.ExternalRef : undefined,
			position: {
				x: chunk.X,
				y: chunk.Y,
			},
		};
	});

	const remainingChunks = game.Country.Flag.Chunks.filter(
		(chunk) =>
			!game.RevealedChunks.some(
				(r) => r.FlagChunk.ExternalRef === chunk.ExternalRef
			)
	);

	// If all chunks have been reviewed, the player cannot submit any further answers
	const gameOver = !remainingChunks.length;

	// Record the answer if one was provided
	let status: GameStatus_DB = gameOver ? 'Lost' : 'InProgress';

	const correct =
		!gameOver &&
		!!request.countryId &&
		request.countryId === game.Country.ExternalRef;

	if (correct) status = 'Won';

	let countryName = gameOver || correct ? game.Country.CommonName : undefined;

	if (!gameOver && request.countryId) {
		const latestRevealedChunk = game.RevealedChunks.sort(
			(a, b) => a.OrderId - b.OrderId
		)[game.RevealedChunks.length - 1];

		const latestAnswer = await createAnswerEntity(
			correct,
			game.Answers.length + 1,
			request.countryId,
			game.Id,
			game.PlayerId,
			latestRevealedChunk.Id
		);

		mapAnswers(latestAnswer).forEach((guess) => guesses.push(guess));
	}

	// If the answer was incorrect, or no answer was given, we need to fetch another chunk to serve as the next clue
	if (!gameOver && !correct) {
		const revealChunk = (chunk: typeof remainingChunks[0]) => {
			const next = flagChunks.find(
				(c) => c.position.x === chunk.X && c.position.y == chunk.Y
			);
			if (next) {
				next.revealed = true;
				next.fileType = mapFileType(chunk.FileType);
				next.externalRef = chunk.ExternalRef;
			}
		};

		const getNextChunk = async () => {
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
			return nextChunk;
		};

		if (request.giveUp) {
			status = 'Lost';
			countryName = game.Country.CommonName;
			remainingChunks.forEach((remainingChunk) => {
				revealChunk(remainingChunk);
			});
		} else if (!gameOver) {
			const nextChunk = await getNextChunk();
			revealChunk(nextChunk);
			if (flagChunks.every((c) => c.revealed)) {
				countryName = game.Country.CommonName;
				status = 'Lost';
			}
		}
	}

	if (status !== 'InProgress') {
		await client.game.update({
			data: { Status: status },
			where: { Id: game.Id },
		});
	}

	return {
		status: mapGameStatus(status),
		guesses,
		countryName,
		flag: {
			fileType: mapFileType(game.Country.Flag.FileType),
			externalRef: game.Country.Flag.ExternalRef,
			chunks: flagChunks,
		},
	};
};

const getGameByExternalRef = async (externalRef: string) =>
	await client.game.findFirst({
		where: {
			ExternalRef: externalRef,
		},
		select: {
			Id: true,
			PlayerId: true,
			Country: {
				select: {
					ExternalRef: true,
					CommonName: true,
					Id: true,
					Flag: {
						select: {
							ExternalRef: true,
							FileType: true,
							Chunks: {
								select: {
									FileType: true,
									ExternalRef: true,
									X: true,
									Y: true,
								},
							},
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
					OrderId: true,
					Country: {
						select: {
							ExternalRef: true,
						},
					},
				},
			},
		},
	});

const createAnswerEntity = async (
	correct: boolean,
	orderId: number,
	countryExternalRef: string,
	gameId: number,
	playerId: number,
	lastRevealedChunkId: number
) =>
	await client.answer.create({
		data: {
			OrderId: orderId,
			Correct: correct,
			Country: {
				connect: {
					ExternalRef: countryExternalRef,
				},
			},
			Game: {
				connect: {
					Id: gameId,
				},
			},
			Player: {
				connect: {
					Id: playerId,
				},
			},
			RevealedChunk: {
				connect: {
					Id: lastRevealedChunkId,
				},
			},
		},
		select: {
			Id: true,
			OrderId: true,
			Country: {
				select: {
					ExternalRef: true,
				},
			},
		},
	});

const mapFileType = (fileType: FileType_DB): FileType_API => {
	switch (fileType) {
		case 'PNG':
			return 'png';
		default:
			throw new Error('Unsupported file type');
	}
};

const mapGameStatus = (status: GameStatus_DB): GameStatus_API => {
	switch (status) {
		case 'InProgress':
			return 'in-progress';
		case 'Lost':
			return 'lost';
		case 'Won':
			return 'won';
		default:
			throw new Error('Unsupported game status');
	}
};

const getNextCountry = async (playerId: number) => {
	const nextCountries = await client.country.findMany({
		select: {
			Id: true,
			CommonName: true,
			ExternalRef: true,
			Flag: {
				select: {
					Chunks: true,
					ExternalRef: true,
					FileType: true,
				},
			},
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

const getRandomItem = <T>(items: T[]): T =>
	items[Math.floor(Math.random() * items.length)];

export default {
	createGame,
	updateGame,
};
