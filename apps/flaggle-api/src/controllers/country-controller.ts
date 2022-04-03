import { countryService } from '@flaggle/flaggle-game-service';
import { ActionMethod, respond } from './types';

export const getCountries: ActionMethod = async (req, res) => {
	const countries = await countryService.getCountries();
	return respond(res, 200, countries);
};

export default {
	getCountries,
};
