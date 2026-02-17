"use client";

import { useState, useCallback } from "react";

export const usePagination = (initialPage: number = 1) => {
	const [currentPage, setCurrentPage] = useState(initialPage);

	const goToPage = useCallback((page: number) => {
		const newPage = Math.max(1, Math.min(page));
		setCurrentPage(newPage);
	}, []);

	const resetPage = useCallback(() => {
		setCurrentPage(initialPage);
	}, [initialPage]);

	return {
		currentPage,
		goToPage,
		resetPage,
	};
};
