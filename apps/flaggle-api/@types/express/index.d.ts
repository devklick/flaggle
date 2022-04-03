import * as express from 'express';

declare global {
	namespace Express {
		interface Request {
			/**
			 * Allows the validated payload to be attached to the request object.
			 * This is taken care of by the validation middleware.
			 * Ideally we'd avoid the use of `any`, but it doesnt seem possible
			 * to pass generic types down to this level.
			 */
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			validatedData: any;
		}
	}
}
