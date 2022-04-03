import { z } from 'zod';

export interface Message {
	message: string;
}

const flagChunksSchema = z.array(
	z.object({
		/**
		 * The external ref is a pointer to a piece of a flag.
		 * Ths pointer can be shared with the outside world.
		 * It doubles up as the name of the image file.
		 */
		externalRef: z.string(),
		/**
		 * The position is relative within the split flag.
		 * The split flag is essentially a grid starting from 0,0
		 */
		position: z.object({
			x: z.number().int().nonnegative(),
			y: z.number().int().nonnegative(),
		}),
	})
);

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
	revealedChunks: flagChunksSchema,
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
	correct: z.boolean(),
	guesses: z.array(
		z.object({
			countryId: z.string(),
			correct: z.boolean(),
		})
	),
	revealedChunks: flagChunksSchema,
});

export type CreateGameRequest = z.infer<typeof createGameRequestSchema>;
export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;
export type UpdateGameRequest = z.infer<typeof updateGameRequestSchema>;
export type UpdateGameResponse = z.infer<typeof updateGameResponseSchema>;

/*
CREATE - REQUEST
	playerId: string

CREATE - RESPONSE:
	playerId: string
	gameId: string
	flagChunks: [
		{
			externalRef: string, 
			position: { x: number. y: number},
		}
	],
*/

/*
UPDATE - REQUEST:
	gameId: string
	playerId: string
	countryId: string

UPDATE - RESPONSE
	result: boolean
	guesses: [
		{
			countryId: string,`
			correct: bool
		}
	],
	flagChunks: [
		{
			chunkId: string, 
			position: { x: number. y: number},
		}
	],
*/