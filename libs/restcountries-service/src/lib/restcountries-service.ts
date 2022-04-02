import axios from 'axios';
import { Country } from './api-models';
import config from './config';
import StatusCode from 'status-code-enum';

const api = axios.create({
  baseURL: config.baseUrl,
});

const getAllContries = async (): Promise<Country[]> => {
  console.info(config.endpoints.getAll.method);
  console.info(config.endpoints.getAll.route);
  const result = await api.request<Country[]>({
    method: config.endpoints.getAll.method,
    url: config.endpoints.getAll.route,
  });
  if (result.status === StatusCode.SuccessOK) {
    return result.data;
  }
  throw new Error(`Error fetching countries\n${result.status}\n${result.data}`);
};

export default {
  getAllContries,
};
