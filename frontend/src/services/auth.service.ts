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
	rememberMe?: boolean;
}

interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
	rememberMe: boolean;
}

interface RefreshResponse {
	accessToken: string;
	user: User;
}

export const AuthService = {
	register: async (form: RegRequest) => {
		const response = await Axios.post<RegResponse>("/auth/register", form);
		return response.data;
	},

	login: async (form: LoginRequest) => {
		const response = await Axios.post<LoginResponse>("/auth/login", form);

		if (response.data.accessToken) {
			localStorage.setItem("token", response.data.accessToken);
		}
		if (response.data.refreshToken) {
			localStorage.setItem("refreshToken", response.data.refreshToken);
		}

		return response.data;
	},

	refresh: async () => {
		const refreshToken = localStorage.getItem("refreshToken");

		if (!refreshToken) {
			throw new Error("No refresh token available");
		}

		const response = await Axios.post<RefreshResponse>("/auth/refresh", {
			refreshToken,
		});

		if (response.data.accessToken) {
			localStorage.setItem("token", response.data.accessToken);
		}

		return response.data;
	},

	logout: async () => {
		const refreshToken = localStorage.getItem("refreshToken");

		if (refreshToken) {
			try {
				await Axios.post("/auth/logout", { refreshToken });
			} catch (error) {
				console.error("Logout error:", error);
			}
		}

		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
	},

	isAuthenticated: () => {
		return !!localStorage.getItem("token");
	},

	getToken: () => {
		return localStorage.getItem("token");
	},

	getRefreshToken: () => {
		return localStorage.getItem("refreshToken");
	},
};
