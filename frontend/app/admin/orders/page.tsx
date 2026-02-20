"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminService, Purchase } from "@/src/services/admin.service";
import { useDebounce } from "@/src/hooks/useDebounce";
import OrderDetailModal from "@/src/components/admin/orders/OrderDetailModal/OrderDetailModal";
import OrdersTable from "@/src/components/admin/orders/OrdersTable/OrdersTable";
import OrdersToolbar from "@/src/components/admin/orders/OrdersToolbar/OrdersToolbar";
import Pagination from "@/src/components/admin/shared/Pagination/Pagination";
import s from "../admin.module.scss";

export default function AdminOrdersPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);

    const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 400);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getPurchases({
                page, limit: 15,
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

    const openDetail = (p: Purchase) => { setSelectedOrder(p); setDetailModalOpen(true); };

    const totalRevenue = purchases
        .filter(p => p.status === "COMPLETED")
        .reduce((sum, p) => sum + Number(p.price), 0);

    return (
        <div className={s.page}>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Orders</h1>
                    <p className={s.pageSubtitle}>{pagination.total} total orders · {totalRevenue.toLocaleString()} AMD revenue on this page</p>
                </div>
            </div>

            <OrdersToolbar
                search={search}
                statusFilter={statusFilter}
                onSearchChange={setSearch}
                onStatusChange={setStatusFilter}
            />

            <div className={s.tableCard}>
                {loading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading orders...</p></div>
                ) : error ? (
                    <div className={s.errorState}><p>{error}</p></div>
                ) : purchases.length === 0 ? (
                    <div className={s.empty}><p>No orders found</p></div>
                ) : (
                    <OrdersTable purchases={purchases} onView={openDetail} />
                )}
                {!loading && (
                    <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
                )}
            </div>

            <OrderDetailModal
                isOpen={detailModalOpen}
                purchase={selectedOrder}
                onClose={() => setDetailModalOpen(false)}
            />
        </div>
    );
}
