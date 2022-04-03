import flaggleGameService from '@flaggle/flaggle-game-service';
import { ActionMethod, respond } from './types';

export const createGame: ActionMethod = async (req, res) => {
	const result = await flaggleGameService.createGame(req.validatedData);
	return respond(res, 200, result);
};

export const updateGame: ActionMethod = async (req, res) => {
	const result = await flaggleGameService.updateGame(req.validatedData);
	return respond(res, 200, result);
};

export default {
	createGame,
	updateGame,
};
