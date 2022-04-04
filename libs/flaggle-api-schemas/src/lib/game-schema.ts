import { z } from 'zod';

const fileTypeSchema = z.enum(['png']);

const flagChunkSchema = z.object({
	/**
	 * Whether or not this chunk has been revealed to the player yet.
	 */
	revealed: z.oboolean(),

	/**
	 * The external ref is a pointer to a piece of a flag.
	 * Ths pointer can be shared with the outside world.
	 * It doubles up as the name of the image file.
	 * If the chunk has not been revealed, this will be undefined.
	 */
	externalRef: z.string().optional(),
	fileType: fileTypeSchema,

	/**
	 * The position is relative within the split flag.
	 * The split flag is essentially a grid starting from 0,0
	 */
	position: z.object({
		x: z.number().int().nonnegative(),
		y: z.number().int().nonnegative(),
	}),
});

const flagChunksSchema = z.array(flagChunkSchema);

const flagSchema = z.object({
	externalRef: z.string(),
	fileType: fileTypeSchema,
	chunks: flagChunksSchema,
});

export const createGameRequestSchema = z.object({
	/**
	 * Returning players may already have a playerId allocated,
	 * which would be cached in their browsers local storage,
	 * however we also expect new players who do not yet have a playerId.
	 */
	playerId: z.string().optional(), // TODO: Refine these requirements further, string length etc
});

export const createGameResponseSchema = z.object({
	/**
	 * The ID of the player the game is associated with.
	 * If a valid playerId was specified in the request, this will be the same as it.
	 * Otherwise, it'll be a new ID assigned to assigned to the new player.
	 */
	playerId: z.string(),
	gameId: z.string(),
	flag: flagSchema,
});

export const updateGameRequestSchema = z.object({
	/**
	 * The gameId is the external_ref associated
	 * with the game entity in the DB
	 */
	gameId: z.string(),

	/**
	 * The countryId is the external_ref associated
	 * with the country entity in the DB.
	 * This is the country that the player is guessing the flag belongs to.
	 */
	countryId: z.string(),
});

export const updateGameResponseSchema = z.object({
	/**
	 * Whether or not the country in the corresponding request
	 * was the correct guess.
	 */
	correct: z.boolean(),
	/**
	 * The cumulative guesses during the game.
	 */
	guesses: z.array(
		z.object({
			/**
			 * The ID of the country guessed.
			 */
			countryId: z.string(),
			/**
			 * Whether or not this country was a correct guess
			 */
			correct: z.boolean(),
		})
	),
	flag: flagSchema,
});

export type CreateGameRequest = z.infer<typeof createGameRequestSchema>;
export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;
export type UpdateGameRequest = z.infer<typeof updateGameRequestSchema>;
export type UpdateGameResponse = z.infer<typeof updateGameResponseSchema>;
export type Flag = z.infer<typeof flagSchema>;
export type FlagChunk = z.infer<typeof flagChunkSchema>;
export type FileType = z.infer<typeof fileTypeSchema>;
