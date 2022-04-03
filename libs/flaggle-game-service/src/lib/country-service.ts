import { GetCountriesResponse } from '@flaggle/flaggle-api-schemas';
import { client } from '@flaggle/flaggle-db';

export const getCountries = async (): Promise<GetCountriesResponse> => {
	const countries = await client.country.findMany({
		select: {
			CommonName: true,
			ExternalRef: true,
		},
	});

	return countries.map((country) => ({
		countryId: country.ExternalRef,
		name: country.CommonName,
	}));
};

export default {
	getCountries,
};
