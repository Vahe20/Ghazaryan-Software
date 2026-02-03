import { Axios } from "../config/Axios";
import { User } from "../types/Entities";

interface RegRequest {
	email: string;
	userName: string;
	password: string;
}

interface RegResponse {
	user: User;
}

interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}

export const AuthService = {
	register: async (form: RegRequest): Promise<RegResponse> => {
		const response = await Axios.post<RegResponse>("/auth/register", form);
		return response.data;
	},

	login: async (form: LoginRequest): Promise<LoginResponse> => {
		const response = await Axios.post<LoginResponse>("/auth/login", form);

		if (response.data.accessToken) {
			localStorage.setItem("token", response.data.accessToken);
		}

		return response.data;
	},

	me: async (): Promise<User> => {
		const response = await Axios.get<User>("/auth/me");
		return response.data;
	},

	logout: async (): Promise<void> => {
		localStorage.removeItem("token");
	},
};
