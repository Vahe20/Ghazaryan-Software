"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminService, Purchase } from "@/src/services/admin.service";
import { useDebounce } from "@/src/hooks/useDebounce";
import s from "../admin.module.scss";

const STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;
type Status = typeof STATUSES[number];

function StatusBadge({ status }: { status: string }) {
    const cls =
        status === "COMPLETED" ? s.badgeCompleted :
        status === "PENDING"   ? s.badgePending   :
        status === "FAILED"    ? s.badgeFailed     : s.badgeRefunded;
    const dot = { COMPLETED: "🟢", PENDING: "🟡", FAILED: "🔴", REFUNDED: "🔵" }[status] ?? "⚪";
    return <span className={`${s.badge} ${cls}`}>{dot} {status}</span>;
}

function formatDate(d: string) {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

// ── Order detail modal ────────────────────────────────────────────────────────
function OrderDetailModal({ purchase, onClose }: { purchase: Purchase; onClose: () => void }) {
    return (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={s.modal}>
                <div className={s.modalHeader}>
                    <h2>Order Details</h2>
                    <button className={s.modalClose} onClick={onClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </button>
                </div>
                <div className={s.modalBody}>
                    <div className={s.formGrid}>
                        <div className={s.formGroup}>
                            <span className={s.formLabel}>Order ID</span>
                            <code style={{ fontSize: "12px", color: "var(--text-tertiary, #8a8d91)", wordBreak: "break-all" }}>{purchase.id}</code>
                        </div>
                        <div className={s.formGroup}>
                            <span className={s.formLabel}>Status</span>
                            <div><StatusBadge status={purchase.status} /></div>
                        </div>
                        <div className={s.formGroup}>
                            <span className={s.formLabel}>Customer</span>
                            <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary, #e4e6eb)" }}>{purchase.user.userName}</p>
                            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-tertiary, #8a8d91)" }}>{purchase.user.email}</p>
                        </div>
                        <div className={s.formGroup}>
                            <span className={s.formLabel}>Application</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className={s.appIcon}><img src={purchase.app.iconUrl} alt={purchase.app.name} /></div>
                                <span style={{ fontWeight: 600, color: "var(--text-primary, #e4e6eb)" }}>{purchase.app.name}</span>
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <span className={s.formLabel}>Amount</span>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: "18px", color: "var(--text-primary, #e4e6eb)" }}>{Number(purchase.price).toLocaleString()} AMD</p>
                        </div>
                        <div className={s.formGroup}>
                            <span className={s.formLabel}>Payment Method</span>
                            <p style={{ margin: 0, color: "var(--text-secondary, #b0b3b8)" }}>{purchase.paymentMethod ?? "—"}</p>
                        </div>
                        <div className={s.formGroup}>
                            <span className={s.formLabel}>Date</span>
                            <p style={{ margin: 0, color: "var(--text-secondary, #b0b3b8)" }}>{formatDate(purchase.purchasedAt)}</p>
                        </div>
                        {purchase.transactionId && (
                            <div className={s.formGroup}>
                                <span className={s.formLabel}>Transaction ID</span>
                                <code style={{ fontSize: "12px", color: "var(--text-tertiary, #8a8d91)", wordBreak: "break-all" }}>{purchase.transactionId}</code>
                            </div>
                        )}
                    </div>
                </div>
                <div className={s.modalFooter}>
                    <button className={s.btnSecondary} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null);

    const debouncedSearch = useDebounce(search, 400);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getPurchases({
                page,
                limit: 15,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
            });
            setPurchases(data.purchases);
            setPagination(data.pagination);
        } catch {
            setError("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

    const totalRevenue = purchases
        .filter(p => p.status === "COMPLETED")
        .reduce((sum, p) => sum + Number(p.price), 0);

    return (
        <div className={s.page}>
            {/* Header */}
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Orders</h1>
                    <p className={s.pageSubtitle}>{pagination.total} total orders · {totalRevenue.toLocaleString()} AMD revenue on this page</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className={s.toolbar}>
                <div className={s.searchBox}>
                    <svg className={s.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        className={s.searchInput}
                        placeholder="Search by user or app..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select className={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className={s.tableCard}>
                {loading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading orders...</p></div>
                ) : error ? (
                    <div className={s.errorState}><p>{error}</p></div>
                ) : purchases.length === 0 ? (
                    <div className={s.empty}><p>No orders found</p></div>
                ) : (
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th className={s.tableTh}>Customer</th>
                                <th className={s.tableTh}>Application</th>
                                <th className={s.tableTh}>Amount</th>
                                <th className={s.tableTh}>Status</th>
                                <th className={s.tableTh}>Method</th>
                                <th className={s.tableTh}>Date</th>
                                <th className={s.tableTh}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map(p => (
                                <tr key={p.id} className={s.tableTr}>
                                    <td className={s.tableTd}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div className={s.avatar}>
                                                {p.user.avatarUrl
                                                    ? <img src={p.user.avatarUrl} alt={p.user.userName} />
                                                    : p.user.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary, #e4e6eb)" }}>{p.user.userName}</p>
                                                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-tertiary, #8a8d91)" }}>{p.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={s.tableTd}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div className={s.appIcon}><img src={p.app.iconUrl} alt={p.app.name} /></div>
                                            <span style={{ fontWeight: 500 }}>{p.app.name}</span>
                                        </div>
                                    </td>
                                    <td className={s.tableTd}>
                                        <span style={{ fontWeight: 700, color: "var(--text-primary, #e4e6eb)" }}>
                                            {Number(p.price).toLocaleString()} AMD
                                        </span>
                                    </td>
                                    <td className={s.tableTd}><StatusBadge status={p.status} /></td>
                                    <td className={s.tableTd}>{p.paymentMethod ?? "—"}</td>
                                    <td className={s.tableTd} style={{ whiteSpace: "nowrap" }}>{formatDate(p.purchasedAt)}</td>
                                    <td className={s.tableTd}>
                                        <button className={s.btnEdit} onClick={() => setSelectedOrder(p)}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className={s.pagination}>
                        <span className={s.paginationInfo}>
                            Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
                        </span>
                        <div className={s.paginationButtons}>
                            <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pg = i + Math.max(1, Math.min(page - 2, pagination.totalPages - 4));
                                return <button key={pg} onClick={() => setPage(pg)} className={`${s.pageBtn} ${pg === page ? s.pageBtnActive : ""}`}>{pg}</button>;
                            })}
                            <button className={s.pageBtn} disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedOrder && <OrderDetailModal purchase={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
}
