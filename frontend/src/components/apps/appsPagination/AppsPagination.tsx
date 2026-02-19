"use client";

import { memo, useCallback, useMemo } from "react";
import style from "./AppsPagination.module.scss";

interface AppsPaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export const AppsPagination = memo(function AppsPagination({
    totalPages,
    currentPage,
    onPageChange,
}: AppsPaginationProps) {
    if (totalPages <= 1) return null;

    const handlePageChange = useCallback(
        (page: number) => {
            if (page >= 1 && page <= totalPages) {
                onPageChange(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        },
        [totalPages, onPageChange]
    );

    const handlePrev = useCallback(
        () => handlePageChange(currentPage - 1),
        [handlePageChange, currentPage]
    );

    const handleNext = useCallback(
        () => handlePageChange(currentPage + 1),
        [handlePageChange, currentPage]
    );

    // Пересчитывается только при смене currentPage / totalPages
    const pages = useMemo(() => {
        const result: (number | "...")[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) result.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) result.push(i);
            result.push("...");
            result.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            result.push(1);
            result.push("...");
            for (let i = totalPages - 3; i <= totalPages; i++) result.push(i);
        } else {
            result.push(1);
            result.push("...");
            result.push(currentPage - 1, currentPage, currentPage + 1);
            result.push("...");
            result.push(totalPages);
        }

        return result;
    }, [currentPage, totalPages]);

    return (
        <div className={style.pagination}>
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={style.navButton}
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 16L6 10L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Previous
            </button>

            <div className={style.pageNumbers}>
                {pages.map((pageNum, index) =>
                    pageNum === "..." ? (
                        <span key={`ellipsis-${index}`} className={style.ellipsis}>
                            ...
                        </span>
                    ) : (
                        <PageButton
                            key={pageNum}
                            page={pageNum}
                            isActive={pageNum === currentPage}
                            onClick={handlePageChange}
                        />
                    )
                )}
            </div>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={style.navButton}
            >
                Next
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
});

// Мемоизированная кнопка страницы — не перерендеривается если page/isActive не изменились
const PageButton = memo(function PageButton({
    page,
    isActive,
    onClick,
}: {
    page: number;
    isActive: boolean;
    onClick: (page: number) => void;
}) {
    const handleClick = useCallback(() => onClick(page), [onClick, page]);
    return (
        <button
            onClick={handleClick}
            className={`${style.pageButton} ${isActive ? style.active : ""}`}
        >
            {page}
        </button>
    );
});
