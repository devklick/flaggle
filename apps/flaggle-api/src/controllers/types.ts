import { Request, Response } from 'express';

export type ActionMethod = (
	request: Request,
	response: Response
) => Promise<void>;

export const respond = <T>(
	response: Response,
	status: number,
	payload?: T
): void => {
	response.status(status).send(payload);
};
