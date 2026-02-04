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
	user: User;
}

export const AuthService = {
	register(form: RegRequest) {
		return Axios.post<RegResponse>("/auth/register", form)
			.then(res => res.data);
	},

	login(form: LoginRequest) {
		return Axios.post<LoginResponse>("/auth/login", form)
			.then(res => res.data);
	},

	me() {
		return Axios.get<User>("/auth/me")
			.then(res => res.data);
	}
};
