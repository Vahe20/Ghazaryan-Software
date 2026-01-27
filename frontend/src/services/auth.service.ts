import { Axios } from "../config/Axios";
import { User } from "../types/entities";

interface regRequest {
	email: string;
	userName: string;
	fullName: string;
	password: string;
}

interface regResponse {
	user: User;
}

interface logRequest {
	email: string;
	password: string;
}

interface logResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}

export const AuthService = {
	register: async (form: regRequest) => {
		return await Axios.post<regResponse>("/auth/register", form);
	},

	login: async (form: logRequest) => {
		return await Axios.post<logResponse>("/auth/login", form);
	},
};
