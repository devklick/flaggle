import {
	CreateGameRequest,
	CreateGameResponse,
	GetCountriesResponse,
	UpdateGameRequest,
	UpdateGameResponse,
} from '@flaggle/flaggle-api-schemas';
import axios, { AxiosRequestConfig } from 'axios';
import { Console } from 'console';
import config from './config';

const api = axios.create({
	baseURL: config.flaggleApiBaseUrl,
});

export const getCountries = async (): Promise<GetCountriesResponse> => {
	const result = await api.request<GetCountriesResponse>({
		url: '/country',
		method: 'GET',
	});
	if (result.status === 200) {
		return result.data;
	}
	throw new Error('Unable to fetch countries from flaggle API');
};

export const createGame = async (
	data?: CreateGameRequest
): Promise<CreateGameResponse> => {
	const request: AxiosRequestConfig<CreateGameRequest> = {
		url: '/game',
		method: 'POST',
		data,
	};
	const result = await api.request<CreateGameResponse>(request);

	if (result.status === 200) {
		return result.data;
	}
	throw new Error('Unable to subit game update to flaggle API');
};

export const submitAnswer = async (
	data: UpdateGameRequest
): Promise<UpdateGameResponse> => {
	const request: AxiosRequestConfig<UpdateGameRequest> = {
		url: '/game',
		method: 'PUT',
		data,
	};
	const result = await api.request<UpdateGameResponse>(request);

	if (result.status === 200) {
		return result.data;
	}
	throw new Error('Unable to subit game update to flaggle API');
};

export default {
	getCountries,
	createGame,
	submitAnswer,
};
