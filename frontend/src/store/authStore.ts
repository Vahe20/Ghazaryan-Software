import { create } from "zustand";
import { User } from "../types/Entities";
import { Axios } from "../config/Axios";

interface AuthState {
	user: User | null;
	loading: boolean;
	isInitialized: boolean;
	setUser: (user: User | null) => void;
	setLoading: (loading: boolean) => void;
	fetchUser: () => Promise<void>;
	logout: () => void;
	initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	loading: false,
	isInitialized: false,

	setUser: user => set({ user }),

	setLoading: loading => set({ loading }),

	fetchUser: async () => {
		try {
			set({ loading: true });

			const token = localStorage.getItem("token");

			if (!token) {
				set({ user: null, loading: false });
				return;
			}

			const response = await Axios.get<User>("/auth/me");
			set({ user: response.data });
		} catch (error) {
			console.error("Failed to fetch user:", error);
			set({ user: null });

			localStorage.removeItem("token");
		} finally {
			set({ loading: false });
		}
	},

	logout: async () => {
		set({ user: null });
		await localStorage.removeItem("token");
	},

	initialize: async () => {
		if (get().isInitialized) return;

		set({ isInitialized: true });
		await get().fetchUser();
	},
}));
