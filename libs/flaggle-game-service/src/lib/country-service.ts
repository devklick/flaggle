import { client } from '@flaggle/flaggle-db';

export const getCountries = async () => {
	return await client.country.findMany({
		select: {
			CommonName: true,
			ExternalRef: true,
		},
	});
};

export default {
	getCountries,
};
