import { z } from 'zod';

export const createAnswerRequestSchema = z.object({
	/**
     * The external ID of the game that the answer is associated with.
     Note that a game is scoped to a player - this ID also lets us know which player is submitting the answer.
     */
	gameId: z.string(),

	/**
	 * The external ID of the country that the player is guesing.
	 */
	countryId: z.string(),
});

export const createAnswerResponseSchema = z.object({
	correct: z.boolean(),
});

export type CreateAnswer = z.infer<typeof createAnswerRequestSchema>;
