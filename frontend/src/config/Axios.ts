import axios from "axios";

export const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
	(response) => {
		const rateLimitInfo = {
			limit: response.headers['ratelimit-limit'],
			remaining: response.headers['ratelimit-remaining'],
			reset: response.headers['ratelimit-reset'],
		};

		if (rateLimitInfo.remaining) {
			console.debug('Rate Limit Info:', rateLimitInfo);
		}

		return response;
	},
	(error) => {
		if (error.response?.status === 429) {
			const resetTime = error.response.headers['ratelimit-reset'];
			const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
			
			const message = resetDate 
				? `Too many requests. Please try again at ${resetDate.toLocaleTimeString()}`
				: 'Too many requests. Please try again later.';

			console.error('Rate Limit Exceeded:', message);
			
			return Promise.reject({
				isRateLimitError: true,
				message,
				resetTime,
				originalError: error,
			});
		}

		return Promise.reject(error);
	}
);
