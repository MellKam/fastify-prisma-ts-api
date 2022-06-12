import { AxiosResponse } from 'axios';

export class LikeAxiosError extends Error {
	constructor(readonly message: string, readonly response: AxiosResponse) {
		super(message);
	}
}
