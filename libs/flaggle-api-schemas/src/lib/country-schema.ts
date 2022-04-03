import { z } from 'zod';

export const countrySchema = z.object({
	name: z.string(),
	countryId: z.string(),
});

export const getCountriesResponseSchema = z.array(countrySchema);

export type Country = z.infer<typeof countrySchema>;
export type GetCountriesResponse = z.infer<typeof getCountriesResponseSchema>;
