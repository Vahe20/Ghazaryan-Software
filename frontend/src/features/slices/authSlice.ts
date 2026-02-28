import { PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/src/types/Entities";
import { createAppSlice } from "@/src/app/createAppSlice";

type AuthState = {
	user: User | null;
	isInitialized: boolean;
};

const initialState: AuthState = {
	user: null,
	isInitialized: false,
};

export const authSlice = createAppSlice({
	name: "auth",
	initialState,
	reducers: create => ({
		logout: create.asyncThunk(
			async () => {
				localStorage.removeItem("token");
			},
			{
				fulfilled: state => {
					state.user = null;
				},
			},
		),
		setUser: create.reducer((state, action: PayloadAction<User | null>) => {
			state.user = action.payload;
		}),
		setInitialized: create.reducer((state, action: PayloadAction<boolean>) => {
			state.isInitialized = action.payload;
		}),
	}),
	selectors: {
		user: state => state.user,
		isInitialized: state => state.isInitialized,
	},
});

export const { logout, setUser, setInitialized } = authSlice.actions;
export const { user, isInitialized } = authSlice.selectors;
