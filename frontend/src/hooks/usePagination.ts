"use client";

import { useState, useCallback } from "react";

export function usePagination(initialPage = 1) {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const goToPage = useCallback((page: number, totalPages?: number) => {
        const max = totalPages ?? Infinity;
        setCurrentPage(Math.max(1, Math.min(page, max)));
    }, []);

    const resetPage = useCallback(() => setCurrentPage(initialPage), [initialPage]);

    return { currentPage, goToPage, resetPage };
}
