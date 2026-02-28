import {
	Action,
	combineReducers,
	configureStore,
	ThunkAction,
} from "@reduxjs/toolkit";
import { authSlice } from "../features/slices/authSlice";
import { librarySlice } from "../features/slices/librarySlice";
import { api } from "../features/api/baseApi";
import { setupListeners } from "@reduxjs/toolkit/query";

const rootReducer = combineReducers({
	auth: authSlice.reducer,
	library: librarySlice.reducer,
	[api.reducerPath]: api.reducer,
});
export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) => {
	const store = configureStore({
		reducer: rootReducer,
		middleware: getDefaultMiddleware => {
			return getDefaultMiddleware().concat(api.middleware);
		},
		preloadedState,
	});
	setupListeners(store.dispatch);
	return store;
};

export const store = makeStore();

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
	ThunkReturnType,
	RootState,
	unknown,
	Action
>;
