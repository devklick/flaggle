import * as express from 'express';
import { z } from 'zod';

/**
 * The various sources of data from an express request.
 */
export type HttpDataSource = 'body' | 'route' | 'query' | 'session' | 'params';

/**
 * The source of data to be extracted from an HTTP request.
 */
interface IHttpDataSourceProps {
	/**
	 * The source of data to be extracted from an HTTP request.
	 */
	source: HttpDataSource;
	/**
	 * Whether or not the data from the specified source
	 * should be spread into the object to be validated.
	 */
	spread: boolean;
}

/**
 * Convenience function used to create an instance of the `IHttpDataSourceProps` interface.
 * @param source The data source
 * @param spread Whether or not the data from the specified source
 * should be spread into the object to be validated. Defaults to `true`.
 * @returns An instance of instance of the `IHttpDataSourceProps` interface.
 */
export const setDataSource = (
	source: HttpDataSource,
	spread = true
): IHttpDataSourceProps => ({
	source,
	spread,
});

/**
 * Gathers the data from the specified `dataSourceConfigs` and validates
 * it against the specified `schema`.
 *
 * If the data is found to not meet the validation requirements, the middleware
 * will send the API response with a status of 400, and include the errors in the response body.
 *
 * If the data is found to be valid, it gets added to the request on the `validatedData` property.
 *
 * @param schema The zod schema to be used to validate the data
 * @param dataSourceConfigs The source(s) of data, and whether they should be spread (...) or not.
 * For example, if the source is `HttpDataSource.Body` and spread is false, then the data to be validated will
 * have a property called `body` and it's contents will be that of the request body object. Similarly, if the source is HttpDataSource.Params,
 * the data to be validated will have a `params` property and it's contents will be that of request params object.
 *
 * Alternatively, if spread is true, the data will be spread into the route of the object being validated.
 * Similar to the above examples, `HttpDataSource.Body` and spread is true, the properties from the request body will
 * be spread into an object to be validated, rather than being added to the object in a property called `body`.
 * Likewsie, for HttpDataSource.Params, the request params will be spread into the same object to be validated, rather than
 * having the properties from the params object being spread into the object to validated.
 */
const validationMiddleware = <T extends z.ZodType<unknown>>(
	schema: T,
	...dataSourceConfigs: IHttpDataSourceProps[]
): express.RequestHandler => {
	if (!dataSourceConfigs?.length) {
		throw new Error(
			'Invalid configuration of validation middleware. No data source(s) specified.'
		);
	}
	return async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	): Promise<void | express.Response> => {
		const data = getDataFromSources(req, dataSourceConfigs);
		const validation = await schema.safeParseAsync(data);
		if (validation.success !== true) {
			return res.status(400).send(validation.error.errors);
		}
		req.validatedData = validation.data;
		return next();
	};
};

export default validationMiddleware;
const getDataFromSources = (
	req: express.Request,
	sourceConfigs: IHttpDataSourceProps[]
) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let data: any = {};
	sourceConfigs.forEach((config) => {
		const moreData = req[config.source];
		if (config.spread) {
			data = { ...data, ...moreData };
		} else {
			data = { ...data, [config.source]: moreData };
		}
	});
	return data;
};
