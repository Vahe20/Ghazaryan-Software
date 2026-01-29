import axios from "axios";
import { authService } from "../../../../SocialNetwork/social-network-front/src/services/authService";

export const BASE = "http://localhost:4000/api";

export const Axios = axios.create({
	baseURL: BASE,
});

Axios.interceptors.request.use(config => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

Axios.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			authService.refresh();
		}
		return Promise.reject(error);
	},
);
