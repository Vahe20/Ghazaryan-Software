import s from "./Pagination.module.scss";

interface PaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit?: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, limit = 15, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className={s.pagination}>
            <span className={s.paginationInfo}>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className={s.paginationButtons}>
                <button className={s.pageBtn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = i + Math.max(1, Math.min(page - 2, totalPages - 4));
                    return (
                        <button
                            key={pg}
                            onClick={() => onPageChange(pg)}
                            className={`${s.pageBtn} ${pg === page ? s.pageBtnActive : ""}`}
                        >
                            {pg}
                        </button>
                    );
                })}
                <button className={s.pageBtn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
