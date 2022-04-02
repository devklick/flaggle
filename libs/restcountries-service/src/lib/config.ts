import { Method } from 'axios';

interface RestCountriesConfig {
  baseUrl: string;
  endpoints: RestCountriesEndpointsConfig;
}

type Endpoint = 'getAll';

type RestCountriesEndpointsConfig = {
  [key in Endpoint]: RestCountriesEndpointConfig;
};

type RestCountriesEndpointConfig = {
  route: string;
  method: Method;
};

const config: RestCountriesConfig = {
  baseUrl:
    process.env?.REST_COUNTRIES_BASE_URL ?? 'https://restcountries.com/v3.1',
  endpoints: {
    getAll: {
      route: 'all',
      method: 'GET',
    },
  },
};

export default config;
