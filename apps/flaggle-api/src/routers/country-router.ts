import { Router } from 'express';
import countryController from '../controllers/country-controller';

export default Router()
	/**
	 * GET /country
	 * Fetches all countries
	 */
	.get('/', countryController.getCountries);
