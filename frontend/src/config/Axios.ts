import axios from "axios";

export const BASE = "http://localhost:4000/api";

export const Axios = axios.create({
	baseURL: BASE,
});

// let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	failedQueue = [];
};

Axios.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Axios.interceptors.response.use(
// 	(response) => {
// 		return response;
// 	},
// 	async (error) => {
// 		const originalRequest = error.config;

// 		if (
// 			error.response?.status === 401 &&
// 			!originalRequest._retry &&
// 			!originalRequest.url?.includes("/auth/refresh") &&
// 			!originalRequest.url?.includes("/auth/login")
// 		) {
// 			if (isRefreshing) {
// 				return new Promise((resolve, reject) => {
// 					failedQueue.push({ resolve, reject });
// 				})
// 					.then((token) => {
// 						originalRequest.headers.Authorization = `Bearer ${token}`;
// 						return Axios(originalRequest);
// 					})
// 					.catch((err) => {
// 						return Promise.reject(err);
// 					});
// 			}

// 			originalRequest._retry = true;
// 			isRefreshing = true;

// 			const refreshToken = localStorage.getItem("refreshToken");

// 			if (!refreshToken) {
// 				localStorage.removeItem("token");
// 				localStorage.removeItem("refreshToken");
// 				window.location.href = "/auth";
// 				return Promise.reject(error);
// 			}

// 			try {
// 				const response = await axios.post(`${BASE}/auth/refresh`, {
// 					refreshToken,
// 				});

// 				const { accessToken } = response.data;

// 				localStorage.setItem("token", accessToken);

// 				Axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
// 				originalRequest.headers.Authorization = `Bearer ${accessToken}`;

// 				processQueue(null, accessToken);

// 				return Axios(originalRequest);
// 			} catch (refreshError) {
// 				processQueue(refreshError as Error, null);
				
// 				localStorage.removeItem("token");
// 				localStorage.removeItem("refreshToken");
// 				window.location.href = "/auth";
				
// 				return Promise.reject(refreshError);
// 			} finally {
// 				isRefreshing = false;
// 			}
// 		}

// 		return Promise.reject(error);
// 	}
// );
