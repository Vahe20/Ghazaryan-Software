import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/Entities";
import { AuthService } from "../services/auth.service";

interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
	isInitialized: boolean;

	setUser: (user: User | null) => void;
	setError: (error: string | null) => void;
	fetchUser: () => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	initialize: () => Promise<void>;
	clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			loading: false,
			error: null,
			isInitialized: false,

			setUser: user => set({ user, error: null }),

			setError: error => set({ error }),

			clearError: () => set({ error: null }),

			fetchUser: async () => {
				const { user } = get();

				if (user) return;

				try {
					set({ loading: true, error: null });

					const token = localStorage.getItem("token");

					if (!token) {
						set({ user: null, loading: false });
						return;
					}

					const userData = await AuthService.me();
					set({ user: userData, error: null });
				} catch (error: any) {
					const errorMessage =
						error.response?.data?.message || "Failed to fetch user";

					if (error.response?.status === 401) {
						localStorage.removeItem("token");
						set({
							user: null,
							error: "Session expired. Please login again.",
						});
					} else {
						set({ error: errorMessage });
						console.error("Failed to fetch user:", error);
					}
				} finally {
					set({ loading: false });
				}
			},

			login: async (email: string, password: string) => {
				try {
					set({ loading: true, error: null });

					const { accessToken, user } = await AuthService.login({
						email,
						password,
					});

					localStorage.setItem("token", accessToken);
					set({ user, error: null });
				} catch (error: any) {
					const errorMessage =
						error.response?.data?.message || "Login failed";
					set({ error: errorMessage });
					throw error;
				} finally {
					set({ loading: false });
				}
			},

			logout: async () => {
				try {
					set({ loading: true, error: null });

					localStorage.removeItem("token");
					set({ user: null, error: null });
				} catch (error: any) {
					console.error("Logout error:", error);
					localStorage.removeItem("token");
					set({ user: null });
				} finally {
					set({ loading: false });
				}
			},

			initialize: async () => {
				const { isInitialized, fetchUser } = get();

				if (isInitialized) return;

				set({ isInitialized: true });
				await fetchUser();
			},
		}),
		{
			name: "auth-storage",
			partialize: state => ({
				user: state.user,
			}),
		},
	),
);
