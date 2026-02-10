import { create } from "zustand";

interface LibraryState {
	selectedAppId: string | null;
	setSelectedApp: (appId: string | null) => void;
	clearSelection: () => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
	selectedAppId: null,

	setSelectedApp: (appId) => set({ selectedAppId: appId }),

	clearSelection: () => set({ selectedAppId: null }),
}));
