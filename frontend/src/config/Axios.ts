import axios from "axios";

export const BASE = "http://192.168.1.14:4000/api";

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