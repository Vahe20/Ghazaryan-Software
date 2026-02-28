"use client";

import { useState } from "react";
import { Purchase } from "@/src/types/Admin";
import { useGetAdminPurchasesQuery } from "@/src/features/api/adminApi";
import { useDebounce } from "@/src/hooks/useDebounce";
import OrderDetailModal from "@/src/components/admin/orders/OrderDetailModal/OrderDetailModal";
import OrdersTable from "@/src/components/admin/orders/OrdersTable/OrdersTable";
import OrdersToolbar from "@/src/components/admin/orders/OrdersToolbar/OrdersToolbar";
import Pagination from "@/src/components/admin/shared/Pagination/Pagination";
import s from "../admin.module.scss";

export default function AdminOrdersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 400);

    const { data, isLoading, isError } = useGetAdminPurchasesQuery({
        page,
        limit: 15,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
    });

    const purchases = data?.purchases ?? [];
    const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

    const totalRevenue = purchases
        .filter(p => p.status === "COMPLETED")
        .reduce((sum, p) => sum + Number(p.price), 0);

    const openDetail = (p: Purchase) => { setSelectedOrder(p); setDetailModalOpen(true); };

    return (
        <div className={s.page}>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Orders</h1>
                    <p className={s.pageSubtitle}>{pagination.total} total orders · {totalRevenue.toLocaleString()} USD revenue on this page</p>
                </div>
            </div>

            <OrdersToolbar
                search={search}
                statusFilter={statusFilter}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
            />

            <div className={s.tableCard}>
                {isLoading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading orders...</p></div>
                ) : isError ? (
                    <div className={s.errorState}><p>Failed to load orders</p></div>
                ) : purchases.length === 0 ? (
                    <div className={s.empty}><p>No orders found</p></div>
                ) : (
                    <OrdersTable purchases={purchases} onView={openDetail} />
                )}
                {!isLoading && (
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
