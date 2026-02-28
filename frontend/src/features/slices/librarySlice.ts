import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/src/app/createAppSlice";

type LibraryState = {
	selectedAppId: string | null;
}

const initialState: LibraryState = {
	selectedAppId: null,
};

export const librarySlice = createAppSlice({
	name: "library",
	initialState,
	reducers: create => ({
		setSelectedApp: create.reducer((state, action: PayloadAction<string | null>) => {
			state.selectedAppId = action.payload;
		}),
		clearSelection: create.reducer((state) => {
			state.selectedAppId = null;
		})
	}),
	selectors: {
		selectedAppId: state => state.selectedAppId
	}
});

export const { setSelectedApp, clearSelection } = librarySlice.actions;
export const { selectedAppId } = librarySlice.selectors;
