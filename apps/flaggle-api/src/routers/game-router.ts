import {
	createGameRequestSchema,
	updateGameRequestSchema,
} from '@flaggle/flaggle-api-schemas';
import { Router } from 'express';
import gameController from '../controllers/game-controller';
import validationMiddleware, {
	setDataSource,
} from '../middleware/validation-middleware';

export default Router()
	/**
	 * POST /game/
	 * Called when the webpage intially loads.
	 * Purpose is to initialise a new game for the player
	 */
	.post(
		'/',
		validationMiddleware(createGameRequestSchema, setDataSource('body')),
		gameController.createGame
	)

	/**
	 * PUT /game/
	 * Called when the player provides a guess/answer during a game.
	 * Purpose is to check the answer and return the appropriate response.
	 */
	.put(
		'/',
		validationMiddleware(updateGameRequestSchema, setDataSource('body')),
		gameController.updateGame
	);
